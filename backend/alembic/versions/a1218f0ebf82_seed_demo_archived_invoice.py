"""seed_demo_archived_invoice

Revision ID: a1218f0ebf82
Revises: f6g7h8i9j0k1
Create Date: 2026-09-01 16:41:25.314564

"""
from typing import Sequence, Union
import uuid

from alembic import op
import sqlalchemy as sa

revision: str = 'a1218f0ebf82'
down_revision: Union[str, None] = 'f6g7h8i9j0k1'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

DEMO_USER_ID = "00000000-0000-0000-0000-0000000000d1"


def upgrade() -> None:
    bind = op.get_bind()

    # Get demo user's first active template
    template_result = bind.execute(
        sa.text("""
            SELECT id FROM invoice_templates
            WHERE user_id = :user_id AND is_active = true
            LIMIT 1
        """),
        {"user_id": DEMO_USER_ID},
    ).fetchone()

    if not template_result:
        return

    template_id = template_result[0]

    # Get demo user's first active customer
    customer_result = bind.execute(
        sa.text("""
            SELECT id FROM customers
            WHERE user_id = :user_id
            LIMIT 1
        """),
        {"user_id": DEMO_USER_ID},
    ).fetchone()

    if not customer_result:
        return

    customer_id = customer_result[0]

    # Create archived invoice with proper SQL
    invoice_id = str(uuid.uuid4())
    bind.execute(
        sa.text("""
            INSERT INTO invoices (
                id, user_id, customer_id, template_id, invoice_number,
                status, currency, net_total, tax_total, gross_total,
                paid_total, discount, exchange_rate, data_json, archived,
                pdf_status, created_at, updated_at
            ) VALUES (
                :id, :user_id, :customer_id, :template_id, :invoice_number,
                'sent'::invoice_status, 'USD', 0, 0, 0,
                0, 0, 1.0, '{"lines": []}'::jsonb, true,
                'pending', now(), now()
            )
        """),
        {
            "id": invoice_id,
            "user_id": DEMO_USER_ID,
            "customer_id": customer_id,
            "template_id": template_id,
            "invoice_number": "Archive-001",
        },
    )


def downgrade() -> None:
    bind = op.get_bind()

    # Delete the archived invoice we created
    bind.execute(
        sa.text("""
            DELETE FROM invoices
            WHERE user_id = :user_id AND invoice_number = :invoice_number AND archived = true
        """),
        {"user_id": DEMO_USER_ID, "invoice_number": "Archive-001"},
    )

    # Note: We don't delete the customer we may have created, as it could be referenced elsewhere
