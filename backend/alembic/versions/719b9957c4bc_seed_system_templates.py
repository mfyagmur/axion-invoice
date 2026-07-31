"""seed system templates

Revision ID: 719b9957c4bc
Revises: 3e6260b79a4e
Create Date: 2026-07-31 09:52:16.728210

"""
import uuid
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = '719b9957c4bc'
down_revision: Union[str, None] = '3e6260b79a4e'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


invoice_templates = sa.table(
    "invoice_templates",
    sa.column("id", sa.UUID()),
    sa.column("user_id", sa.UUID()),
    sa.column("name", sa.String()),
    sa.column("is_system_template", sa.Boolean()),
    sa.column("page_size", sa.String()),
    sa.column("layout_json", sa.JSON()),
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
BASIT_ID = "00000000-0000-0000-0000-000000000001"
KURUMSAL_ID = "00000000-0000-0000-0000-000000000002"
MINIMAL_ID = "00000000-0000-0000-0000-000000000003"
SEED_TEMPLATE_IDS = [BASIT_ID, KURUMSAL_ID, MINIMAL_ID]

# field_key -> (field_type, label). field_type values must match the Postgres enum's stored
# names (SQLAlchemy's Enum(PythonEnum) persists the member NAME, e.g. "TEXT", not its value
# "text" — same convention already used by users.account_type / "BIREYSEL"/"KURUMSAL").
FIELD_CATALOG = {
    "company_name": ("TEXT", "Şirket Adı"),
    "customer_name": ("TEXT", "Müşteri Adı"),
    "invoice_number": ("TEXT", "Fatura No"),
    "invoice_date": ("DATE", "Fatura Tarihi"),
    "due_date": ("DATE", "Vade Tarihi"),
    "subtotal": ("CURRENCY", "Ara Toplam"),
    "tax": ("CURRENCY", "Vergi"),
}

TEMPLATE_DEFS = {
    BASIT_ID: {
        "name": "Basit",
        "layout": [
            {"field_key": "company_name", "x_mm": 15, "y_mm": 15, "width_mm": 70, "height_mm": 10, "font_size": 14, "bold": True, "align": "left"},
            {"field_key": "invoice_number", "x_mm": 140, "y_mm": 15, "width_mm": 55, "height_mm": 6, "font_size": 10, "bold": False, "align": "right"},
            {"field_key": "invoice_date", "x_mm": 140, "y_mm": 23, "width_mm": 55, "height_mm": 6, "font_size": 10, "bold": False, "align": "right"},
            {"field_key": "customer_name", "x_mm": 15, "y_mm": 40, "width_mm": 80, "height_mm": 8, "font_size": 12, "bold": True, "align": "left"},
            {"field_key": "subtotal", "x_mm": 140, "y_mm": 250, "width_mm": 55, "height_mm": 6, "font_size": 10, "bold": False, "align": "right"},
            {"field_key": "tax", "x_mm": 140, "y_mm": 258, "width_mm": 55, "height_mm": 6, "font_size": 10, "bold": False, "align": "right"},
        ],
    },
    KURUMSAL_ID: {
        "name": "Kurumsal",
        "layout": [
            {"field_key": "company_name", "x_mm": 15, "y_mm": 15, "width_mm": 90, "height_mm": 12, "font_size": 16, "bold": True, "align": "left"},
            {"field_key": "customer_name", "x_mm": 15, "y_mm": 60, "width_mm": 80, "height_mm": 8, "font_size": 12, "bold": True, "align": "left"},
            {"field_key": "invoice_number", "x_mm": 140, "y_mm": 15, "width_mm": 55, "height_mm": 6, "font_size": 10, "bold": False, "align": "right"},
            {"field_key": "invoice_date", "x_mm": 140, "y_mm": 23, "width_mm": 55, "height_mm": 6, "font_size": 10, "bold": False, "align": "right"},
            {"field_key": "due_date", "x_mm": 140, "y_mm": 31, "width_mm": 55, "height_mm": 6, "font_size": 10, "bold": False, "align": "right"},
            {"field_key": "subtotal", "x_mm": 140, "y_mm": 255, "width_mm": 55, "height_mm": 6, "font_size": 10, "bold": False, "align": "right"},
            {"field_key": "tax", "x_mm": 140, "y_mm": 263, "width_mm": 55, "height_mm": 6, "font_size": 10, "bold": False, "align": "right"},
        ],
    },
    MINIMAL_ID: {
        "name": "Minimal",
        "layout": [
            {"field_key": "company_name", "x_mm": 65, "y_mm": 15, "width_mm": 80, "height_mm": 10, "font_size": 16, "bold": True, "align": "center"},
            {"field_key": "customer_name", "x_mm": 15, "y_mm": 40, "width_mm": 60, "height_mm": 6, "font_size": 9, "bold": False, "align": "left"},
            {"field_key": "invoice_date", "x_mm": 15, "y_mm": 48, "width_mm": 60, "height_mm": 6, "font_size": 9, "bold": False, "align": "left"},
            {"field_key": "invoice_number", "x_mm": 150, "y_mm": 40, "width_mm": 45, "height_mm": 6, "font_size": 9, "bold": False, "align": "right"},
            {"field_key": "subtotal", "x_mm": 150, "y_mm": 260, "width_mm": 45, "height_mm": 6, "font_size": 9, "bold": False, "align": "right"},
            {"field_key": "tax", "x_mm": 150, "y_mm": 267, "width_mm": 45, "height_mm": 6, "font_size": 9, "bold": False, "align": "right"},
        ],
    },
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
            "page_size": "A4",
            "layout_json": definition["layout"],
        }
        for template_id, definition in TEMPLATE_DEFS.items()
    ]
    op.bulk_insert(invoice_templates, template_rows)

    field_rows = []
    for template_id, definition in TEMPLATE_DEFS.items():
        for entry in definition["layout"]:
            field_key = entry["field_key"]
            field_type, label = FIELD_CATALOG[field_key]
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
