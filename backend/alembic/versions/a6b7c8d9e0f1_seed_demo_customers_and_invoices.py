"""seed demo customers and invoices

Revision ID: a6b7c8d9e0f1
Revises: e5f6a7b8c9d0
Create Date: 2026-09-01 00:00:00.000000

"""
from datetime import date
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = 'a6b7c8d9e0f1'
down_revision: Union[str, None] = 'e5f6a7b8c9d0'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


users = sa.table(
    "users",
    sa.column("id", sa.UUID()),
    sa.column("invoice_sequence", sa.Integer()),
)

invoice_customers = sa.table(
    "invoice_customers",
    sa.column("id", sa.UUID()),
    sa.column("user_id", sa.UUID()),
    sa.column("name", sa.String()),
    sa.column("first_name", sa.String()),
    sa.column("last_name", sa.String()),
    sa.column("company_name", sa.String()),
    sa.column("customer_type", sa.String()),
    sa.column("email", sa.String()),
    sa.column("address", sa.String()),
    sa.column("city", sa.String()),
    sa.column("postal_code", sa.String()),
    sa.column("country", sa.String()),
    sa.column("phone", sa.String()),
    sa.column("tax_office", sa.String()),
    sa.column("tax_number", sa.String()),
    sa.column("is_active", sa.Boolean()),
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
    sa.column("payment_currency", sa.String()),
    sa.column("invoice_type", sa.String()),
    sa.column("scenario", sa.String()),
    sa.column("commission_payer", sa.String()),
    sa.column("recipient_contact_ids", sa.JSON()),
    sa.column("subtotal", sa.Numeric()),
    sa.column("tax_total", sa.Numeric()),
    sa.column("grand_total", sa.Numeric()),
    sa.column("data_json", sa.JSON()),
    sa.column("pdf_url", sa.String()),
    sa.column("pdf_status", sa.String()),
    sa.column("archived", sa.Boolean()),
    sa.column("payment_reminder_active", sa.Boolean()),
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
    sa.column("unit", sa.String()),
    sa.column("discount_rate", sa.Numeric()),
    sa.column("discount_amount", sa.Numeric()),
    sa.column("tax_rate", sa.Numeric()),
    sa.column("tax_amount", sa.Numeric()),
    sa.column("other_tax_amount", sa.Numeric()),
)

DEMO_USER_ID = "00000000-0000-0000-0000-0000000000d1"

# "Basit" system template, seeded in 719b9957c4bc
BASIT_TEMPLATE_ID = "00000000-0000-0000-0000-000000000001"

CUSTOMER_IDS = {
    "mavi": "00000000-0000-0000-0000-0000000000d6",
    "yildiz": "00000000-0000-0000-0000-0000000000d7",
    "deniz": "00000000-0000-0000-0000-0000000000d8",
    "ahmet": "00000000-0000-0000-0000-0000000000d9",
    "elif": "00000000-0000-0000-0000-0000000000da",
}

INVOICE_IDS = {
    "mavi": "00000000-0000-0000-0000-0000000000db",
    "yildiz": "00000000-0000-0000-0000-0000000000dc",
    "deniz": "00000000-0000-0000-0000-0000000000dd",
    "ahmet": "00000000-0000-0000-0000-0000000000de",
    "elif": "00000000-0000-0000-0000-0000000000df",
}

LINE_ITEM_ID_BASE = int("e0", 16)


def _line_item_id(offset: int) -> str:
    return f"00000000-0000-0000-0000-0000000000{LINE_ITEM_ID_BASE + offset:02x}"


def upgrade() -> None:
    bind = op.get_bind()
    already_seeded = bind.execute(
        sa.select(invoice_customers.c.id).where(invoice_customers.c.id == CUSTOMER_IDS["mavi"])
    ).first()
    if already_seeded is not None:
        return

    op.bulk_insert(
        invoice_customers,
        [
            {
                "id": CUSTOMER_IDS["mavi"],
                "user_id": DEMO_USER_ID,
                "name": "Mavi Teknoloji A.Ş.",
                "first_name": None,
                "last_name": None,
                "company_name": "Mavi Teknoloji A.Ş.",
                "customer_type": "kurumsal",
                "email": "info@maviteknoloji.example.com",
                "address": "Levent Mah. Yazılım Cad. No:12 Beşiktaş",
                "city": "İstanbul",
                "postal_code": "34330",
                "country": "Türkiye",
                "phone": "02123456701",
                "tax_office": "Levent Vergi Dairesi",
                "tax_number": "1112223330",
                "is_active": True,
            },
            {
                "id": CUSTOMER_IDS["yildiz"],
                "user_id": DEMO_USER_ID,
                "name": "Yıldız İnşaat Ltd. Şti.",
                "first_name": None,
                "last_name": None,
                "company_name": "Yıldız İnşaat Ltd. Şti.",
                "customer_type": "kurumsal",
                "email": "muhasebe@yildizinsaat.example.com",
                "address": "Çankaya Mah. Kule Sok. No:5 Çankaya",
                "city": "Ankara",
                "postal_code": "06690",
                "country": "Türkiye",
                "phone": "03124456702",
                "tax_office": "Çankaya Vergi Dairesi",
                "tax_number": "2223334441",
                "is_active": True,
            },
            {
                "id": CUSTOMER_IDS["deniz"],
                "user_id": DEMO_USER_ID,
                "name": "Deniz Lojistik San. Tic. A.Ş.",
                "first_name": None,
                "last_name": None,
                "company_name": "Deniz Lojistik San. Tic. A.Ş.",
                "customer_type": "kurumsal",
                "email": "operasyon@denizlojistik.example.com",
                "address": "Liman Mah. Nakliye Bulvarı No:88 Konak",
                "city": "İzmir",
                "postal_code": "35220",
                "country": "Türkiye",
                "phone": "02324456703",
                "tax_office": "Konak Vergi Dairesi",
                "tax_number": "3334445552",
                "is_active": True,
            },
            {
                "id": CUSTOMER_IDS["ahmet"],
                "user_id": DEMO_USER_ID,
                "name": "Ahmet Yılmaz",
                "first_name": "Ahmet",
                "last_name": "Yılmaz",
                "company_name": None,
                "customer_type": "bireysel",
                "email": "ahmet.yilmaz@example.com",
                "address": "Bahçelievler Mah. Gül Sok. No:3 Daire:7",
                "city": "Bursa",
                "postal_code": "16110",
                "country": "Türkiye",
                "phone": "05323456704",
                "tax_office": None,
                "tax_number": None,
                "is_active": True,
            },
            {
                "id": CUSTOMER_IDS["elif"],
                "user_id": DEMO_USER_ID,
                "name": "Elif Kaya",
                "first_name": "Elif",
                "last_name": "Kaya",
                "company_name": None,
                "customer_type": "bireysel",
                "email": "elif.kaya@example.com",
                "address": "Alsancak Mah. Deniz Cad. No:21 Daire:4",
                "city": "İzmir",
                "postal_code": "35230",
                "country": "Türkiye",
                "phone": "05423456705",
                "tax_office": None,
                "tax_number": None,
                "is_active": True,
            },
        ],
    )

    common_invoice_defaults = {
        "template_id": BASIT_TEMPLATE_ID,
        "currency": "TRY",
        "payment_currency": "TRY",
        "invoice_type": "SALE",
        "scenario": "COMMERCIAL",
        "commission_payer": "SELF",
        "recipient_contact_ids": [],
        "pdf_url": None,
        "pdf_status": "PENDING",
        "archived": False,
        "payment_reminder_active": False,
    }

    op.bulk_insert(
        invoices,
        [
            {
                **common_invoice_defaults,
                "id": INVOICE_IDS["mavi"],
                "user_id": DEMO_USER_ID,
                "invoice_number": "0002",
                "customer_id": CUSTOMER_IDS["mavi"],
                "status": "PAID",
                "subtotal": 15000,
                "tax_total": 1500,
                "grand_total": 16500,
                "data_json": {
                    "company_name": "Axion Demo A.Ş.",
                    "customer_name": "Mavi Teknoloji A.Ş.",
                    "invoice_number": "0002",
                    "invoice_date": str(date(2026, 6, 3)),
                },
                "issued_at": date(2026, 6, 3),
                "due_at": date(2026, 6, 17),
            },
            {
                **common_invoice_defaults,
                "id": INVOICE_IDS["yildiz"],
                "user_id": DEMO_USER_ID,
                "invoice_number": "0003",
                "customer_id": CUSTOMER_IDS["yildiz"],
                "status": "SENT",
                "subtotal": 42000,
                "tax_total": 4200,
                "grand_total": 46200,
                "data_json": {
                    "company_name": "Axion Demo A.Ş.",
                    "customer_name": "Yıldız İnşaat Ltd. Şti.",
                    "invoice_number": "0003",
                    "invoice_date": str(date(2026, 7, 10)),
                },
                "issued_at": date(2026, 7, 10),
                "due_at": date(2026, 7, 24),
            },
            {
                **common_invoice_defaults,
                "id": INVOICE_IDS["deniz"],
                "user_id": DEMO_USER_ID,
                "invoice_number": "0004",
                "customer_id": CUSTOMER_IDS["deniz"],
                "status": "OVERDUE",
                "subtotal": 27500,
                "tax_total": 2750,
                "grand_total": 30250,
                "data_json": {
                    "company_name": "Axion Demo A.Ş.",
                    "customer_name": "Deniz Lojistik San. Tic. A.Ş.",
                    "invoice_number": "0004",
                    "invoice_date": str(date(2026, 5, 15)),
                },
                "issued_at": date(2026, 5, 15),
                "due_at": date(2026, 5, 29),
            },
            {
                **common_invoice_defaults,
                "id": INVOICE_IDS["ahmet"],
                "user_id": DEMO_USER_ID,
                "invoice_number": "0005",
                "customer_id": CUSTOMER_IDS["ahmet"],
                "status": "PAID",
                "subtotal": 3500,
                "tax_total": 350,
                "grand_total": 3850,
                "data_json": {
                    "company_name": "Axion Demo A.Ş.",
                    "customer_name": "Ahmet Yılmaz",
                    "invoice_number": "0005",
                    "invoice_date": str(date(2026, 8, 1)),
                },
                "issued_at": date(2026, 8, 1),
                "due_at": date(2026, 8, 15),
            },
            {
                **common_invoice_defaults,
                "id": INVOICE_IDS["elif"],
                "user_id": DEMO_USER_ID,
                "invoice_number": "0006",
                "customer_id": CUSTOMER_IDS["elif"],
                "status": "DRAFT",
                "subtotal": 6000,
                "tax_total": 600,
                "grand_total": 6600,
                "data_json": {
                    "company_name": "Axion Demo A.Ş.",
                    "customer_name": "Elif Kaya",
                    "invoice_number": "0006",
                    "invoice_date": str(date(2026, 8, 20)),
                },
                "issued_at": date(2026, 8, 20),
                "due_at": date(2026, 9, 3),
            },
        ],
    )

    common_line_item_defaults = {
        "unit": "adet",
        "discount_rate": 0,
        "discount_amount": 0,
        "tax_rate": 10,
        "other_tax_amount": 0,
    }

    op.bulk_insert(
        invoice_line_items,
        [
            {
                **common_line_item_defaults,
                "id": _line_item_id(0),
                "invoice_id": INVOICE_IDS["mavi"],
                "description": "Yazılım Geliştirme Hizmeti",
                "quantity": 1,
                "unit_price": 15000,
                "tax_amount": 1500,
            },
            {
                **common_line_item_defaults,
                "id": _line_item_id(1),
                "invoice_id": INVOICE_IDS["yildiz"],
                "description": "Proje Yönetim Danışmanlığı",
                "quantity": 3,
                "unit_price": 14000,
                "tax_amount": 4200,
            },
            {
                **common_line_item_defaults,
                "id": _line_item_id(2),
                "invoice_id": INVOICE_IDS["deniz"],
                "description": "Lojistik Hizmet Bedeli",
                "quantity": 1,
                "unit_price": 27500,
                "tax_amount": 2750,
            },
            {
                **common_line_item_defaults,
                "id": _line_item_id(3),
                "invoice_id": INVOICE_IDS["ahmet"],
                "description": "Web Sitesi Bakım Hizmeti",
                "quantity": 1,
                "unit_price": 3500,
                "tax_amount": 350,
            },
            {
                **common_line_item_defaults,
                "id": _line_item_id(4),
                "invoice_id": INVOICE_IDS["elif"],
                "description": "Grafik Tasarım Hizmeti",
                "quantity": 2,
                "unit_price": 3000,
                "tax_amount": 600,
            },
        ],
    )

    bind.execute(users.update().where(users.c.id == DEMO_USER_ID).values(invoice_sequence=6))


def downgrade() -> None:
    bind = op.get_bind()
    for invoice_id in INVOICE_IDS.values():
        bind.execute(invoice_line_items.delete().where(invoice_line_items.c.invoice_id == invoice_id))
    bind.execute(invoices.delete().where(invoices.c.id.in_(list(INVOICE_IDS.values()))))
    bind.execute(invoice_customers.delete().where(invoice_customers.c.id.in_(list(CUSTOMER_IDS.values()))))
    bind.execute(users.update().where(users.c.id == DEMO_USER_ID).values(invoice_sequence=1))
