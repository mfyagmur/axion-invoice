from pathlib import Path

from jinja2 import Environment, FileSystemLoader, select_autoescape

from app.constants import COMPUTED_FIELD_KEYS
from app.models.invoice import Invoice
from app.models.template import InvoiceTemplate

TEMPLATES_DIR = Path(__file__).resolve().parent.parent / "templates_html"

_env = Environment(loader=FileSystemLoader(TEMPLATES_DIR), autoescape=select_autoescape())

LABELS = {
    "description": "Açıklama",
    "quantity": "Miktar",
    "unit_price": "Birim Fiyat",
    "line_total": "Tutar",
    "subtotal": "Ara Toplam",
    "tax": "Vergi",
    "grand_total": "Genel Toplam",
}


def _money(value) -> str:
    return f"{value:.2f}"


def render_invoice_html(invoice: Invoice, template: InvoiceTemplate, show_watermark: bool = False) -> str:
    field_values = dict(invoice.data_json)
    for key in COMPUTED_FIELD_KEYS:
        if key == "subtotal":
            field_values[key] = _money(invoice.subtotal)
        elif key == "tax":
            field_values[key] = _money(invoice.tax_total)

    line_items = [
        {
            "description": item.description,
            "quantity": item.quantity,
            "unit_price": _money(item.unit_price),
            "line_total": _money(item.quantity * item.unit_price),
        }
        for item in invoice.line_items
    ]

    jinja_template = _env.get_template("invoice_base.html")
    return jinja_template.render(
        layout_json=template.layout_json,
        field_values=field_values,
        line_items=line_items,
        labels=LABELS,
        subtotal=_money(invoice.subtotal),
        tax_total=_money(invoice.tax_total),
        grand_total=_money(invoice.grand_total),
        currency=invoice.currency,
        show_watermark=show_watermark,
    )


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
