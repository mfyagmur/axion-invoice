import uuid
from datetime import date, datetime
from decimal import Decimal
from enum import Enum

from sqlalchemy import Boolean, DateTime, Enum as SAEnum, ForeignKey, Numeric, String, func
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class InvoiceStatus(str, Enum):
    DRAFT = "draft"
    SENT = "sent"
    PAID = "paid"
    OVERDUE = "overdue"
    CANCELLED = "cancelled"


class InvoicePdfStatus(str, Enum):
    PENDING = "pending"
    READY = "ready"
    FAILED = "failed"


class InvoiceType(str, Enum):
    SALE = "sale"
    PURCHASE = "purchase"


class InvoiceScenario(str, Enum):
    COMMERCIAL = "commercial"


class CommissionPayer(str, Enum):
    SELF = "self"
    CUSTOMER = "customer"


class InvoiceCustomer(Base):
    __tablename__ = "invoice_customers"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    first_name: Mapped[str | None] = mapped_column(String(255), nullable=True)
    last_name: Mapped[str | None] = mapped_column(String(255), nullable=True)
    company_name: Mapped[str | None] = mapped_column(String(255), nullable=True)
    customer_type: Mapped[str] = mapped_column(String(20), nullable=False, default="kurumsal", server_default="kurumsal")
    email: Mapped[str | None] = mapped_column(String(255), nullable=True)
    address: Mapped[str | None] = mapped_column(String(1000), nullable=True)
    city: Mapped[str | None] = mapped_column(String(100), nullable=True)
    postal_code: Mapped[str | None] = mapped_column(String(20), nullable=True)
    country: Mapped[str | None] = mapped_column(String(100), nullable=True)
    phone: Mapped[str | None] = mapped_column(String(50), nullable=True)
    fax: Mapped[str | None] = mapped_column(String(50), nullable=True)
    website: Mapped[str | None] = mapped_column(String(255), nullable=True)
    tax_office: Mapped[str | None] = mapped_column(String(255), nullable=True)
    tax_number: Mapped[str | None] = mapped_column(String(50), nullable=True)
    mersis_no: Mapped[str | None] = mapped_column(String(50), nullable=True)
    category_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("definition_categories.id", ondelete="SET NULL"), nullable=True
    )
    is_active: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True, server_default="true")
    contacts: Mapped[list["CustomerContact"]] = relationship(
        back_populates="customer", cascade="all, delete-orphan"
    )


class Invoice(Base):
    __tablename__ = "invoices"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )
    template_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("invoice_templates.id", ondelete="RESTRICT"), nullable=False, index=True
    )
    invoice_number: Mapped[str] = mapped_column(String(50), nullable=False)
    customer_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("invoice_customers.id", ondelete="RESTRICT"), nullable=False, index=True
    )
    status: Mapped[InvoiceStatus] = mapped_column(
        SAEnum(InvoiceStatus, name="invoice_status"), nullable=False, default=InvoiceStatus.DRAFT
    )
    currency: Mapped[str] = mapped_column(String(3), nullable=False, default="TRY")
    payment_currency: Mapped[str] = mapped_column(String(3), nullable=False, default="TRY")
    exchange_rate: Mapped[Decimal | None] = mapped_column(Numeric(18, 6), nullable=True)
    invoice_type: Mapped[InvoiceType] = mapped_column(
        SAEnum(InvoiceType, name="invoice_type"), nullable=False, default=InvoiceType.SALE
    )
    scenario: Mapped[InvoiceScenario] = mapped_column(
        SAEnum(InvoiceScenario, name="invoice_scenario"), nullable=False, default=InvoiceScenario.COMMERCIAL
    )
    commission_payer: Mapped[CommissionPayer] = mapped_column(
        SAEnum(CommissionPayer, name="commission_payer"), nullable=False, default=CommissionPayer.SELF
    )
    recipient_contact_ids: Mapped[list[str]] = mapped_column(JSONB, nullable=False, default=list)
    subtotal: Mapped[Decimal] = mapped_column(Numeric(12, 2), nullable=False)
    tax_total: Mapped[Decimal] = mapped_column(Numeric(12, 2), nullable=False)
    grand_total: Mapped[Decimal] = mapped_column(Numeric(12, 2), nullable=False)
    data_json: Mapped[dict] = mapped_column(JSONB, nullable=False, default=dict)
    pdf_url: Mapped[str | None] = mapped_column(String(255), nullable=True)
    pdf_status: Mapped[InvoicePdfStatus] = mapped_column(
        SAEnum(InvoicePdfStatus, name="invoice_pdf_status"),
        nullable=False,
        default=InvoicePdfStatus.PENDING,
    )
    pdf_error: Mapped[str | None] = mapped_column(String(1000), nullable=True)
    notes: Mapped[str | None] = mapped_column(String(2000), nullable=True)
    payment_reminder_active: Mapped[bool] = mapped_column(
        Boolean, nullable=False, default=False, server_default="false"
    )
    archived: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False, server_default="false")
    customer_snapshot: Mapped[dict | None] = mapped_column(JSONB, nullable=True)
    issued_at: Mapped[date | None] = mapped_column(nullable=True)
    due_at: Mapped[date | None] = mapped_column(nullable=True)
    bank_account_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("definition_bank_accounts.id", ondelete="SET NULL"), nullable=True
    )
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )

    customer: Mapped["InvoiceCustomer"] = relationship()
    line_items: Mapped[list["InvoiceLineItem"]] = relationship(
        back_populates="invoice", cascade="all, delete-orphan"
    )


class InvoiceLineItem(Base):
    __tablename__ = "invoice_line_items"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    invoice_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("invoices.id", ondelete="CASCADE"), nullable=False, index=True
    )
    item_code: Mapped[str | None] = mapped_column(String(100), nullable=True)
    description: Mapped[str] = mapped_column(String(500), nullable=False)
    quantity: Mapped[Decimal] = mapped_column(Numeric(10, 2), nullable=False)
    unit_price: Mapped[Decimal] = mapped_column(Numeric(12, 2), nullable=False)
    unit: Mapped[str] = mapped_column(String(20), nullable=False, default="adet")
    discount_rate: Mapped[Decimal] = mapped_column(Numeric(5, 2), nullable=False, default=Decimal("0"))
    discount_amount: Mapped[Decimal] = mapped_column(Numeric(12, 2), nullable=False, default=Decimal("0"))
    tax_rate: Mapped[Decimal] = mapped_column(Numeric(5, 2), nullable=False, default=Decimal("0"))
    tax_amount: Mapped[Decimal] = mapped_column(Numeric(12, 2), nullable=False, default=Decimal("0"))
    other_tax_amount: Mapped[Decimal] = mapped_column(Numeric(12, 2), nullable=False, default=Decimal("0"))

    invoice: Mapped["Invoice"] = relationship(back_populates="line_items")
