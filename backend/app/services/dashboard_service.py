import uuid
from collections import defaultdict
from datetime import date, timedelta
from decimal import ROUND_HALF_UP, Decimal
from typing import Literal

from sqlalchemy.orm import Session

from app.models.invoice import Invoice, InvoiceCustomer, InvoiceStatus
from app.models.user import User
from app.schemas.dashboard import (
    ActivityPoint,
    CurrencyAmount,
    CustomerSalesRow,
    DashboardChartsResponse,
    DashboardCustomerRow,
    DashboardOverviewResponse,
    KpiCard,
    StatusDistributionSlice,
    TrendPoint,
)
from app.schemas.invoice import InvoiceSummaryResponse

RECENT_INVOICES_LIMIT = 10
TOP_CUSTOMERS_LIMIT = 5


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


def _trend_bucket_key(eff_date: date, granularity: Literal["daily", "monthly"]) -> date:
    if granularity == "daily":
        return eff_date
    return eff_date.replace(day=1)


def _last_six_months(anchor: date) -> list[date]:
    months: list[date] = []
    year, month = anchor.year, anchor.month
    for _ in range(6):
        months.append(date(year, month, 1))
        month -= 1
        if month == 0:
            month = 12
            year -= 1
    months.reverse()
    return months


def _build_trend(
    in_range: list[Invoice], granularity: Literal["daily", "monthly"], to_date: date | None
) -> list[TrendPoint]:
    totals: dict[date, dict[str, Decimal]] = defaultdict(lambda: defaultdict(lambda: Decimal("0")))
    paid_totals: dict[date, dict[str, Decimal]] = defaultdict(lambda: defaultdict(lambda: Decimal("0")))
    for inv in in_range:
        bucket_date = _trend_bucket_key(_effective_date(inv), granularity)
        totals[bucket_date][inv.currency] += inv.grand_total
        if compute_display_status(inv) == "paid":
            paid_totals[bucket_date][inv.currency] += inv.grand_total

    if granularity == "monthly":
        bucket_dates = _last_six_months(to_date or date.today())
    else:
        bucket_dates = sorted(totals.keys())

    return [
        TrendPoint(
            date=bucket_date,
            total_amounts={
                cur: amt.quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)
                for cur, amt in totals.get(bucket_date, {}).items()
            },
            paid_amounts={
                cur: amt.quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)
                for cur, amt in paid_totals.get(bucket_date, {}).items()
            },
        )
        for bucket_date in bucket_dates
    ]


def _build_customer_sales(db: Session, user: User, in_range: list[Invoice]) -> list[CustomerSalesRow]:
    invoices_by_customer: dict[uuid.UUID, list[Invoice]] = defaultdict(list)
    for inv in in_range:
        invoices_by_customer[inv.customer_id].append(inv)
    if not invoices_by_customer:
        return []

    customers = (
        db.query(InvoiceCustomer)
        .filter(InvoiceCustomer.user_id == user.id, InvoiceCustomer.id.in_(invoices_by_customer.keys()))
        .all()
    )

    rows: list[CustomerSalesRow] = []
    for customer in customers:
        customer_invoices = invoices_by_customer[customer.id]
        sales_try = sum(
            (amount for inv in customer_invoices if (amount := _local_try_amount(inv)) is not None),
            Decimal("0"),
        )
        paid_try = sum(
            (
                amount
                for inv in customer_invoices
                if compute_display_status(inv) == "paid" and (amount := _local_try_amount(inv)) is not None
            ),
            Decimal("0"),
        )
        pending_try = sum(
            (
                amount
                for inv in customer_invoices
                if compute_display_status(inv) in ("sent", "overdue") and (amount := _local_try_amount(inv)) is not None
            ),
            Decimal("0"),
        )
        rows.append(
            CustomerSalesRow(
                id=customer.id,
                name=customer.name,
                invoice_count=len(customer_invoices),
                sales_try=sales_try.quantize(Decimal("0.01"), rounding=ROUND_HALF_UP),
                paid_try=paid_try.quantize(Decimal("0.01"), rounding=ROUND_HALF_UP),
                pending_try=pending_try.quantize(Decimal("0.01"), rounding=ROUND_HALF_UP),
                collection_rate_pct=float(paid_try / sales_try * 100) if sales_try > 0 else None,
                sales_share_pct=None,
            )
        )

    grand_total = sum((row.sales_try for row in rows), Decimal("0"))
    if grand_total > 0:
        for row in rows:
            row.sales_share_pct = float(row.sales_try / grand_total * 100)

    rows.sort(key=lambda row: row.sales_try, reverse=True)
    return rows


def get_charts(
    db: Session,
    user: User,
    currency: str | None,
    from_date: date | None,
    to_date: date | None,
    granularity: Literal["daily", "monthly"] = "monthly",
) -> DashboardChartsResponse:
    query = db.query(Invoice).filter(Invoice.user_id == user.id)
    if currency is not None:
        query = query.filter(Invoice.currency == currency)
    invoices = query.all()
    in_range = [
        inv
        for inv in invoices
        if (from_date is None or from_date <= _effective_date(inv)) and (to_date is None or _effective_date(inv) <= to_date)
    ]

    status_counts: dict[str, int] = defaultdict(int)
    for inv in in_range:
        status_counts[compute_display_status(inv)] += 1
    status_distribution = [
        StatusDistributionSlice(status=status, count=count) for status, count in status_counts.items()
    ]

    effective_dates = [_effective_date(inv) for inv in in_range]
    bucket_from = from_date or (min(effective_dates) if effective_dates else date.today())
    bucket_to = to_date or (max(effective_dates) if effective_dates else date.today())

    activity_totals: dict[date, dict[str, Decimal]] = defaultdict(lambda: defaultdict(lambda: Decimal("0")))
    for inv in in_range:
        bucket_date = _activity_bucket_key(_effective_date(inv), bucket_from, bucket_to)
        activity_totals[bucket_date][inv.currency] += inv.grand_total
    activity = [
        ActivityPoint(
            date=bucket_date,
            amount=sum(currency_totals.values(), Decimal("0")).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP),
            currency_amounts={
                cur: amt.quantize(Decimal("0.01"), rounding=ROUND_HALF_UP) for cur, amt in currency_totals.items()
            },
        )
        for bucket_date, currency_totals in sorted(activity_totals.items())
    ]

    customer_count = len({inv.customer_id for inv in in_range})
    trend = _build_trend(in_range, granularity, to_date)
    customer_sales = _build_customer_sales(db, user, in_range)

    return DashboardChartsResponse(
        currency=currency or "ALL",
        from_date=from_date,
        to_date=to_date,
        status_distribution=status_distribution,
        activity=activity,
        customer_count=customer_count,
        trend=trend,
        customer_sales=customer_sales,
    )
