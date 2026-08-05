"""add allows_custom_xslt_templates to plans

Revision ID: h2i3j4k5l6m7
Revises: g1h2i3j4k5l6
Create Date: 2026-08-05 12:05:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

revision: str = 'h2i3j4k5l6m7'
down_revision: Union[str, None] = 'g1h2i3j4k5l6'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


plans = sa.table(
    "plans",
    sa.column("key", sa.String()),
    sa.column("allows_custom_xslt_templates", sa.Boolean()),
)


def upgrade() -> None:
    op.add_column(
        "plans",
        sa.Column("allows_custom_xslt_templates", sa.Boolean(), nullable=False, server_default="false"),
    )
    op.execute(
        plans.update().where(plans.c.key == "business").values(allows_custom_xslt_templates=True)
    )


def downgrade() -> None:
    op.drop_column("plans", "allows_custom_xslt_templates")
