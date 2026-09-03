import uuid
from collections import defaultdict
from datetime import date, timedelta
from decimal import ROUND_HALF_UP, Decimal

from sqlalchemy.orm import Session

from app.models.invoice import Invoice, InvoiceCustomer, InvoiceStatus
from app.models.user import User
from app.schemas.dashboard import (
    ActivityPoint,
    CurrencyAmount,
    DashboardChartsResponse,
    DashboardCustomerRow,
    DashboardOverviewResponse,
    KpiCard,
    StatusDistributionSlice,
)
from app.schemas.invoice import InvoiceSummaryResponse

RECENT_INVOICES_LIMIT = 10
TOP_CUSTOMERS_LIMIT = 6


def compute_display_status(invoice: Invoice) -> str:
    """Mirrors InvoiceSummaryResponse.display_status (app/schemas/invoice.py) - keep in sync."""
    if invoice.archived:
        return "archived"
    if invoice.status == InvoiceStatus.CANCELLED:
        return "cancelled"
    if invoice.status == InvoiceStatus.PAID:
        return "paid"
    if invoice.status == InvoiceStatus.SENT or invoice.email_sent_at is not None:
        today = date.today()
        if invoice.due_at is not None:
            if invoice.due_at <= today:
                return "overdue"
        elif invoice.created_at.date() < today:
            return "overdue"
        return "sent"
    return invoice.status.value


def _effective_date(invoice: Invoice) -> date:
    return invoice.issued_at or invoice.created_at.date()


def _local_try_amount(invoice: Invoice) -> Decimal | None:
    if invoice.currency == "TRY":
        return invoice.grand_total.quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)
    if invoice.exchange_rate is None or invoice.exchange_rate == 0:
        return None
    if invoice.payment_currency == "TRY":
        return (invoice.grand_total / invoice.exchange_rate).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)
    return None


def _currency_breakdown(invoices: list[Invoice]) -> list[CurrencyAmount]:
    totals: dict[str, Decimal] = defaultdict(lambda: Decimal("0"))
    counts: dict[str, int] = defaultdict(int)
    for inv in invoices:
        totals[inv.currency] += inv.grand_total
        counts[inv.currency] += 1
    return [
        CurrencyAmount(currency=currency, amount=amount.quantize(Decimal("0.01"), rounding=ROUND_HALF_UP), count=counts[currency])
        for currency, amount in totals.items()
    ]


def _try_trend_pct(invoices: list[Invoice]) -> float | None:
    today = date.today()
    this_month_start = today.replace(day=1)
    last_month_end = this_month_start - timedelta(days=1)
    last_month_start = last_month_end.replace(day=1)

    this_month_total = Decimal("0")
    last_month_total = Decimal("0")
    for inv in invoices:
        if inv.currency != "TRY":
            continue
        eff_date = _effective_date(inv)
        if this_month_start <= eff_date <= today:
            this_month_total += inv.grand_total
        elif last_month_start <= eff_date <= last_month_end:
            last_month_total += inv.grand_total

    if last_month_total == 0:
        return None
    return float((this_month_total - last_month_total) / last_month_total * 100)


def _build_kpi_card(invoices: list[Invoice]) -> KpiCard:
    return KpiCard(
        currency_breakdown=_currency_breakdown(invoices),
        total_count=len(invoices),
        try_amount_trend_pct=_try_trend_pct(invoices),
    )


def get_overview(db: Session, user: User) -> DashboardOverviewResponse:
    invoices = db.query(Invoice).filter(Invoice.user_id == user.id).order_by(Invoice.created_at.desc()).all()

    total_bucket: list[Invoice] = []
    paid_bucket: list[Invoice] = []
    pending_bucket: list[Invoice] = []
    overdue_bucket: list[Invoice] = []
    draft_bucket: list[Invoice] = []

    for inv in invoices:
        display_status = compute_display_status(inv)
        if not inv.archived and display_status != "cancelled":
            total_bucket.append(inv)
        if display_status == "paid":
            paid_bucket.append(inv)
        elif display_status == "sent":
            pending_bucket.append(inv)
        elif display_status == "overdue":
            overdue_bucket.append(inv)
        elif display_status == "draft":
            draft_bucket.append(inv)

    recent_invoices = invoices[:RECENT_INVOICES_LIMIT]

    customers = db.query(InvoiceCustomer).filter(InvoiceCustomer.user_id == user.id).all()
    invoices_by_customer: dict[uuid.UUID, list[Invoice]] = defaultdict(list)
    for inv in invoices:
        invoices_by_customer[inv.customer_id].append(inv)

    customer_rows: list[tuple[Decimal, DashboardCustomerRow]] = []
    for customer in customers:
        customer_invoices = invoices_by_customer.get(customer.id, [])
        invoiced_invoices = [
            inv for inv in customer_invoices if not inv.archived and compute_display_status(inv) != "cancelled"
        ]
        pending_invoices = [inv for inv in invoiced_invoices if compute_display_status(inv) in ("sent", "overdue")]
        if not invoiced_invoices:
            continue
        sort_key = sum(
            (amount for inv in invoiced_invoices if (amount := _local_try_amount(inv)) is not None),
            Decimal("0"),
        )
        customer_rows.append(
            (
                sort_key,
                DashboardCustomerRow(
                    id=customer.id,
                    name=customer.name,
                    customer_type=customer.customer_type,
                    email=customer.email,
                    invoiced_breakdown=_currency_breakdown(invoiced_invoices),
                    pending_breakdown=_currency_breakdown(pending_invoices),
                ),
            )
        )
    customer_rows.sort(key=lambda row: row[0], reverse=True)
    top_customers = [row for _, row in customer_rows[:TOP_CUSTOMERS_LIMIT]]

    return DashboardOverviewResponse(
        total=_build_kpi_card(total_bucket),
        paid=_build_kpi_card(paid_bucket),
        pending=_build_kpi_card(pending_bucket),
        overdue=_build_kpi_card(overdue_bucket),
        draft=_build_kpi_card(draft_bucket),
        recent_invoices=[InvoiceSummaryResponse.model_validate(inv) for inv in recent_invoices],
        top_customers=top_customers,
    )


def _activity_bucket_key(eff_date: date, from_date: date, to_date: date) -> date:
    span_days = (to_date - from_date).days
    if span_days <= 31:
        return eff_date
    if span_days <= 120:
        return eff_date - timedelta(days=eff_date.weekday())
    return eff_date.replace(day=1)


def get_charts(db: Session, user: User, currency: str, from_date: date, to_date: date) -> DashboardChartsResponse:
    invoices = (
        db.query(Invoice)
        .filter(Invoice.user_id == user.id, Invoice.currency == currency)
        .all()
    )
    in_range = [inv for inv in invoices if from_date <= _effective_date(inv) <= to_date]

    status_counts: dict[str, int] = defaultdict(int)
    for inv in in_range:
        status_counts[compute_display_status(inv)] += 1
    status_distribution = [
        StatusDistributionSlice(status=status, count=count) for status, count in status_counts.items()
    ]

    activity_totals: dict[date, Decimal] = defaultdict(lambda: Decimal("0"))
    for inv in in_range:
        bucket_date = _activity_bucket_key(_effective_date(inv), from_date, to_date)
        activity_totals[bucket_date] += inv.grand_total
    activity = [
        ActivityPoint(date=bucket_date, amount=amount.quantize(Decimal("0.01"), rounding=ROUND_HALF_UP))
        for bucket_date, amount in sorted(activity_totals.items())
    ]

    return DashboardChartsResponse(
        currency=currency,
        from_date=from_date,
        to_date=to_date,
        status_distribution=status_distribution,
        activity=activity,
    )
