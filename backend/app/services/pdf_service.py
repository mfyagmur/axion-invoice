from pathlib import Path

from jinja2 import Environment, FileSystemLoader, select_autoescape

from app.constants import COMPUTED_FIELD_KEYS
from app.models.invoice import Invoice
from app.models.template import InvoiceTemplate, TemplateEngine
from app.services import xslt_service

TEMPLATES_DIR = Path(__file__).resolve().parent.parent / "templates_html"

_env = Environment(loader=FileSystemLoader(TEMPLATES_DIR), autoescape=select_autoescape())

LABELS = {
    "row_number": "Sıra No",
    "item_code": "Kod",
    "description": "Açıklama",
    "quantity": "Miktar",
    "unit_price": "Birim Fiyat",
    "discount_rate": "İsk. %",
    "discount_amount": "İsk. Tutarı",
    "tax_rate": "KDV %",
    "tax_amount": "KDV Tutarı",
    "other_tax_amount": "Diğer Vergi",
    "line_total": "Tutar",
    "subtotal": "Ara Toplam",
    "tax": "Vergi",
    "grand_total": "Genel Toplam",
}


def _money(value) -> str:
    return f"{value:.2f}"


def _collect_render_data(invoice: Invoice) -> tuple[dict[str, str], list[dict], dict[str, str]]:
    field_values = dict(invoice.data_json)
    for key in COMPUTED_FIELD_KEYS:
        if key == "subtotal":
            field_values[key] = _money(invoice.subtotal)
        elif key == "tax":
            field_values[key] = _money(invoice.tax_total)

    line_items = [
        {
            "row_number": index + 1,
            "item_code": item.item_code or "",
            "description": item.description,
            "quantity": item.quantity,
            "unit_price": _money(item.unit_price),
            "discount_rate": item.discount_rate,
            "discount_amount": _money(item.discount_amount),
            "tax_rate": item.tax_rate,
            "tax_amount": _money(item.tax_amount),
            "other_tax_amount": _money(item.other_tax_amount),
            "line_total": _money(
                item.quantity * item.unit_price
                - item.discount_amount
                + item.tax_amount
                + item.other_tax_amount
            ),
        }
        for index, item in enumerate(invoice.line_items)
    ]

    totals = {
        "subtotal": _money(invoice.subtotal),
        "tax_total": _money(invoice.tax_total),
        "grand_total": _money(invoice.grand_total),
        "currency": invoice.currency,
    }

    return field_values, line_items, totals


def _apply_watermark(html: str, show_watermark: bool) -> str:
    if not show_watermark:
        return html

    watermark_html = (
        '<div style="position:fixed;inset:0;z-index:9999;display:flex;'
        "align-items:center;justify-content:center;pointer-events:none;"
        'transform:rotate(-30deg);font-size:48pt;font-weight:bold;'
        'color:rgba(120,120,120,0.28);">ÜCRETSİZ PLAN</div>'
    )
    if "</body>" in html:
        return html.replace("</body>", f"{watermark_html}</body>")
    return html + watermark_html


def _render_visual_html(invoice: Invoice, template: InvoiceTemplate, show_watermark: bool) -> str:
    field_values, line_items, totals = _collect_render_data(invoice)

    bank_accounts = [
        {
            'bank_name': bank_account.bank_name,
            'branch_name': bank_account.branch_name,
            'branch_code': bank_account.branch_code,
            'iban': bank_account.iban,
            'account_number': bank_account.account_number,
            'currency': bank_account.currency,
        }
        for bank_account in (invoice.bank_account, invoice.bank_account_2, invoice.bank_account_3)
        if bank_account is not None
    ]

    jinja_template = _env.get_template("invoice_base.html")
    return jinja_template.render(
        layout_json=template.layout_json,
        field_values=field_values,
        line_items=line_items,
        labels=LABELS,
        subtotal=totals["subtotal"],
        tax_total=totals["tax_total"],
        grand_total=totals["grand_total"],
        currency=totals["currency"],
        notes=invoice.notes or '',
        bank_accounts=bank_accounts,
        show_watermark=show_watermark,
    )


def render_invoice_html(invoice: Invoice, template: InvoiceTemplate, show_watermark: bool = False) -> str:
    if template.engine == TemplateEngine.XSLT:
        field_values, line_items, totals = _collect_render_data(invoice)
        html = xslt_service.render_xslt_html(template.xslt_content, invoice, field_values, line_items, totals)
        return _apply_watermark(html, show_watermark)

    return _render_visual_html(invoice, template, show_watermark)


def generate_invoice_pdf(
    invoice: Invoice, template: InvoiceTemplate, output_path: Path, show_watermark: bool = False
) -> None:
    html = render_invoice_html(invoice, template, show_watermark)

    from playwright.sync_api import sync_playwright

    output_path.parent.mkdir(parents=True, exist_ok=True)
    with sync_playwright() as p:
        browser = p.chromium.launch()
        try:
            page = browser.new_page()
            page.set_content(html, wait_until="networkidle")
            page.pdf(path=str(output_path), format="A4", print_background=True)
        finally:
            browser.close()
