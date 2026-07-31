import uuid
from datetime import date, datetime
from decimal import Decimal

from pydantic import BaseModel, Field, computed_field, model_validator

from app.models.invoice import InvoiceStatus
from app.schemas.customer import CustomerCreatePayload, CustomerResponse


class LineItemPayload(BaseModel):
    description: str = Field(min_length=1, max_length=500)
    quantity: Decimal = Field(gt=0)
    unit_price: Decimal = Field(ge=0)


class InvoiceCreatePayload(BaseModel):
    template_id: uuid.UUID
    customer_id: uuid.UUID | None = None
    customer: CustomerCreatePayload | None = None
    currency: str = Field(default="TRY", min_length=3, max_length=3)
    tax_total: Decimal = Field(default=Decimal("0"), ge=0)
    field_values: dict[str, str] = Field(default_factory=dict)
    line_items: list[LineItemPayload] = Field(min_length=1)
    issued_at: date | None = None
    due_at: date | None = None

    @model_validator(mode="after")
    def _one_customer_source(self) -> "InvoiceCreatePayload":
        if (self.customer_id is None) == (self.customer is None):
            raise ValueError("customer_id veya customer alanlarından tam olarak biri gönderilmeli")
        return self


class InvoiceLineItemResponse(BaseModel):
    id: uuid.UUID
    description: str
    quantity: Decimal
    unit_price: Decimal

    model_config = {"from_attributes": True}

    @computed_field
    @property
    def line_total(self) -> Decimal:
        return self.quantity * self.unit_price


class InvoiceSummaryResponse(BaseModel):
    id: uuid.UUID
    invoice_number: str
    status: InvoiceStatus
    currency: str
    grand_total: Decimal
    pdf_url: str | None
    issued_at: date | None
    created_at: datetime
    customer: CustomerResponse

    model_config = {"from_attributes": True}


class InvoiceDetailResponse(InvoiceSummaryResponse):
    template_id: uuid.UUID
    data_json: dict[str, str]
    subtotal: Decimal
    tax_total: Decimal
    due_at: date | None
    line_items: list[InvoiceLineItemResponse]
