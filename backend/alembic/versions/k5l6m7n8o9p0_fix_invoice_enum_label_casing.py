"""fix invoice_type, invoice_scenario, commission_payer enum label casing

Revision ID: k5l6m7n8o9p0
Revises: j4k5l6m7n8o9
Create Date: 2026-08-06 00:00:00.000000

"""
from typing import Sequence, Union

from alembic import op

# revision identifiers, used by Alembic.
revision: str = 'k5l6m7n8o9p0'
down_revision: Union[str, None] = 'j4k5l6m7n8o9'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.execute("ALTER TYPE invoice_type RENAME VALUE 'sale' TO 'SALE'")
    op.execute("ALTER TYPE invoice_type RENAME VALUE 'purchase' TO 'PURCHASE'")
    op.execute("ALTER TYPE invoice_scenario RENAME VALUE 'commercial' TO 'COMMERCIAL'")
    op.execute("ALTER TYPE commission_payer RENAME VALUE 'self' TO 'SELF'")
    op.execute("ALTER TYPE commission_payer RENAME VALUE 'customer' TO 'CUSTOMER'")

    op.execute("ALTER TABLE invoices ALTER COLUMN invoice_type SET DEFAULT 'SALE'")
    op.execute("ALTER TABLE invoices ALTER COLUMN scenario SET DEFAULT 'COMMERCIAL'")
    op.execute("ALTER TABLE invoices ALTER COLUMN commission_payer SET DEFAULT 'SELF'")


def downgrade() -> None:
    op.execute("ALTER TABLE invoices ALTER COLUMN invoice_type SET DEFAULT 'sale'")
    op.execute("ALTER TABLE invoices ALTER COLUMN scenario SET DEFAULT 'commercial'")
    op.execute("ALTER TABLE invoices ALTER COLUMN commission_payer SET DEFAULT 'self'")

    op.execute("ALTER TYPE invoice_type RENAME VALUE 'SALE' TO 'sale'")
    op.execute("ALTER TYPE invoice_type RENAME VALUE 'PURCHASE' TO 'purchase'")
    op.execute("ALTER TYPE invoice_scenario RENAME VALUE 'COMMERCIAL' TO 'commercial'")
    op.execute("ALTER TYPE commission_payer RENAME VALUE 'SELF' TO 'self'")
    op.execute("ALTER TYPE commission_payer RENAME VALUE 'CUSTOMER' TO 'customer'")
