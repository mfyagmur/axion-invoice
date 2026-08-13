import uuid
from datetime import date, datetime
from decimal import ROUND_HALF_UP, Decimal

from pydantic import BaseModel, Field, computed_field

from app.models.invoice import CommissionPayer, InvoicePdfStatus, InvoiceScenario, InvoiceStatus, InvoiceType
from app.schemas.customer import CustomerResponse


class LineItemPayload(BaseModel):
    item_code: str | None = Field(default=None, max_length=100)
    description: str = Field(min_length=1, max_length=500)
    quantity: Decimal = Field(gt=0)
    unit_price: Decimal = Field(ge=0)
    unit: str = Field(default="adet", max_length=20)
    discount_rate: Decimal = Field(default=Decimal("0"), ge=0, le=100)
    tax_rate: Decimal = Field(default=Decimal("0"), ge=0, le=100)
    other_tax_amount: Decimal = Field(default=Decimal("0"), ge=0)


class CustomerSnapshotPayload(BaseModel):
    name: str | None = Field(default=None, max_length=255)
    address: str | None = Field(default=None, max_length=1000)
    city: str | None = Field(default=None, max_length=100)
    postal_code: str | None = Field(default=None, max_length=20)
    country: str | None = Field(default=None, max_length=100)
    tax_office: str | None = Field(default=None, max_length=255)
    tax_number: str | None = Field(default=None, max_length=50)
    email: str | None = Field(default=None, max_length=255)
    phone: str | None = Field(default=None, max_length=50)


class InvoiceUpdatePayload(BaseModel):
    customer_snapshot: CustomerSnapshotPayload | None = None
    notes: str | None = Field(default=None, max_length=2000)
    line_items: list[LineItemPayload] | None = Field(default=None, min_length=1)


class InvoiceCreatePayload(BaseModel):
    template_id: uuid.UUID
    customer_id: uuid.UUID
    currency: str = Field(default="TRY", min_length=3, max_length=3)
    payment_currency: str = Field(default="TRY", min_length=3, max_length=3)
    exchange_rate: Decimal | None = Field(default=None, gt=0)
    invoice_type: InvoiceType = Field(default=InvoiceType.SALE)
    scenario: InvoiceScenario = Field(default=InvoiceScenario.COMMERCIAL)
    commission_payer: CommissionPayer = Field(default=CommissionPayer.SELF)
    recipient_contact_ids: list[uuid.UUID] = Field(default_factory=list, max_length=3)
    field_values: dict[str, str] = Field(default_factory=dict)
    line_items: list[LineItemPayload] = Field(min_length=1)
    notes: str | None = Field(default=None, max_length=2000)
    issued_at: date | None = None
    due_at: date | None = None


class InvoiceLineItemResponse(BaseModel):
    id: uuid.UUID
    item_code: str | None
    description: str
    quantity: Decimal
    unit_price: Decimal
    unit: str
    discount_rate: Decimal
    discount_amount: Decimal
    tax_rate: Decimal
    tax_amount: Decimal
    other_tax_amount: Decimal

    model_config = {"from_attributes": True}

    @computed_field
    @property
    def line_total(self) -> Decimal:
        total = (
            self.quantity * self.unit_price
            - self.discount_amount
            + self.tax_amount
            + self.other_tax_amount
        )
        return total.quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)


class InvoiceSummaryResponse(BaseModel):
    id: uuid.UUID
    invoice_number: str
    status: InvoiceStatus
    currency: str
    payment_currency: str
    exchange_rate: Decimal | None
    invoice_type: InvoiceType
    scenario: InvoiceScenario
    commission_payer: CommissionPayer
    grand_total: Decimal
    pdf_url: str | None
    pdf_status: InvoicePdfStatus
    payment_reminder_active: bool
    archived: bool
    issued_at: date | None
    created_at: datetime
    customer: CustomerResponse

    model_config = {"from_attributes": True}

    @computed_field
    @property
    def local_amount(self) -> Decimal | None:
        if self.currency == "TRY":
            return self.grand_total.quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)
        if self.exchange_rate is None or self.exchange_rate == 0:
            return None
        if self.payment_currency == "TRY":
            # exchange_rate: 1 TRY(payment) = X currency  ->  grand_total(currency) / rate = TRY
            return (self.grand_total / self.exchange_rate).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)
        # Ne currency ne payment_currency TRY ise (örn. EUR->USD), TRY karşılığı için ek bir
        # TCMB sorgusu gerekir - response serileştirmede canlı ağ çağrısı yapmamak için None dönülür.
        return None


class InvoiceDetailResponse(InvoiceSummaryResponse):
    template_id: uuid.UUID
    data_json: dict[str, str]
    subtotal: Decimal
    tax_total: Decimal
    pdf_error: str | None
    notes: str | None
    due_at: date | None
    recipient_contact_ids: list[str]
    line_items: list[InvoiceLineItemResponse]
    customer_snapshot: dict[str, str | None] | None
