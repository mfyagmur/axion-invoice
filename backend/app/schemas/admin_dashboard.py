from datetime import date, datetime
from decimal import Decimal
from typing import Literal

from pydantic import BaseModel

from app.schemas.dashboard import TrendPoint


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
    sent: int
    delivered: int
    opened: int
    clicked: int
    bounced: int


class SmsNotificationStatus(BaseModel):
    delivered: int
    pending: int
    failed: int


class GibGatewayStatus(BaseModel):
    connected: bool
    uptime_pct: float


class AdminDeliveryIntegrationsResponse(BaseModel):
    email_funnel: EmailDeliveryFunnel
    sms_status: SmsNotificationStatus
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


class AdminOperationalMetricsResponse(BaseModel):
    active_users: ActiveUsersStat
    invoices_created_today: int
    packet_usage: list[PacketUsageSlice]
    support_tickets: list[SupportTicket]
