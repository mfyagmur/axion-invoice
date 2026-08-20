import uuid
from decimal import ROUND_HALF_UP, Decimal

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.constants import COMPUTED_FIELD_KEYS
from app.models.definitions import DefinitionBankAccount
from app.models.invoice import Invoice, InvoiceCustomer, InvoiceLineItem, InvoicePdfStatus, InvoiceStatus
from app.models.template import InvoiceTemplate
from app.models.user import User
from app.schemas.invoice import InvoiceCreatePayload, InvoiceUpdatePayload, LineItemPayload


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


def compute_totals(
    line_items: list[LineItemPayload],
) -> tuple[Decimal, Decimal, Decimal, list[dict[str, Decimal]]]:
    computations = [compute_line_item_totals(item) for item in line_items]
    subtotal = sum((c["taxable_base"] for c in computations), Decimal("0"))
    tax_total = sum((c["tax_amount"] for c in computations), Decimal("0")) + sum(
        (item.other_tax_amount for item in line_items), Decimal("0")
    )
    grand_total = subtotal + tax_total
    return subtotal, tax_total, grand_total, computations


def next_invoice_number(db: Session, user: User) -> str:
    user.invoice_sequence += 1
    db.flush()
    prefix = user.invoice_prefix or ""
    return f"{prefix}{user.invoice_sequence:0{user.invoice_number_padding}d}"


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

    for contact_id in payload.recipient_contact_ids:
        contact = next((c for c in customer.contacts if c.id == contact_id), None)
        if contact is None:
            raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail="Geçerli olmayan kişi seçimi")

    for bank_account_id in (payload.bank_account_id, payload.bank_account_id_2, payload.bank_account_id_3):
        if bank_account_id is not None:
            bank_account = db.get(DefinitionBankAccount, bank_account_id)
            if bank_account is None or bank_account.user_id != user.id:
                raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Banka hesabı bulunamadı")

    subtotal, tax_total, grand_total, line_computations = compute_totals(payload.line_items)

    field_values = {key: value for key, value in payload.field_values.items() if key not in COMPUTED_FIELD_KEYS}

    customer_snapshot = {
        "name": customer.company_name or customer.name,
        "address": customer.address,
        "city": customer.city,
        "postal_code": customer.postal_code,
        "country": customer.country,
        "tax_office": customer.tax_office,
        "tax_number": customer.tax_number,
        "email": customer.email,
        "phone": customer.phone,
    }

    invoice = Invoice(
        user_id=user.id,
        template_id=payload.template_id,
        invoice_number=next_invoice_number(db, user),
        customer_id=customer.id,
        bank_account_id=payload.bank_account_id,
        bank_account_id_2=payload.bank_account_id_2,
        bank_account_id_3=payload.bank_account_id_3,
        currency=payload.currency,
        payment_currency=payload.payment_currency,
        exchange_rate=payload.exchange_rate,
        invoice_type=payload.invoice_type,
        scenario=payload.scenario,
        commission_payer=payload.commission_payer,
        recipient_contact_ids=[str(cid) for cid in payload.recipient_contact_ids],
        subtotal=subtotal,
        tax_total=tax_total,
        grand_total=grand_total,
        data_json=field_values,
        notes=payload.notes,
        issued_at=payload.issued_at,
        due_at=payload.due_at,
        customer_snapshot=customer_snapshot,
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
                unit=item.unit,
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


def update_invoice(db: Session, user: User, invoice_id: uuid.UUID, payload: InvoiceUpdatePayload) -> Invoice:
    invoice = get_own_invoice(db, invoice_id, user)
    if invoice.status != InvoiceStatus.DRAFT:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Sadece taslak faturalar düzenlenebilir")

    update_fields = payload.model_dump(exclude_unset=True)
    content_changed = False

    if "customer_snapshot" in update_fields:
        snapshot = dict(invoice.customer_snapshot or {})
        snapshot.update(update_fields["customer_snapshot"])
        invoice.customer_snapshot = snapshot

    if "notes" in update_fields:
        invoice.notes = update_fields["notes"]
        content_changed = True

    for field_name in ("bank_account_id", "bank_account_id_2", "bank_account_id_3"):
        if field_name in update_fields:
            bank_account_id = update_fields[field_name]
            if bank_account_id is not None:
                bank_account = db.get(DefinitionBankAccount, bank_account_id)
                if bank_account is None or bank_account.user_id != user.id:
                    raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Banka hesabı bulunamadı")
            setattr(invoice, field_name, bank_account_id)
            content_changed = True

    if "line_items" in update_fields:
        line_items_payload = [LineItemPayload(**item) for item in update_fields["line_items"]]
        subtotal, tax_total, grand_total, line_computations = compute_totals(line_items_payload)

        for existing_item in list(invoice.line_items):
            db.delete(existing_item)
        db.flush()

        invoice.subtotal = subtotal
        invoice.tax_total = tax_total
        invoice.grand_total = grand_total

        for item, computed in zip(line_items_payload, line_computations):
            db.add(
                InvoiceLineItem(
                    invoice_id=invoice.id,
                    item_code=item.item_code,
                    description=item.description,
                    quantity=item.quantity,
                    unit_price=item.unit_price,
                    unit=item.unit,
                    discount_rate=item.discount_rate,
                    discount_amount=computed["discount_amount"],
                    tax_rate=item.tax_rate,
                    tax_amount=computed["tax_amount"],
                    other_tax_amount=item.other_tax_amount,
                )
            )
        content_changed = True

    if content_changed and invoice.pdf_url is not None:
        invoice.pdf_status = InvoicePdfStatus.PENDING
        invoice.pdf_error = None

    db.commit()
    db.refresh(invoice)
    return invoice
