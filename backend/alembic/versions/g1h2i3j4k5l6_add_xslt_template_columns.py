"""add xslt template columns

Revision ID: g1h2i3j4k5l6
Revises: f9e8a7b6c5d4
Create Date: 2026-08-05 12:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

revision: str = 'g1h2i3j4k5l6'
down_revision: Union[str, None] = 'f9e8a7b6c5d4'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

# SQLAlchemy's SAEnum(SomePythonEnum) stores the member *name* (e.g. "VISUAL"), not its
# lowercase .value — matching the existing invoice_pdf_status/page_size enum convention.
template_engine = sa.Enum("VISUAL", "XSLT", name="template_engine")
template_format = sa.Enum("GENERIC", "E_FATURA", "INTERNATIONAL", "E_IRSALIYE_ARSIV", name="template_format")


def upgrade() -> None:
    template_engine.create(op.get_bind(), checkfirst=True)
    template_format.create(op.get_bind(), checkfirst=True)

    op.add_column(
        "invoice_templates",
        sa.Column("engine", template_engine, nullable=False, server_default="VISUAL"),
    )
    op.add_column(
        "invoice_templates",
        sa.Column("target_format", template_format, nullable=False, server_default="GENERIC"),
    )
    op.add_column("invoice_templates", sa.Column("xslt_content", sa.Text(), nullable=True))
    op.add_column("invoice_templates", sa.Column("min_plan_key", sa.String(length=20), nullable=True))

    op.alter_column("invoice_templates", "engine", server_default=None)
    op.alter_column("invoice_templates", "target_format", server_default=None)

    # Preserve today's behavior (free plan cannot duplicate/use system templates,
    # previously a hardcoded check in duplicate_template) now that gating moves to
    # this per-template column: the 3 seeded visual system templates require 'pro'.
    invoice_templates = sa.table(
        "invoice_templates",
        sa.column("id", sa.UUID()),
        sa.column("is_system_template", sa.Boolean()),
        sa.column("min_plan_key", sa.String()),
    )
    SEED_SYSTEM_TEMPLATE_IDS = [
        "00000000-0000-0000-0000-000000000001",
        "00000000-0000-0000-0000-000000000002",
        "00000000-0000-0000-0000-000000000003",
    ]
    op.execute(
        invoice_templates.update()
        .where(invoice_templates.c.id.in_(SEED_SYSTEM_TEMPLATE_IDS))
        .values(min_plan_key="pro")
    )


def downgrade() -> None:
    op.drop_column("invoice_templates", "min_plan_key")
    op.drop_column("invoice_templates", "xslt_content")
    op.drop_column("invoice_templates", "target_format")
    op.drop_column("invoice_templates", "engine")

    template_format.drop(op.get_bind(), checkfirst=True)
    template_engine.drop(op.get_bind(), checkfirst=True)
