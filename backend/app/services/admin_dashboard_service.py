from collections import defaultdict
from datetime import date, datetime, timedelta, timezone
from decimal import ROUND_HALF_UP, Decimal
from zoneinfo import ZoneInfo

import psutil
from sqlalchemy import text
from sqlalchemy.orm import Session

from app.core.request_metrics import SLOW_REQUEST_THRESHOLD_MS, RequestRecord, get_records
from app.models.audit_log import AuditLog
from app.models.invoice import Invoice, InvoiceDueReminder, InvoicePaymentReminder, InvoiceStatus
from app.models.login_attempt import LoginAttempt, LoginAttemptStatus
from app.models.plan import Plan
from app.models.security_alert import SecurityAlert
from app.models.subscription import Subscription
from app.models.user import User
from app.models.session import UserSession
from app.schemas.admin_dashboard import (
    ActiveUsersStat,
    AdminDeliveryIntegrationsResponse,
    AdminFinancialOverviewResponse,
    AdminOperationalMetricsResponse,
    AdminSystemHealthResponse,
    AuditLogEntry,
    CountWithSparkline,
    CurrencyMtdAmount,
    EmailDeliveryFunnel,
    GibGatewayStatus,
    InvoicesTodayStat,
    LatencyPoint,
    LoginActivityRow,
    PacketUsageSlice,
    PaymentSuccessRate,
    RequestIssueDetail,
    SecurityAlertItem,
    SecurityAlertsResponse,
    SecurityAuditLogsResponse,
    SecurityLoginActivitiesResponse,
    SecurityThreatMapResponse,
    SecurityThreatPoint,
    SlowQueryAlert,
    SlowQueryDetailResponse,
    SparklinePoint,
    SupportTicket,
)
from app.services import security_alert_service
from app.services.dashboard_service import _build_trend, _currency_breakdown, _effective_date, compute_display_status

MAX_LOGIN_ATTEMPT_RECORDS = 200
MAX_LOGIN_ACTIVITY_ROWS = 50
MAX_AUDIT_LOG_ENTRIES = 100

SPARKLINE_DAYS = 14
LOCAL_TZ = ZoneInfo("Europe/Istanbul")
MAX_ISSUE_RECORDS = 50
PLAN_ORDER = ["free", "pro", "business"]


def _date_range(start: date, end: date) -> list[date]:
    return [start + timedelta(days=i) for i in range((end - start).days + 1)]


def _month_bounds(anchor: date) -> tuple[date, date, date, date]:
    this_month_start = anchor.replace(day=1)
    last_month_end = this_month_start - timedelta(days=1)
    last_month_start = last_month_end.replace(day=1)
    return this_month_start, anchor, last_month_start, last_month_end


def get_admin_financial_overview(db: Session) -> AdminFinancialOverviewResponse:
    invoices = (
        db.query(Invoice)
        .join(User, Invoice.user_id == User.id)
        .filter(User.is_demo.is_(False))
        .order_by(Invoice.created_at.desc())
        .all()
    )
    non_cancelled = [inv for inv in invoices if not inv.archived and compute_display_status(inv) != "cancelled"]

    today = date.today()
    this_month_start, _, last_month_start, last_month_end = _month_bounds(today)

    mtd_invoices = [inv for inv in non_cancelled if this_month_start <= _effective_date(inv) <= today]
    last_month_invoices = [inv for inv in non_cancelled if last_month_start <= _effective_date(inv) <= last_month_end]

    mtd_totals: dict[str, Decimal] = defaultdict(lambda: Decimal("0"))
    for inv in mtd_invoices:
        mtd_totals[inv.currency] += inv.grand_total
    last_month_totals: dict[str, Decimal] = defaultdict(lambda: Decimal("0"))
    for inv in last_month_invoices:
        last_month_totals[inv.currency] += inv.grand_total

    total_invoiced_mtd = []
    for currency, amount in mtd_totals.items():
        last_amount = last_month_totals.get(currency, Decimal("0"))
        trend_pct = float((amount - last_amount) / last_amount * 100) if last_amount > 0 else None
        total_invoiced_mtd.append(
            CurrencyMtdAmount(
                currency=currency,
                amount=amount.quantize(Decimal("0.01"), rounding=ROUND_HALF_UP),
                trend_pct=trend_pct,
            )
        )
    total_invoiced_mtd.sort(key=lambda row: row.amount, reverse=True)

    rated = [inv for inv in invoices if not inv.archived and compute_display_status(inv) in ("paid", "sent", "overdue", "cancelled")]
    paid_count = sum(1 for inv in rated if compute_display_status(inv) == "paid")
    pending_count = sum(1 for inv in rated if compute_display_status(inv) == "sent")
    failed_count = sum(1 for inv in rated if compute_display_status(inv) in ("overdue", "cancelled"))
    total_rated = len(rated) or 1
    payment_success_rate = PaymentSuccessRate(
        paid_pct=round(paid_count / total_rated * 100, 1),
        pending_pct=round(pending_count / total_rated * 100, 1),
        failed_pct=round(failed_count / total_rated * 100, 1),
        paid_count=paid_count,
        pending_count=pending_count,
        failed_count=failed_count,
    )

    revenue_trend = _build_trend(non_cancelled, "monthly", today)

    sparkline_start = today - timedelta(days=SPARKLINE_DAYS - 1)

    paid_daily_counts: dict[date, int] = defaultdict(int)
    for inv in non_cancelled:
        if compute_display_status(inv) == "paid":
            eff_date = _effective_date(inv)
            if sparkline_start <= eff_date <= today:
                paid_daily_counts[eff_date] += 1
    paid_sparkline = [SparklinePoint(date=d, count=paid_daily_counts.get(d, 0)) for d in _date_range(sparkline_start, today)]

    paid_mtd_count = sum(1 for inv in mtd_invoices if compute_display_status(inv) == "paid")
    last_month_paid_count = sum(1 for inv in last_month_invoices if compute_display_status(inv) == "paid")
    paid_trend_pct = (
        (paid_mtd_count - last_month_paid_count) / last_month_paid_count * 100 if last_month_paid_count > 0 else None
    )
    paid_invoices_mtd = CountWithSparkline(count=paid_mtd_count, trend_pct=paid_trend_pct, sparkline=paid_sparkline)

    overdue_invoices_list = [inv for inv in non_cancelled if compute_display_status(inv) == "overdue"]
    overdue_daily_counts: dict[date, int] = defaultdict(int)
    for inv in overdue_invoices_list:
        due_date = inv.due_at or _effective_date(inv)
        if sparkline_start <= due_date <= today:
            overdue_daily_counts[due_date] += 1
    overdue_sparkline = [
        SparklinePoint(date=d, count=overdue_daily_counts.get(d, 0)) for d in _date_range(sparkline_start, today)
    ]

    last_month_overdue_count = sum(1 for inv in last_month_invoices if compute_display_status(inv) == "overdue")
    overdue_trend_pct = (
        (len(overdue_invoices_list) - last_month_overdue_count) / last_month_overdue_count * 100
        if last_month_overdue_count > 0
        else None
    )
    overdue_invoices = CountWithSparkline(
        count=len(overdue_invoices_list), trend_pct=overdue_trend_pct, sparkline=overdue_sparkline
    )

    return AdminFinancialOverviewResponse(
        revenue_trend=revenue_trend,
        total_invoiced_mtd=total_invoiced_mtd,
        payment_success_rate=payment_success_rate,
        paid_invoices_mtd=paid_invoices_mtd,
        overdue_invoices=overdue_invoices,
    )


def get_admin_system_health(db: Session) -> AdminSystemHealthResponse:
    records = get_records()

    grouped: dict[datetime, list[RequestRecord]] = defaultdict(list)
    for record in records:
        local_ts = record.timestamp.astimezone(LOCAL_TZ)
        minute = local_ts.replace(second=0, microsecond=0)
        grouped[minute].append(record)

    now_minute = datetime.now(LOCAL_TZ).replace(second=0, microsecond=0)
    minutes = [now_minute - timedelta(minutes=i) for i in range(9, -1, -1)]

    series = []
    for minute in minutes:
        recs = grouped[minute]
        avg_latency = sum(r.duration_ms for r in recs) / len(recs) if recs else 0.0
        error_count = sum(1 for r in recs if r.status_code >= 400)
        is_issue = avg_latency > SLOW_REQUEST_THRESHOLD_MS or error_count > 0
        series.append(
            LatencyPoint(
                time_label=minute.strftime("%H:%M"),
                avg_latency_ms=round(avg_latency, 1),
                error_count=error_count,
                is_issue=is_issue,
            )
        )

    slow_count = sum(1 for r in records if r.duration_ms > SLOW_REQUEST_THRESHOLD_MS)
    server_error_count = sum(1 for r in records if r.status_code >= 500)
    slow_query_alerts = [
        SlowQueryAlert(key="slow_requests", count=slow_count, severity="warning" if slow_count else "ok"),
        SlowQueryAlert(key="server_errors", count=server_error_count, severity="error" if server_error_count else "ok"),
    ]

    try:
        db.execute(text("SELECT 1"))
        database_healthy = True
    except Exception:
        database_healthy = False

    return AdminSystemHealthResponse(
        api_latency_series=series,
        active_server_instances=1,
        avg_cpu_load_pct=psutil.cpu_percent(interval=0.1),
        avg_memory_usage_pct=psutil.virtual_memory().percent,
        database_healthy=database_healthy,
        slow_query_alerts=slow_query_alerts,
    )


def get_admin_slow_query_details() -> SlowQueryDetailResponse:
    records = get_records()

    def _to_detail(record: RequestRecord) -> RequestIssueDetail:
        return RequestIssueDetail(
            timestamp=record.timestamp,
            method=record.method,
            path=record.path,
            status_code=record.status_code,
            duration_ms=round(record.duration_ms, 1),
            is_slow=record.duration_ms > SLOW_REQUEST_THRESHOLD_MS,
            is_error=record.status_code >= 500,
            error_detail=record.error_detail,
        )

    slow_requests = sorted(
        (_to_detail(r) for r in records if r.duration_ms > SLOW_REQUEST_THRESHOLD_MS),
        key=lambda item: item.timestamp,
        reverse=True,
    )[:MAX_ISSUE_RECORDS]
    server_errors = sorted(
        (_to_detail(r) for r in records if r.status_code >= 500),
        key=lambda item: item.timestamp,
        reverse=True,
    )[:MAX_ISSUE_RECORDS]

    return SlowQueryDetailResponse(slow_requests=slow_requests, server_errors=server_errors)


def get_admin_delivery_integrations(db: Session) -> AdminDeliveryIntegrationsResponse:
    invoice_emails_sent = (
        db.query(Invoice)
        .join(User, Invoice.user_id == User.id)
        .filter(User.is_demo.is_(False), Invoice.email_sent_at.isnot(None))
        .count()
    )
    payment_reminders_sent = (
        db.query(InvoicePaymentReminder)
        .join(Invoice, InvoicePaymentReminder.invoice_id == Invoice.id)
        .join(User, Invoice.user_id == User.id)
        .filter(User.is_demo.is_(False), InvoicePaymentReminder.sent_at.isnot(None))
        .count()
    )
    due_reminders_sent = (
        db.query(InvoiceDueReminder)
        .join(Invoice, InvoiceDueReminder.invoice_id == Invoice.id)
        .join(User, Invoice.user_id == User.id)
        .filter(User.is_demo.is_(False), InvoiceDueReminder.sent_at.isnot(None))
        .count()
    )
    sent = invoice_emails_sent + payment_reminders_sent + due_reminders_sent

    draft = (
        db.query(Invoice)
        .join(User, Invoice.user_id == User.id)
        .filter(User.is_demo.is_(False), Invoice.status == InvoiceStatus.DRAFT, Invoice.email_sent_at.is_(None))
        .count()
    )

    email_funnel = EmailDeliveryFunnel(draft=draft, sent=sent, delivered=sent)

    # GİB entegrasyonu sistemde henüz kurulmadı - gerçek altyapı gelene kadar sabit placeholder (bkz. docs/todo.md).
    gib_status = GibGatewayStatus(connected=False, uptime_pct=0.0)

    return AdminDeliveryIntegrationsResponse(email_funnel=email_funnel, gib_status=gib_status)


def get_admin_operational_metrics(db: Session) -> AdminOperationalMetricsResponse:
    today = date.today()
    this_month_start, _, last_month_start, last_month_end = _month_bounds(today)

    total_registered = db.query(User).filter(User.is_demo.is_(False)).count()

    active_30d_cutoff = datetime.now(timezone.utc) - timedelta(days=30)
    active_30d = (
        db.query(UserSession.user_id)
        .join(User, UserSession.user_id == User.id)
        .filter(
            User.is_demo.is_(False),
            UserSession.revoked_at.is_(None),
            UserSession.last_used_at >= active_30d_cutoff,
        )
        .distinct()
        .count()
    )

    new_this_month = (
        db.query(User)
        .filter(User.is_demo.is_(False), User.created_at >= this_month_start, User.created_at <= today + timedelta(days=1))
        .count()
    )
    new_last_month = (
        db.query(User)
        .filter(User.is_demo.is_(False), User.created_at >= last_month_start, User.created_at <= last_month_end + timedelta(days=1))
        .count()
    )
    registration_trend_pct = (
        (new_this_month - new_last_month) / new_last_month * 100 if new_last_month > 0 else None
    )

    active_users = ActiveUsersStat(
        total_registered=total_registered,
        active_30d=active_30d,
        registration_trend_pct=registration_trend_pct,
    )

    day_start = datetime.combine(today, datetime.min.time(), tzinfo=LOCAL_TZ)
    day_end = day_start + timedelta(days=1)
    today_invoices = (
        db.query(Invoice)
        .join(User, Invoice.user_id == User.id)
        .filter(User.is_demo.is_(False), Invoice.created_at >= day_start, Invoice.created_at < day_end)
        .all()
    )
    invoices_created_today = InvoicesTodayStat(
        count=len(today_invoices),
        by_currency=_currency_breakdown(today_invoices),
    )

    plan_counts: dict[str, int] = {key: 0 for key in PLAN_ORDER}
    plan_names: dict[str, str] = {}
    rows = (
        db.query(Plan.key, Plan.name, Subscription.id)
        .join(Subscription, Subscription.plan_id == Plan.id)
        .join(User, Subscription.user_id == User.id)
        .filter(User.is_demo.is_(False))
        .all()
    )
    for plan_key, plan_name, _sub_id in rows:
        plan_counts[plan_key] = plan_counts.get(plan_key, 0) + 1
        plan_names[plan_key] = plan_name

    total_subscribed = sum(plan_counts.values()) or 1
    packet_usage = [
        PacketUsageSlice(
            plan_key=key,
            plan_name=plan_names.get(key, key.capitalize()),
            user_count=plan_counts.get(key, 0),
            pct=round(plan_counts.get(key, 0) / total_subscribed * 100, 1),
        )
        for key in PLAN_ORDER
    ]

    # Destek bilet sistemi henüz kurulmadı - gerçek altyapı gelene kadar örnek sabit veriler (bkz. docs/todo.md).
    support_tickets = [
        SupportTicket(user_name="John Doe", issue="Invoicing gateway sync delay", status="connected", priority="priority"),
        SupportTicket(user_name="John Doe", issue="Recurring invoice generation issue", status="connected", priority="not_priority"),
        SupportTicket(user_name="Ayşe Kaya", issue="PDF export template mismatch", status="connected", priority="priority"),
        SupportTicket(user_name="Mehmet Demir", issue="Bank account not showing on invoice", status="not_connected", priority="not_priority"),
        SupportTicket(user_name="Elif Şahin", issue="Email delivery not confirmed", status="connected", priority="not_priority"),
    ]

    return AdminOperationalMetricsResponse(
        active_users=active_users,
        invoices_created_today=invoices_created_today,
        packet_usage=packet_usage,
        support_tickets=support_tickets,
    )


def get_admin_security_threat_map(db: Session) -> SecurityThreatMapResponse:
    attempts = (
        db.query(LoginAttempt)
        .filter(LoginAttempt.latitude.isnot(None), LoginAttempt.longitude.isnot(None))
        .order_by(LoginAttempt.created_at.desc())
        .limit(MAX_LOGIN_ATTEMPT_RECORDS)
        .all()
    )

    groups: dict[tuple[float, float], dict] = {}
    for attempt in attempts:
        key = (round(attempt.latitude, 1), round(attempt.longitude, 1))
        group = groups.setdefault(
            key,
            {"country": attempt.country, "city": attempt.city, "count": 0, "failed_count": 0},
        )
        group["count"] += 1
        if attempt.status == LoginAttemptStatus.FAILED:
            group["failed_count"] += 1

    points = []
    for (lat, lon), group in groups.items():
        if group["failed_count"] >= security_alert_service.BRUTE_FORCE_THRESHOLD:
            severity = "critical"
        elif group["failed_count"] > 0:
            severity = "high"
        else:
            severity = "medium"
        points.append(
            SecurityThreatPoint(
                latitude=lat,
                longitude=lon,
                severity=severity,
                country=group["country"],
                city=group["city"],
                count=group["count"],
            )
        )

    return SecurityThreatMapResponse(points=points)


def get_admin_security_login_activities(db: Session) -> SecurityLoginActivitiesResponse:
    attempts = (
        db.query(LoginAttempt)
        .order_by(LoginAttempt.created_at.desc())
        .limit(MAX_LOGIN_ACTIVITY_ROWS)
        .all()
    )

    user_ids = {attempt.user_id for attempt in attempts if attempt.user_id is not None}
    users_by_id = {}
    if user_ids:
        for user in db.query(User).filter(User.id.in_(user_ids)).all():
            users_by_id[user.id] = user.full_name

    rows = []
    for attempt in attempts:
        display_name = users_by_id.get(attempt.user_id) if attempt.user_id else None
        location_parts = [part for part in (attempt.city, attempt.country) if part]
        rows.append(
            LoginActivityRow(
                time=attempt.created_at,
                user=display_name or attempt.email,
                location=", ".join(location_parts) if location_parts else None,
                ip=attempt.ip_address,
                status=attempt.status.value,
            )
        )

    return SecurityLoginActivitiesResponse(rows=rows)


def get_admin_security_audit_logs(db: Session, event_type: str | None = None) -> SecurityAuditLogsResponse:
    query = db.query(AuditLog).order_by(AuditLog.created_at.desc())
    if event_type:
        query = query.filter(AuditLog.action == event_type)
    logs = query.limit(MAX_AUDIT_LOG_ENTRIES).all()

    actor_ids = {log.actor_user_id for log in logs if log.actor_user_id is not None}
    users_by_id = {}
    if actor_ids:
        for user in db.query(User).filter(User.id.in_(actor_ids)).all():
            users_by_id[user.id] = user.full_name

    entries = [
        AuditLogEntry(
            id=str(log.id),
            time=log.created_at,
            action=log.action,
            actor=users_by_id.get(log.actor_user_id) if log.actor_user_id else None,
            target_type=log.target_type,
            target_id=log.target_id,
            ip=log.ip_address,
        )
        for log in logs
    ]

    return SecurityAuditLogsResponse(entries=entries)


def get_admin_security_alerts(db: Session) -> SecurityAlertsResponse:
    security_alert_service.sync_security_alerts(db)

    alerts = (
        db.query(SecurityAlert)
        .filter(SecurityAlert.is_resolved.is_(False))
        .order_by(SecurityAlert.created_at.desc())
        .all()
    )

    counts_by_severity: dict[str, int] = {}
    for alert in alerts:
        counts_by_severity[alert.severity.value] = counts_by_severity.get(alert.severity.value, 0) + 1

    return SecurityAlertsResponse(
        alerts=[
            SecurityAlertItem(
                id=str(alert.id),
                severity=alert.severity.value,
                category=alert.category,
                title=alert.title,
                description=alert.description,
                source=alert.source,
                created_at=alert.created_at,
            )
            for alert in alerts
        ],
        counts_by_severity=counts_by_severity,
    )
