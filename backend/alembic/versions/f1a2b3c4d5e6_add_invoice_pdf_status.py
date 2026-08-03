"""add invoice pdf_status and pdf_error

Revision ID: f1a2b3c4d5e6
Revises: d5e9c3a7b8f2
Create Date: 2026-08-03 10:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

revision: str = 'f1a2b3c4d5e6'
down_revision: Union[str, None] = 'd5e9c3a7b8f2'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

# SQLAlchemy's SAEnum(SomePythonEnum) stores the member *name* (e.g. "PENDING"), not its
# lowercase .value — matching the existing invoice_status enum's convention ('DRAFT', 'SENT', ...).
invoice_pdf_status = sa.Enum("PENDING", "READY", "FAILED", name="invoice_pdf_status")


def upgrade() -> None:
    invoice_pdf_status.create(op.get_bind(), checkfirst=True)
    op.add_column(
        "invoices",
        sa.Column(
            "pdf_status",
            invoice_pdf_status,
            nullable=False,
            server_default="PENDING",
        ),
    )
    op.add_column("invoices", sa.Column("pdf_error", sa.String(length=1000), nullable=True))

    invoices = sa.table(
        "invoices",
        sa.column("pdf_url", sa.String()),
        sa.column("pdf_status", invoice_pdf_status),
    )
    op.execute(invoices.update().where(invoices.c.pdf_url.isnot(None)).values(pdf_status="READY"))

    op.alter_column("invoices", "pdf_status", server_default=None)


def downgrade() -> None:
    op.drop_column("invoices", "pdf_error")
    op.drop_column("invoices", "pdf_status")
    invoice_pdf_status.drop(op.get_bind(), checkfirst=True)
