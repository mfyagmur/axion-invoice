from datetime import date, datetime
from decimal import Decimal
from typing import Literal

from pydantic import BaseModel

from app.schemas.dashboard import CurrencyAmount, TrendPoint


class CurrencyMtdAmount(BaseModel):
    currency: str
    amount: Decimal
    trend_pct: float | None


class PaymentSuccessRate(BaseModel):
    paid_pct: float
    pending_pct: float
    failed_pct: float
    paid_count: int
    pending_count: int
    failed_count: int


class SparklinePoint(BaseModel):
    date: date
    count: int


class CountWithSparkline(BaseModel):
    count: int
    trend_pct: float | None
    sparkline: list[SparklinePoint]


class AdminFinancialOverviewResponse(BaseModel):
    revenue_trend: list[TrendPoint]
    total_invoiced_mtd: list[CurrencyMtdAmount]
    payment_success_rate: PaymentSuccessRate
    paid_invoices_mtd: CountWithSparkline
    overdue_invoices: CountWithSparkline


class LatencyPoint(BaseModel):
    time_label: str
    avg_latency_ms: float
    error_count: int
    is_issue: bool


class SlowQueryAlert(BaseModel):
    key: Literal["slow_requests", "server_errors"]
    count: int
    severity: Literal["ok", "warning", "error"]


class AdminSystemHealthResponse(BaseModel):
    api_latency_series: list[LatencyPoint]
    active_server_instances: int
    avg_cpu_load_pct: float
    avg_memory_usage_pct: float
    database_healthy: bool
    slow_query_alerts: list[SlowQueryAlert]


class RequestIssueDetail(BaseModel):
    timestamp: datetime
    method: str
    path: str
    status_code: int
    duration_ms: float
    is_slow: bool
    is_error: bool
    error_detail: str | None


class SlowQueryDetailResponse(BaseModel):
    slow_requests: list[RequestIssueDetail]
    server_errors: list[RequestIssueDetail]


class EmailDeliveryFunnel(BaseModel):
    draft: int
    sent: int
    delivered: int


class GibGatewayStatus(BaseModel):
    connected: bool
    uptime_pct: float


class AdminDeliveryIntegrationsResponse(BaseModel):
    email_funnel: EmailDeliveryFunnel
    gib_status: GibGatewayStatus


class ActiveUsersStat(BaseModel):
    total_registered: int
    active_30d: int
    registration_trend_pct: float | None


class PacketUsageSlice(BaseModel):
    plan_key: str
    plan_name: str
    user_count: int
    pct: float


class SupportTicket(BaseModel):
    user_name: str
    issue: str
    status: Literal["connected", "not_connected"]
    priority: Literal["priority", "not_priority"]


class InvoicesTodayStat(BaseModel):
    count: int
    by_currency: list[CurrencyAmount]


class AdminOperationalMetricsResponse(BaseModel):
    active_users: ActiveUsersStat
    invoices_created_today: InvoicesTodayStat
    packet_usage: list[PacketUsageSlice]
    support_tickets: list[SupportTicket]


class SecurityThreatPoint(BaseModel):
    latitude: float
    longitude: float
    severity: Literal["critical", "high", "medium", "normal"]
    country: str | None
    city: str | None
    count: int


class SecurityThreatMapResponse(BaseModel):
    points: list[SecurityThreatPoint]


class LoginActivityRow(BaseModel):
    time: datetime
    user: str
    location: str | None
    ip: str | None
    status: Literal["success", "failed", "suspicious"]


class SecurityLoginActivitiesResponse(BaseModel):
    rows: list[LoginActivityRow]


class AuditLogEntry(BaseModel):
    id: str
    time: datetime
    action: str
    actor: str | None
    target_type: str | None
    target_id: str | None
    ip: str | None


class SecurityAuditLogsResponse(BaseModel):
    entries: list[AuditLogEntry]


class SecurityAlertItem(BaseModel):
    id: str
    severity: Literal["critical", "high", "web_server", "low"]
    category: str
    title: str
    description: str | None
    source: str | None
    created_at: datetime


class SecurityAlertsResponse(BaseModel):
    alerts: list[SecurityAlertItem]
    counts_by_severity: dict[str, int]
