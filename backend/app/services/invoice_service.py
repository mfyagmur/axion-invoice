import uuid
from decimal import ROUND_HALF_UP, Decimal

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.constants import COMPUTED_FIELD_KEYS
from app.models.invoice import Invoice, InvoiceCustomer, InvoiceLineItem
from app.models.template import InvoiceTemplate
from app.models.user import User
from app.schemas.invoice import InvoiceCreatePayload, LineItemPayload


def _round_money(value: Decimal) -> Decimal:
    return value.quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)


def compute_line_item_totals(item: LineItemPayload) -> dict[str, Decimal]:
    gross = item.quantity * item.unit_price
    discount_amount = _round_money(gross * item.discount_rate / Decimal("100"))
    taxable_base = gross - discount_amount
    tax_amount = _round_money(taxable_base * item.tax_rate / Decimal("100"))
    line_total = taxable_base + tax_amount + item.other_tax_amount
    return {
        "taxable_base": taxable_base,
        "discount_amount": discount_amount,
        "tax_amount": tax_amount,
        "line_total": line_total,
    }


def compute_totals(payload: InvoiceCreatePayload) -> tuple[Decimal, Decimal, Decimal, list[dict[str, Decimal]]]:
    computations = [compute_line_item_totals(item) for item in payload.line_items]
    subtotal = sum((c["taxable_base"] for c in computations), Decimal("0"))
    tax_total = sum((c["tax_amount"] for c in computations), Decimal("0")) + sum(
        (item.other_tax_amount for item in payload.line_items), Decimal("0")
    )
    grand_total = subtotal + tax_total
    return subtotal, tax_total, grand_total, computations


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

    customer = db.get(InvoiceCustomer, payload.customer_id)
    if customer is None or customer.user_id != user.id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Müşteri bulunamadı")

    subtotal, tax_total, grand_total, line_computations = compute_totals(payload)

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

    for item, computed in zip(payload.line_items, line_computations):
        db.add(
            InvoiceLineItem(
                invoice_id=invoice.id,
                item_code=item.item_code,
                description=item.description,
                quantity=item.quantity,
                unit_price=item.unit_price,
                discount_rate=item.discount_rate,
                discount_amount=computed["discount_amount"],
                tax_rate=item.tax_rate,
                tax_amount=computed["tax_amount"],
                other_tax_amount=item.other_tax_amount,
            )
        )

    db.commit()
    db.refresh(invoice)
    return invoice
