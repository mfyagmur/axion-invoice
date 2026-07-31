from datetime import datetime
from typing import Literal

from pydantic import BaseModel

from app.models.subscription import BillingInterval, SubscriptionStatus
from app.schemas.plan import PlanResponse


class SubscriptionResponse(BaseModel):
    plan: PlanResponse
    status: SubscriptionStatus
    billing_interval: BillingInterval | None
    current_period_end: datetime | None
    has_stripe_customer: bool
    invoices_used_this_month: int
    templates_used: int


class CheckoutRequest(BaseModel):
    plan_key: Literal["pro", "business"]
    interval: Literal["monthly", "yearly"]


class CheckoutResponse(BaseModel):
    url: str


class PortalResponse(BaseModel):
    url: str
