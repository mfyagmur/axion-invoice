import uuid
from decimal import Decimal

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.constants import COMPUTED_FIELD_KEYS
from app.models.invoice import Invoice, InvoiceCustomer, InvoiceLineItem
from app.models.template import InvoiceTemplate
from app.models.user import User
from app.schemas.invoice import InvoiceCreatePayload


def compute_totals(payload: InvoiceCreatePayload) -> tuple[Decimal, Decimal, Decimal]:
    subtotal = sum((item.quantity * item.unit_price for item in payload.line_items), Decimal("0"))
    tax_total = payload.tax_total
    return subtotal, tax_total, subtotal + tax_total


def next_invoice_number(db: Session, user: User) -> str:
    user.invoice_sequence += 1
    db.flush()
    return f"INV-{user.invoice_sequence:04d}"


def _get_visible_template(db: Session, template_id: uuid.UUID, user: User) -> InvoiceTemplate:
    template = db.get(InvoiceTemplate, template_id)
    if template is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Şablon bulunamadı")
    if not template.is_system_template and template.user_id != user.id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Şablon bulunamadı")
    return template


def get_own_invoice(db: Session, invoice_id: uuid.UUID, user: User) -> Invoice:
    invoice = db.get(Invoice, invoice_id)
    if invoice is None or invoice.user_id != user.id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Fatura bulunamadı")
    return invoice


def create_invoice(db: Session, user: User, payload: InvoiceCreatePayload) -> Invoice:
    _get_visible_template(db, payload.template_id, user)

    if payload.customer_id is not None:
        customer = db.get(InvoiceCustomer, payload.customer_id)
        if customer is None or customer.user_id != user.id:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Müşteri bulunamadı")
    else:
        assert payload.customer is not None
        customer = InvoiceCustomer(
            user_id=user.id,
            name=payload.customer.name,
            email=payload.customer.email,
            tax_number=payload.customer.tax_number,
            address=payload.customer.address,
        )
        db.add(customer)
        db.flush()

    subtotal, tax_total, grand_total = compute_totals(payload)

    field_values = {key: value for key, value in payload.field_values.items() if key not in COMPUTED_FIELD_KEYS}

    invoice = Invoice(
        user_id=user.id,
        template_id=payload.template_id,
        invoice_number=next_invoice_number(db, user),
        customer_id=customer.id,
        currency=payload.currency,
        subtotal=subtotal,
        tax_total=tax_total,
        grand_total=grand_total,
        data_json=field_values,
        issued_at=payload.issued_at,
        due_at=payload.due_at,
    )
    db.add(invoice)
    db.flush()

    for item in payload.line_items:
        db.add(
            InvoiceLineItem(
                invoice_id=invoice.id,
                description=item.description,
                quantity=item.quantity,
                unit_price=item.unit_price,
            )
        )

    db.commit()
    db.refresh(invoice)
    return invoice
