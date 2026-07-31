import uuid
from decimal import Decimal

from pydantic import BaseModel


class PlanResponse(BaseModel):
    id: uuid.UUID
    key: str
    name: str
    price_monthly: Decimal
    price_yearly: Decimal
    max_invoices_per_month: int | None
    max_templates: int | None

    model_config = {"from_attributes": True}
