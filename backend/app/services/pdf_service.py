import base64
import copy
import io
from pathlib import Path

from jinja2 import Environment, FileSystemLoader, select_autoescape

from app.constants import COMPUTED_FIELD_KEYS
from app.core.config import settings
from app.models.invoice import Invoice
from app.models.template import InvoiceTemplate, TemplateEngine
from app.services import template_field_resolver, xslt_service

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
            "unit": item.unit,
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


def _logo_data_uri(invoice: Invoice) -> str | None:
    logo_url = invoice.user.logo_url
    if not logo_url:
        return None
    file_path = Path(settings.logo_storage_dir) / Path(logo_url).name
    if not file_path.exists():
        return None
    ext = file_path.suffix.lstrip(".").lower() or "png"
    mime = f"image/{'jpeg' if ext in ('jpg', 'jpeg') else ext}"
    return f"data:{mime};base64,{base64.b64encode(file_path.read_bytes()).decode('ascii')}"


def _qr_data_uri(value: str) -> str | None:
    if not value:
        return None
    import qrcode

    image = qrcode.make(value)
    buffer = io.BytesIO()
    image.save(buffer, format="PNG")
    return f"data:image/png;base64,{base64.b64encode(buffer.getvalue()).decode('ascii')}"


_PT_TO_MM = 0.3528
_CELL_VERTICAL_PADDING_MM = 2.0  # `.el-table th/td { padding: 1mm ... }` — top + bottom
_LINE_HEIGHT_FACTOR = 1.35  # browser default line-height for table cells is ~1.2-1.4x font size


def _natural_row_height_mm(font_size_pt: float) -> float:
    """A CSS `<tr style="height:Xmm">` is a *minimum* — the browser still grows the row to
    fit its content (font line-height + cell padding) if that's taller than X. Template
    authors often set `row_height_mm` far below what an 8pt font actually needs, so this
    estimates the real minimum a browser will render, independent of the declared value.
    """
    return font_size_pt * _PT_TO_MM * _LINE_HEIGHT_FACTOR + _CELL_VERTICAL_PADDING_MM


_FOLLOW_GAP_THRESHOLD_MM = 50.0  # how close below the table an element must originally sit to be
# considered part of its "summary block" (totals) and get pushed down with it. Elements further
# away (bank account details, footer notes, signature, etc.) are treated as independently
# page-anchored content and are deliberately left in place — see docstring below.


def _reflow_elements_below_table(elements: list[dict], line_items: list[dict]) -> list[dict]:
    """Push elements positioned directly below the items table down by however much the
    table's real content (header + one row per line item + optional totals footer) overflows
    its designed height_mm. The renderer positions every element with fixed x/y/height mm
    coordinates (no real CSS document flow), so once the table is allowed to grow past its
    designed box (see `.el-table { height: auto }`), anything placed right after it in the
    template (typically a totals/summary box) must be shifted down to avoid overlapping the
    table's own rows — this recomputes that shift at render time without mutating the
    template's stored layout_json.

    Row heights are estimated from font metrics (`_natural_row_height_mm`), not just the
    declared `row_height_mm`, because the declared value is frequently smaller than what the
    browser actually renders (a `height` on a table row is a floor, not a fixed size) — using
    the declared value alone under-estimates overflow and leaves residual overlap. A small
    safety margin is added on top since text wrapping (long descriptions) can grow rows further
    than a single-line estimate predicts.

    Only elements within `_FOLLOW_GAP_THRESHOLD_MM` of the table's *original* bottom edge are
    pushed — real invoice templates place other independent content (bank account details,
    payment notes, signature) far below the totals block, anchored near the bottom of the fixed
    A4 page. Pushing those too would shove them past the page boundary and spill them onto an
    unintended second page; keeping them in place matches how a designer actually laid out the
    page (totals flow with the table, the footer band stays put).
    """
    elements = copy.deepcopy(elements)
    for table_el in elements:
        if table_el.get("type") != "table":
            continue
        row_height_mm = max(table_el.get("row_height_mm", 6), _natural_row_height_mm(table_el.get("row_font_size", 8)))
        header_height_mm = max(table_el.get("row_height_mm", 6), _natural_row_height_mm(table_el.get("header_font_size", 8)))
        totals_height_mm = row_height_mm * 3 if table_el.get("show_totals") else 0
        content_height_mm = (header_height_mm + row_height_mm * len(line_items) + totals_height_mm) * 1.05
        designed_height_mm = table_el.get("height_mm", 0)
        overflow_mm = content_height_mm - designed_height_mm
        if overflow_mm <= 0:
            continue
        table_bottom_mm = table_el.get("y_mm", 0) + designed_height_mm
        table_el["height_mm"] = content_height_mm
        for other_el in elements:
            if other_el is table_el:
                continue
            gap_mm = other_el.get("y_mm", 0) - table_bottom_mm
            if -0.5 <= gap_mm <= _FOLLOW_GAP_THRESHOLD_MM:
                other_el["y_mm"] = other_el.get("y_mm", 0) + overflow_mm
    return elements


def _render_visual_v2_html(invoice: Invoice, template: InvoiceTemplate, show_watermark: bool) -> str:
    _, line_items, totals = _collect_render_data(invoice)

    resolved_text: dict[str, str] = {}
    for element in template.layout_json:
        element_id = element.get("id")
        element_type = element.get("type")
        if element_type == "dynamic-field":
            value = template_field_resolver.resolve_field(element["field_key"], invoice)
            resolved_text[element_id] = value or element.get("default_value") or ""
        elif element_type == "bank-account":
            slot = element.get("slot", 1)
            prefix = f"payment.bank_account_{slot}"
            fields = ["bank_name", "branch_name", "branch_code", "iban", "account_number", "currency"]
            values = [template_field_resolver.resolve_field(f"{prefix}.{f}", invoice) for f in fields]
            bank_name, branch_name, branch_code, iban, account_number, currency = values
            if not bank_name:
                resolved_text[element_id] = ""
            else:
                resolved_text[element_id] = (
                    f"{bank_name} — {branch_name} (Şube Kodu: {branch_code})\n"
                    f"{iban}\n"
                    f"Hesap No: {account_number} — {currency}"
                )
        elif element_type == "qrcode":
            if element.get("data_source") == "static":
                value = element.get("static_value") or ""
            else:
                value = invoice.invoice_number
            resolved_text[element_id] = _qr_data_uri(value) or ""

    orientation = getattr(template, "orientation", "portrait")
    page_width_mm, page_height_mm = (297, 210) if orientation == "landscape" else (210, 297)

    jinja_template = _env.get_template("template_designer_base.html")
    return jinja_template.render(
        elements=_reflow_elements_below_table(template.layout_json, line_items),
        resolved_text=resolved_text,
        line_items=line_items,
        totals=totals,
        logo_data_uri=_logo_data_uri(invoice),
        page_width_mm=page_width_mm,
        page_height_mm=page_height_mm,
        show_watermark=show_watermark,
    )


def render_invoice_html(invoice: Invoice, template: InvoiceTemplate, show_watermark: bool = False) -> str:
    if template.engine == TemplateEngine.XSLT:
        field_values, line_items, totals = _collect_render_data(invoice)
        html = xslt_service.render_xslt_html(template.xslt_content, invoice, field_values, line_items, totals)
        return _apply_watermark(html, show_watermark)

    if template.layout_version >= 2:
        return _render_visual_v2_html(invoice, template, show_watermark)

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
