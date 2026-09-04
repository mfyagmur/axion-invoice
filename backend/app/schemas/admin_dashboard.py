from datetime import date
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
