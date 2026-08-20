"""Resolves v2 template designer `field_key` strings (e.g. `company.tax_number`,
`payment.bank_account_2.iban`, `recipient.contact_1.email`) into display strings read
straight off the invoice/customer/user/bank-account objects — the same data the invoice
creation form (`InvoiceForm.tsx`) collects, so what the user places on the A4 canvas is
exactly what ends up on the PDF.
"""
from datetime import date
from decimal import Decimal

from app.models.invoice import CommissionPayer, Invoice, InvoiceScenario, InvoiceType
from app.models.definitions import DefinitionBankAccount

INVOICE_TYPE_LABELS = {InvoiceType.SALE: "Satış", InvoiceType.PURCHASE: "Alış"}
SCENARIO_LABELS = {InvoiceScenario.COMMERCIAL: "Ticari"}
COMMISSION_PAYER_LABELS = {CommissionPayer.SELF: "Tarafımızca", CommissionPayer.CUSTOMER: "Müşteri"}


def _money(value: Decimal | None) -> str:
    if value is None:
        return ""
    return f"{value:.2f}"


def _date(value: date | None) -> str:
    return value.strftime("%d.%m.%Y") if value else ""


def _text(value: str | None) -> str:
    return value or ""


def _bank_account_field(bank_account: DefinitionBankAccount | None, attr: str) -> str:
    if bank_account is None:
        return ""
    return _text(getattr(bank_account, attr, None))


def _totals(invoice: Invoice) -> dict[str, Decimal]:
    discount = sum((item.discount_amount for item in invoice.line_items), Decimal("0"))
    other_tax = sum((item.other_tax_amount for item in invoice.line_items), Decimal("0"))
    net_receivable = (
        invoice.grand_total / invoice.exchange_rate
        if invoice.exchange_rate and invoice.currency != invoice.payment_currency
        else invoice.grand_total
    )
    return {
        "subtotal": invoice.subtotal,
        "discount": discount,
        "tax": invoice.tax_total - other_tax,
        "other_tax": other_tax,
        "grand_total": invoice.grand_total,
        "net_receivable": net_receivable,
    }


def resolve_field(field_key: str, invoice: Invoice) -> str:
    """Returns the display string for a dynamic-field `field_key`, or '' if unknown."""
    parts = field_key.split(".")
    namespace = parts[0]

    if namespace == "invoice" and len(parts) == 2:
        attr = parts[1]
        if attr == "number":
            return _text(invoice.invoice_number)
        if attr == "date":
            return _date(invoice.issued_at)
        if attr == "due_date":
            return _date(invoice.due_at)
        if attr == "currency":
            return _text(invoice.currency)
        if attr == "payment_currency":
            return _text(invoice.payment_currency)
        if attr == "exchange_rate":
            return _money(invoice.exchange_rate)
        if attr == "type":
            return INVOICE_TYPE_LABELS.get(invoice.invoice_type, "")
        if attr == "scenario":
            return SCENARIO_LABELS.get(invoice.scenario, "")
        if attr == "commission_payer":
            return COMMISSION_PAYER_LABELS.get(invoice.commission_payer, "")
        if attr == "notes":
            return _text(invoice.notes)

    if namespace == "company" and len(parts) == 2:
        user = invoice.user
        return _text(getattr(user, parts[1], None))

    if namespace == "customer" and len(parts) == 2:
        customer = invoice.customer
        attr = parts[1]
        if attr == "name":
            return _text(customer.company_name or customer.name)
        return _text(getattr(customer, attr, None))

    if namespace == "recipient" and len(parts) == 3 and parts[1].startswith("contact_"):
        try:
            index = int(parts[1].removeprefix("contact_")) - 1
        except ValueError:
            return ""
        if index < 0 or index >= len(invoice.recipient_contact_ids):
            return ""
        contact_id = invoice.recipient_contact_ids[index]
        contact = next((c for c in invoice.customer.contacts if str(c.id) == str(contact_id)), None)
        if contact is None:
            return ""
        attr = parts[2]
        if attr == "name":
            return f"{contact.first_name} {contact.last_name}".strip()
        return _text(getattr(contact, attr, None))

    if namespace == "payment" and len(parts) == 3 and parts[1].startswith("bank_account_"):
        try:
            slot = int(parts[1].removeprefix("bank_account_"))
        except ValueError:
            return ""
        bank_account = {1: invoice.bank_account, 2: invoice.bank_account_2, 3: invoice.bank_account_3}.get(slot)
        return _bank_account_field(bank_account, parts[2])

    if namespace == "totals" and len(parts) == 2:
        totals = _totals(invoice)
        value = totals.get(parts[1])
        return _money(value) if value is not None else ""

    return ""
