"""seed v2 system templates (Classic, Sharp, Clean, Compact)

Revision ID: b3f9e7a2c114
Revises: 5649ad6ab27c
Create Date: 2026-08-27 00:00:00.000000

"""
import uuid
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = 'b3f9e7a2c114'
down_revision: Union[str, None] = '5649ad6ab27c'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


invoice_templates = sa.table(
    "invoice_templates",
    sa.column("id", sa.UUID()),
    sa.column("user_id", sa.UUID()),
    sa.column("name", sa.String()),
    sa.column("is_system_template", sa.Boolean()),
    sa.column("is_active", sa.Boolean()),
    sa.column("page_size", sa.String()),
    sa.column("layout_json", sa.JSON()),
    sa.column("layout_version", sa.Integer()),
    sa.column("orientation", sa.String()),
    sa.column("engine", sa.String()),
    sa.column("target_format", sa.String()),
    sa.column("min_plan_key", sa.String()),
)

invoice_template_fields = sa.table(
    "invoice_template_fields",
    sa.column("id", sa.UUID()),
    sa.column("template_id", sa.UUID()),
    sa.column("field_key", sa.String()),
    sa.column("field_type", sa.String()),
    sa.column("label", sa.String()),
    sa.column("is_custom", sa.Boolean()),
    sa.column("default_value", sa.String()),
)

# Fixed UUIDs so this migration is deterministic and downgrade()/idempotency checks are exact.
CLASSIC_ID = "00000000-0000-0000-0000-000000000010"
SHARP_ID = "00000000-0000-0000-0000-000000000011"
CLEAN_ID = "00000000-0000-0000-0000-000000000012"
COMPACT_ID = "00000000-0000-0000-0000-000000000013"
SEED_TEMPLATE_IDS = [CLASSIC_ID, SHARP_ID, CLEAN_ID, COMPACT_ID]

# field_key -> (field_type enum member name, TR label). Mirrors the same namespaces
# `backend/app/services/template_field_resolver.py` resolves and the labels
# `frontend/src/features/invoice-editor/constants/fieldCatalog.ts` shows in the editor palette,
# so a field placed here reads identically if these templates are ever opened in the visual editor.
FIELD_LABELS = {
    "company.company_name": ("TEXT", "Şirket Adı"),
    "company.address": ("TEXT", "Şirket Adresi"),
    "company.tax_office": ("TEXT", "Şirket Vergi Dairesi"),
    "company.tax_number": ("TEXT", "Şirket Vergi No"),
    "invoice.number": ("TEXT", "Fatura No"),
    "invoice.date": ("DATE", "Fatura Tarihi"),
    "invoice.due_date": ("DATE", "Vade Tarihi"),
    "customer.name": ("TEXT", "Müşteri Adı"),
    "customer.address": ("TEXT", "Müşteri Adresi"),
    "customer.tax_office": ("TEXT", "Müşteri Vergi Dairesi"),
    "customer.tax_number": ("TEXT", "Müşteri Vergi No"),
    "totals.subtotal": ("CURRENCY", "Ara Toplam"),
    "totals.tax": ("CURRENCY", "KDV"),
    "totals.grand_total": ("CURRENCY", "Genel Toplam"),
}


# ---------------------------------------------------------------------------
# v2 element builders — thin dict factories mirroring the discriminated union in
# `backend/app/schemas/template.py` (Element = text | line | rectangle | logo | image | qrcode |
# signature | dynamic-field | table | bank-account). Kept as plain dicts (not Pydantic models)
# because `op.bulk_insert` writes raw JSON straight into the `layout_json` JSONB column.
# ---------------------------------------------------------------------------

def _base(el_id, x, y, w, h, z=1, rotation=0):
    return {
        "id": el_id, "x_mm": x, "y_mm": y, "width_mm": w, "height_mm": h,
        "rotation": rotation, "z_index": z, "locked": False, "hidden": False,
    }


def text(el_id, x, y, w, h, content, size=10, weight="normal", style="normal",
         color="#1a1a1a", align="left", family="Arial, Helvetica, sans-serif",
         bg=None, lh=1.3, ls=0, z=1, rotation=0):
    d = _base(el_id, x, y, w, h, z, rotation)
    d.update({
        "type": "text", "content": content, "font_size": size, "font_family": family,
        "font_weight": weight, "font_style": style, "color": color,
        "background_color": bg, "text_align": align, "line_height": lh, "letter_spacing": ls,
    })
    return d


def field(el_id, x, y, w, h, field_key, label, size=10, weight="normal", style="normal",
          color="#1a1a1a", align="left", lh=1.3, ls=0, z=1):
    d = _base(el_id, x, y, w, h, z)
    d.update({
        "type": "dynamic-field", "field_key": field_key, "label": label, "font_size": size,
        "font_weight": weight, "font_style": style, "color": color, "text_align": align,
        "line_height": lh, "letter_spacing": ls, "is_custom": False, "default_value": None,
    })
    return d


def line(el_id, x, y, w, color="#333333", width=0.3, z=1, rotation=0):
    d = _base(el_id, x, y, w, max(width, 0.2), z, rotation)
    d.update({"type": "line", "stroke_color": color, "stroke_width": width})
    return d


def rect(el_id, x, y, w, h, fill=None, border="#333333", bw=0.3, radius=0, z=0):
    d = _base(el_id, x, y, w, h, z)
    d.update({"type": "rectangle", "fill_color": fill, "border_color": border,
              "border_width": bw, "border_radius": radius})
    return d


def logo(el_id, x, y, w, h, fit="contain", z=5):
    d = _base(el_id, x, y, w, h, z)
    d.update({"type": "logo", "object_fit": fit})
    return d


def qrcode(el_id, x, y, w, h, source="invoice_number", z=5):
    d = _base(el_id, x, y, w, h, z)
    d.update({"type": "qrcode", "data_source": source, "static_value": None})
    return d


def signature(el_id, x, y, w, h, label="Yetkili İmza", z=5):
    d = _base(el_id, x, y, w, h, z)
    d.update({"type": "signature", "label": label})
    return d


def bank(el_id, x, y, w, h, slot=1, size=8, align="left", color="#1a1a1a", z=1):
    d = _base(el_id, x, y, w, h, z)
    d.update({"type": "bank-account", "slot": slot, "font_size": size, "text_align": align, "color": color})
    return d


def col(key, label, width, align="left", visible=True):
    return {"key": key, "label": label, "visible": visible, "width_mm": width, "align": align}


def table(el_id, x, y, w, h, columns, header_size=8, header_bg="#f1f5f9", header_color="#1a1a1a",
          row_size=8, row_h=6, border_color="#cccccc", border_w=0.2, zebra=False, z=1):
    d = _base(el_id, x, y, w, h, z)
    d.update({
        "type": "table", "columns": columns, "header_font_size": header_size,
        "header_bg_color": header_bg, "header_text_color": header_color, "row_font_size": row_size,
        "row_height_mm": row_h, "border_color": border_color, "border_width": border_w,
        "zebra_striping": zebra, "currency_format": "#,##0.00", "number_format": "#,##0.##",
        "show_totals": False,
    })
    return d


COLUMNS_7 = [
    col("item_code", "Kod", 20, "left", False),
    col("description", "Açıklama", 55, "left"),
    col("quantity", "Miktar", 15, "center"),
    col("unit", "Birim", 15, "center"),
    col("unit_price", "Birim Fiyat", 25, "right"),
    col("discount_rate", "İsk. %", 20, "right"),
    col("tax_rate", "KDV %", 20, "right"),
    col("other_tax_amount", "Diğer Vergi", 20, "right", False),
    col("line_total", "Tutar", 30, "right"),
]

COLUMNS_6 = [
    col("item_code", "Kod", 18, "left", False),
    col("description", "Açıklama", 65, "left"),
    col("quantity", "Mik.", 15, "center"),
    col("unit", "Br.", 15, "center"),
    col("unit_price", "B.Fiyat", 25, "right"),
    col("tax_rate", "KDV %", 20, "right"),
    col("other_tax_amount", "Diğer", 18, "right", False),
    col("line_total", "Tutar", 40, "right"),
]


# ---------------------------------------------------------------------------
# Template layouts. Zone convention shared by all four (required by the pagination logic in
# `backend/app/services/pdf_service.py:_classify_elements`/`_reflow_elements_below_table`):
# elements ABOVE the table's y_mm repeat on every page (header/company/customer); the totals
# block sits within 50mm of the table's bottom edge so it reflows down with the table on
# overflow; a footer band anchored >50mm below the table's bottom edge is fixed near the page
# bottom and hard-caps how many rows fit on the last page.
# ---------------------------------------------------------------------------

def build_classic() -> list[dict]:
    navy = "#1e3a5f"
    gray = "#64748b"
    slate = "#334155"
    border = "#cbd5e1"
    header_bg = "#f1f5f9"
    return [
        logo("cl-logo", 15, 15, 35, 20),
        field("cl-company-name", 55, 15, 90, 10, "company.company_name", "Şirket Adı", size=16, weight="bold", color=navy),
        field("cl-company-address", 55, 26, 120, 6, "company.address", "Şirket Adresi", size=9, color=gray),
        field("cl-company-tax-office", 55, 32, 120, 5, "company.tax_office", "Vergi Dairesi", size=8, color=gray),
        field("cl-company-tax-number", 55, 37, 120, 5, "company.tax_number", "Vergi No", size=8, color=gray),
        text("cl-title", 140, 12, 40, 12, "FATURA", size=20, weight="bold", color=navy, align="right", family="Georgia, 'Times New Roman', serif"),
        text("cl-lbl-number", 128, 30, 27, 5, "Fatura No:", size=8, color=gray, align="right"),
        field("cl-val-number", 157, 30, 38, 5, "invoice.number", "Fatura No", size=9, weight="bold", align="right"),
        text("cl-lbl-date", 128, 36, 27, 5, "Tarih:", size=8, color=gray, align="right"),
        field("cl-val-date", 157, 36, 38, 5, "invoice.date", "Fatura Tarihi", size=9, align="right"),
        text("cl-lbl-due", 128, 42, 27, 5, "Vade:", size=8, color=gray, align="right"),
        field("cl-val-due", 157, 42, 38, 5, "invoice.due_date", "Vade Tarihi", size=9, align="right"),
        line("cl-divider1", 15, 48, 180, color=navy, width=0.5),
        rect("cl-customer-box", 15, 54, 90, 28, fill=None, border=border, bw=0.3),
        text("cl-customer-label", 19, 57, 60, 5, "SAYIN", size=8, weight="bold", color=navy, ls=0.3),
        field("cl-customer-name", 19, 63, 82, 6, "customer.name", "Müşteri Adı", size=11, weight="bold", color="#1a1a1a"),
        field("cl-customer-address", 19, 70, 82, 6, "customer.address", "Müşteri Adresi", size=8, color=slate),
        field("cl-customer-tax-office", 19, 76, 42, 5, "customer.tax_office", "Vergi Dairesi", size=8, color=slate),
        field("cl-customer-tax-number", 63, 76, 38, 5, "customer.tax_number", "Vergi No", size=8, color=slate),
        table("cl-table", 15, 86, 180, 100, COLUMNS_7, header_size=8, header_bg=header_bg, header_color=navy,
              row_size=9, row_h=7, border_color=border, border_w=0.2, zebra=False),
        line("cl-totals-line1", 130, 189, 65, color=border, width=0.2),
        text("cl-lbl-subtotal", 130, 192, 40, 5, "Ara Toplam", size=9, color=slate),
        field("cl-val-subtotal", 170, 192, 25, 5, "totals.subtotal", "Ara Toplam", size=9, align="right"),
        text("cl-lbl-tax", 130, 198, 40, 5, "KDV", size=9, color=slate),
        field("cl-val-tax", 170, 198, 25, 5, "totals.tax", "KDV", size=9, align="right"),
        line("cl-totals-line2", 130, 205, 65, color=navy, width=0.5),
        text("cl-lbl-grand", 130, 208, 40, 6, "GENEL TOPLAM", size=11, weight="bold", color=navy),
        field("cl-val-grand", 170, 208, 25, 6, "totals.grand_total", "Genel Toplam", size=12, weight="bold", color=navy, align="right"),
        line("cl-footer-divider", 15, 238, 180, color=border, width=0.3),
        text("cl-bank-label", 15, 241, 60, 5, "Banka Bilgileri", size=8, weight="bold", color=navy),
        bank("cl-bank", 15, 247, 178, 20, slot=1, size=7, color=slate),
        signature("cl-signature", 15, 272, 32, 14, label="Yetkili İmza"),
        qrcode("cl-qr", 160, 271, 16, 16, source="invoice_number"),
    ]


def build_sharp() -> list[dict]:
    ink = "#111827"
    amber = "#f59e0b"
    panel = "#f3f4f6"
    white = "#ffffff"
    return [
        rect("sh-band", 0, 0, 210, 45, fill=ink, border=ink, bw=0),
        logo("sh-logo", 15, 10, 32, 22, z=6),
        field("sh-company-name", 52, 12, 100, 10, "company.company_name", "Şirket Adı", size=16, weight="bold", color=white),
        field("sh-company-address", 52, 23, 110, 6, "company.address", "Şirket Adresi", size=8, color="#d1d5db"),
        text("sh-title", 150, 10, 45, 10, "FATURA", size=18, weight="bold", color=amber, align="right", ls=0.5),
        text("sh-lbl-number", 128, 22, 27, 5, "No:", size=8, color="#d1d5db", align="right"),
        field("sh-val-number", 157, 22, 38, 5, "invoice.number", "Fatura No", size=9, weight="bold", color=white, align="right"),
        text("sh-lbl-date", 128, 28, 27, 5, "Tarih:", size=8, color="#d1d5db", align="right"),
        field("sh-val-date", 157, 28, 38, 5, "invoice.date", "Fatura Tarihi", size=9, color=white, align="right"),
        text("sh-lbl-due", 128, 34, 27, 5, "Vade:", size=8, color="#d1d5db", align="right"),
        field("sh-val-due", 157, 34, 38, 5, "invoice.due_date", "Vade Tarihi", size=9, color=white, align="right"),
        line("sh-accent", 0, 45.5, 210, color=amber, width=1.2, rotation=-0.6),
        rect("sh-company-panel", 15, 52, 86, 28, fill=panel, border=panel, bw=0),
        line("sh-company-accent", 15, 52, 20, color=amber, width=0.8),
        text("sh-company-tax-label", 19, 56, 60, 5, "VERGİ BİLGİLERİ", size=7, weight="bold", color=ink, ls=0.3),
        field("sh-company-tax-office", 19, 62, 78, 5, "company.tax_office", "Vergi Dairesi", size=8, color="#374151"),
        field("sh-company-tax-number", 19, 68, 78, 5, "company.tax_number", "Vergi No", size=8, color="#374151"),
        rect("sh-customer-panel", 109, 52, 86, 28, fill=panel, border=panel, bw=0),
        line("sh-customer-accent", 109, 52, 20, color=amber, width=0.8),
        text("sh-customer-label", 113, 56, 60, 5, "FATURA KESİLEN", size=7, weight="bold", color=ink, ls=0.3),
        field("sh-customer-name", 113, 62, 78, 6, "customer.name", "Müşteri Adı", size=10, weight="bold", color=ink),
        field("sh-customer-address", 113, 69, 78, 6, "customer.address", "Müşteri Adresi", size=7, color="#374151"),
        table("sh-table", 15, 84, 180, 100, COLUMNS_7, header_size=8, header_bg=ink, header_color=white,
              row_size=9, row_h=7, border_color=amber, border_w=0.2, zebra=True),
        line("sh-totals-line1", 130, 187, 65, color="#d1d5db", width=0.2),
        text("sh-lbl-subtotal", 130, 190, 40, 5, "Ara Toplam", size=9, color="#374151"),
        field("sh-val-subtotal", 170, 190, 25, 5, "totals.subtotal", "Ara Toplam", size=9, align="right"),
        text("sh-lbl-tax", 130, 196, 40, 5, "KDV", size=9, color="#374151"),
        field("sh-val-tax", 170, 196, 25, 5, "totals.tax", "KDV", size=9, align="right"),
        rect("sh-grand-card", 130, 203, 65, 12, fill=ink, border=ink, bw=0),
        text("sh-lbl-grand", 134, 206.5, 40, 6, "GENEL TOPLAM", size=10, weight="bold", color=amber),
        field("sh-val-grand", 165, 206.5, 27, 6, "totals.grand_total", "Genel Toplam", size=12, weight="bold", color=white, align="right"),
        line("sh-footer-accent", 0, 237, 210, color=amber, width=1, rotation=0.4),
        text("sh-bank-label", 15, 241, 60, 5, "Banka Bilgileri", size=8, weight="bold", color=ink),
        bank("sh-bank", 15, 247, 178, 20, slot=1, size=7, color="#374151"),
        signature("sh-signature", 15, 272, 32, 14, label="Yetkili İmza"),
        qrcode("sh-qr", 160, 271, 16, 16, source="invoice_number"),
    ]


def build_clean() -> list[dict]:
    accent = "#059669"
    accent_bg = "#ecfdf5"
    ink = "#111827"
    gray = "#6b7280"
    return [
        logo("ce-logo", 15, 16, 32, 18, z=6),
        field("ce-company-name", 52, 16, 90, 9, "company.company_name", "Şirket Adı", size=15, weight="normal", color=ink),
        field("ce-company-address", 52, 26, 110, 6, "company.address", "Şirket Adresi", size=8, color=gray),
        rect("ce-meta-card", 138, 14, 57, 30, fill=accent_bg, border=accent_bg, bw=0, radius=3),
        text("ce-title", 142, 17, 49, 6, "FATURA", size=10, weight="bold", color=accent, align="left", ls=0.6),
        text("ce-lbl-number", 142, 24, 49, 4, "Fatura No", size=6.5, color=accent, ls=0.3),
        field("ce-val-number", 142, 28, 49, 5, "invoice.number", "Fatura No", size=9, weight="bold", color=ink),
        text("ce-lbl-date", 142, 33.5, 25, 4, "Tarih", size=6.5, color=accent, ls=0.3),
        field("ce-val-date", 142, 37.5, 25, 5, "invoice.date", "Fatura Tarihi", size=8, color=ink),
        text("ce-lbl-due", 168, 33.5, 25, 4, "Vade", size=6.5, color=accent, ls=0.3),
        field("ce-val-due", 168, 37.5, 25, 5, "invoice.due_date", "Vade Tarihi", size=8, color=ink),
        rect("ce-customer-card", 15, 50, 180, 26, fill=accent_bg, border=accent_bg, bw=0, radius=3),
        text("ce-customer-label", 20, 54, 60, 4, "FATURA KESİLEN", size=7, weight="bold", color=accent, ls=0.4),
        field("ce-customer-name", 20, 59, 90, 6, "customer.name", "Müşteri Adı", size=11, weight="bold", color=ink, lh=1.4),
        field("ce-customer-address", 20, 66, 90, 6, "customer.address", "Müşteri Adresi", size=8, color=gray, lh=1.4),
        field("ce-customer-tax-office", 115, 59, 75, 5, "customer.tax_office", "Vergi Dairesi", size=8, color=gray),
        field("ce-customer-tax-number", 115, 65, 75, 5, "customer.tax_number", "Vergi No", size=8, color=gray),
        table("ce-table", 15, 82, 180, 100, COLUMNS_7, header_size=8, header_bg="#ffffff", header_color=accent,
              row_size=9, row_h=8, border_color="#e5e7eb", border_w=0.2, zebra=False),
        line("ce-totals-rule", 130, 188, 65, color="#e5e7eb", width=0.2),
        text("ce-lbl-subtotal", 130, 191, 40, 5, "Ara Toplam", size=9, color=gray),
        field("ce-val-subtotal", 170, 191, 25, 5, "totals.subtotal", "Ara Toplam", size=9, align="right", color=ink),
        text("ce-lbl-tax", 130, 197, 40, 5, "KDV", size=9, color=gray),
        field("ce-val-tax", 170, 197, 25, 5, "totals.tax", "KDV", size=9, align="right", color=ink),
        rect("ce-grand-card", 130, 204, 65, 13, fill=accent_bg, border=accent_bg, bw=0, radius=3),
        text("ce-lbl-grand", 134, 207.5, 40, 6, "GENEL TOPLAM", size=9, weight="bold", color=accent),
        field("ce-val-grand", 130, 211.5, 61, 6, "totals.grand_total", "Genel Toplam", size=13, weight="bold", color=accent, align="right"),
        rect("ce-footer-card", 15, 235, 150, 38, fill=accent_bg, border=accent_bg, bw=0, radius=3),
        text("ce-bank-label", 20, 239, 60, 4, "BANKA BİLGİLERİ", size=7, weight="bold", color=accent, ls=0.3),
        bank("ce-bank", 20, 244, 138, 24, slot=1, size=7, color="#374151"),
        qrcode("ce-qr", 168, 240, 22, 22, source="invoice_number"),
    ]


def build_compact() -> list[dict]:
    accent = "#4338ca"
    ink = "#111827"
    gray = "#6b7280"
    header_bg = "#eef2ff"
    return [
        rect("co-band", 0, 0, 210, 16, fill=accent, border=accent, bw=0),
        logo("co-logo", 8, 2, 22, 12, z=6),
        field("co-company-name", 33, 3, 90, 8, "company.company_name", "Şirket Adı", size=12, weight="bold", color="#ffffff"),
        text("co-lbl-number", 128, 3, 20, 4, "No:", size=7, color="#e0e7ff", align="right"),
        field("co-val-number", 150, 3, 30, 4, "invoice.number", "Fatura No", size=8, weight="bold", color="#ffffff", align="right"),
        text("co-lbl-date", 128, 8, 20, 4, "Tarih:", size=7, color="#e0e7ff", align="right"),
        field("co-val-date", 150, 8, 30, 4, "invoice.date", "Fatura Tarihi", size=8, color="#ffffff", align="right"),
        text("co-lbl-due", 128, 12.5, 20, 3.5, "Vade:", size=6.5, color="#e0e7ff", align="right"),
        field("co-val-due", 150, 12.5, 30, 3.5, "invoice.due_date", "Vade Tarihi", size=7, color="#ffffff", align="right"),
        field("co-customer-name", 8, 19, 90, 5, "customer.name", "Müşteri Adı", size=10, weight="bold", color=ink),
        field("co-company-address", 8, 24, 90, 4, "company.address", "Şirket Adresi", size=6.5, color=gray),
        field("co-customer-address", 100, 19, 90, 4, "customer.address", "Müşteri Adresi", size=7, color=gray, align="right"),
        field("co-customer-tax-office", 100, 23, 44, 4, "customer.tax_office", "Vergi Dairesi", size=6.5, color=gray, align="right"),
        field("co-customer-tax-number", 146, 23, 44, 4, "customer.tax_number", "Vergi No", size=6.5, color=gray, align="right"),
        table("co-table", 15, 30, 180, 180, COLUMNS_6, header_size=7, header_bg=header_bg, header_color=accent,
              row_size=7, row_h=5, border_color="#e0e7ff", border_w=0.15, zebra=True),
        line("co-totals-rule", 130, 212, 65, color="#e0e7ff", width=0.3),
        text("co-lbl-subtotal", 130, 215, 25, 4, "Ara Toplam", size=7, color=gray),
        field("co-val-subtotal", 155, 215, 25, 4, "totals.subtotal", "Ara Toplam", size=7, align="right", color=ink),
        text("co-lbl-tax", 130, 219.5, 25, 4, "KDV", size=7, color=gray),
        field("co-val-tax", 155, 219.5, 25, 4, "totals.tax", "KDV", size=7, align="right", color=ink),
        text("co-lbl-grand", 130, 224.5, 30, 5, "GENEL TOPLAM", size=9, weight="bold", color=accent),
        field("co-val-grand", 160, 224.5, 35, 5, "totals.grand_total", "Genel Toplam", size=11, weight="bold", color=accent, align="right"),
        line("co-footer-rule", 15, 232, 180, color="#e0e7ff", width=0.2),
        text("co-bank-label", 15, 235, 40, 4, "Banka", size=7, weight="bold", color=accent),
        bank("co-bank", 15, 239, 150, 16, slot=1, size=6.5, color=gray),
        qrcode("co-qr", 168, 235, 20, 20, source="invoice_number"),
    ]


TEMPLATE_DEFS = {
    CLASSIC_ID: {"name": "Classic", "layout": build_classic(), "min_plan_key": None},
    SHARP_ID: {"name": "Sharp", "layout": build_sharp(), "min_plan_key": "business"},
    CLEAN_ID: {"name": "Clean", "layout": build_clean(), "min_plan_key": "business"},
    COMPACT_ID: {"name": "Compact", "layout": build_compact(), "min_plan_key": "business"},
}


def upgrade() -> None:
    bind = op.get_bind()
    already_seeded = bind.execute(
        sa.select(invoice_templates.c.id).where(invoice_templates.c.id.in_(SEED_TEMPLATE_IDS))
    ).first()
    if already_seeded is not None:
        return

    template_rows = [
        {
            "id": template_id,
            "user_id": None,
            "name": definition["name"],
            "is_system_template": True,
            "is_active": True,
            "page_size": "A4",
            "layout_json": definition["layout"],
            "layout_version": 2,
            "orientation": "portrait",
            "engine": "VISUAL",
            "target_format": "GENERIC",
            "min_plan_key": definition["min_plan_key"],
        }
        for template_id, definition in TEMPLATE_DEFS.items()
    ]
    op.bulk_insert(invoice_templates, template_rows)

    field_rows = []
    for template_id, definition in TEMPLATE_DEFS.items():
        seen_keys = set()
        for element in definition["layout"]:
            if element.get("type") != "dynamic-field":
                continue
            field_key = element["field_key"]
            if field_key in seen_keys:
                continue
            seen_keys.add(field_key)
            field_type, label = FIELD_LABELS[field_key]
            field_rows.append(
                {
                    "id": str(uuid.uuid4()),
                    "template_id": template_id,
                    "field_key": field_key,
                    "field_type": field_type,
                    "label": label,
                    "is_custom": False,
                    "default_value": None,
                }
            )
    op.bulk_insert(invoice_template_fields, field_rows)


def downgrade() -> None:
    bind = op.get_bind()
    bind.execute(
        invoice_template_fields.delete().where(invoice_template_fields.c.template_id.in_(SEED_TEMPLATE_IDS))
    )
    bind.execute(invoice_templates.delete().where(invoice_templates.c.id.in_(SEED_TEMPLATE_IDS)))
