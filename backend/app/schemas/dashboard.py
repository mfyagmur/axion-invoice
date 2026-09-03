import uuid
from datetime import date
from decimal import Decimal

from pydantic import BaseModel

from app.schemas.invoice import InvoiceSummaryResponse


class CurrencyAmount(BaseModel):
    currency: str
    amount: Decimal
    count: int


class KpiCard(BaseModel):
    currency_breakdown: list[CurrencyAmount]
    total_count: int
    try_amount_trend_pct: float | None


class DashboardCustomerRow(BaseModel):
    id: uuid.UUID
    name: str
    customer_type: str
    email: str | None
    invoiced_breakdown: list[CurrencyAmount]
    pending_breakdown: list[CurrencyAmount]


class DashboardOverviewResponse(BaseModel):
    total: KpiCard
    paid: KpiCard
    pending: KpiCard
    overdue: KpiCard
    draft: KpiCard
    recent_invoices: list[InvoiceSummaryResponse]
    top_customers: list[DashboardCustomerRow]


class StatusDistributionSlice(BaseModel):
    status: str
    count: int


class ActivityPoint(BaseModel):
    date: date
    amount: Decimal
    currency_amounts: dict[str, Decimal] = {}


class TrendPoint(BaseModel):
    date: date
    paid_amounts: dict[str, Decimal] = {}
    total_amounts: dict[str, Decimal] = {}


class CustomerSalesRow(BaseModel):
    id: uuid.UUID
    name: str
    invoice_count: int
    sales_try: Decimal
    paid_try: Decimal
    pending_try: Decimal
    collection_rate_pct: float | None
    sales_share_pct: float | None


class DashboardChartsResponse(BaseModel):
    currency: str
    from_date: date | None
    to_date: date | None
    status_distribution: list[StatusDistributionSlice]
    activity: list[ActivityPoint]
    customer_count: int
    trend: list[TrendPoint]
    customer_sales: list[CustomerSalesRow]
