"""seed demo user and invoice

Revision ID: a85ba64f8453
Revises: 1d335ac0ed85
Create Date: 2026-07-31 10:46:08.058026

"""
from datetime import date
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = 'a85ba64f8453'
down_revision: Union[str, None] = '1d335ac0ed85'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


users = sa.table(
    "users",
    sa.column("id", sa.UUID()),
    sa.column("email", sa.String()),
    sa.column("full_name", sa.String()),
    sa.column("account_type", sa.String()),
    sa.column("locale", sa.String()),
    sa.column("is_demo", sa.Boolean()),
    sa.column("invoice_sequence", sa.Integer()),
)

invoice_customers = sa.table(
    "invoice_customers",
    sa.column("id", sa.UUID()),
    sa.column("user_id", sa.UUID()),
    sa.column("name", sa.String()),
    sa.column("email", sa.String()),
    sa.column("tax_number", sa.String()),
    sa.column("address", sa.String()),
)

invoices = sa.table(
    "invoices",
    sa.column("id", sa.UUID()),
    sa.column("user_id", sa.UUID()),
    sa.column("template_id", sa.UUID()),
    sa.column("invoice_number", sa.String()),
    sa.column("customer_id", sa.UUID()),
    sa.column("status", sa.String()),
    sa.column("currency", sa.String()),
    sa.column("subtotal", sa.Numeric()),
    sa.column("tax_total", sa.Numeric()),
    sa.column("grand_total", sa.Numeric()),
    sa.column("data_json", sa.JSON()),
    sa.column("pdf_url", sa.String()),
    sa.column("issued_at", sa.Date()),
    sa.column("due_at", sa.Date()),
)

invoice_line_items = sa.table(
    "invoice_line_items",
    sa.column("id", sa.UUID()),
    sa.column("invoice_id", sa.UUID()),
    sa.column("description", sa.String()),
    sa.column("quantity", sa.Numeric()),
    sa.column("unit_price", sa.Numeric()),
)

DEMO_USER_ID = "00000000-0000-0000-0000-0000000000d1"
DEMO_CUSTOMER_ID = "00000000-0000-0000-0000-0000000000d2"
DEMO_INVOICE_ID = "00000000-0000-0000-0000-0000000000d3"
DEMO_LINE_ITEM_1_ID = "00000000-0000-0000-0000-0000000000d4"
DEMO_LINE_ITEM_2_ID = "00000000-0000-0000-0000-0000000000d5"

# "Basit" system template, seeded in 719b9957c4bc
BASIT_TEMPLATE_ID = "00000000-0000-0000-0000-000000000001"


def upgrade() -> None:
    bind = op.get_bind()
    already_seeded = bind.execute(sa.select(users.c.id).where(users.c.id == DEMO_USER_ID)).first()
    if already_seeded is not None:
        return

    op.bulk_insert(
        users,
        [
            {
                "id": DEMO_USER_ID,
                "email": "demo@axioninvoice.app",
                "full_name": "Demo Kullanıcı",
                "account_type": "BIREYSEL",
                "locale": "tr",
                "is_demo": True,
                "invoice_sequence": 1,
            }
        ],
    )

    op.bulk_insert(
        invoice_customers,
        [
            {
                "id": DEMO_CUSTOMER_ID,
                "user_id": DEMO_USER_ID,
                "name": "Örnek Müşteri Ltd. Şti.",
                "email": "musteri@example.com",
                "tax_number": "1234567890",
                "address": "Örnek Mah. Deneme Cad. No:1 İstanbul",
            }
        ],
    )

    op.bulk_insert(
        invoices,
        [
            {
                "id": DEMO_INVOICE_ID,
                "user_id": DEMO_USER_ID,
                "template_id": BASIT_TEMPLATE_ID,
                "invoice_number": "INV-0001",
                "customer_id": DEMO_CUSTOMER_ID,
                "status": "DRAFT",
                "currency": "TRY",
                "subtotal": 7000,
                "tax_total": 700,
                "grand_total": 7700,
                "data_json": {
                    "company_name": "Axion Demo A.Ş.",
                    "customer_name": "Örnek Müşteri Ltd. Şti.",
                    "invoice_number": "INV-0001",
                    "invoice_date": str(date(2026, 7, 25)),
                },
                "pdf_url": None,
                "issued_at": date(2026, 7, 25),
                "due_at": date(2026, 8, 8),
            }
        ],
    )

    op.bulk_insert(
        invoice_line_items,
        [
            {
                "id": DEMO_LINE_ITEM_1_ID,
                "invoice_id": DEMO_INVOICE_ID,
                "description": "Danışmanlık Hizmeti",
                "quantity": 10,
                "unit_price": 500,
            },
            {
                "id": DEMO_LINE_ITEM_2_ID,
                "invoice_id": DEMO_INVOICE_ID,
                "description": "Yazılım Lisansı",
                "quantity": 1,
                "unit_price": 2000,
            },
        ],
    )


def downgrade() -> None:
    bind = op.get_bind()
    bind.execute(invoice_line_items.delete().where(invoice_line_items.c.invoice_id == DEMO_INVOICE_ID))
    bind.execute(invoices.delete().where(invoices.c.id == DEMO_INVOICE_ID))
    bind.execute(invoice_customers.delete().where(invoice_customers.c.id == DEMO_CUSTOMER_ID))
    bind.execute(users.delete().where(users.c.id == DEMO_USER_ID))
