"""backfill default subscriptions

Revision ID: d5e9c3a7b8f2
Revises: c4a8b9e2f6d1
Create Date: 2026-07-31 12:10:00.000000

"""
import uuid
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

revision: str = 'd5e9c3a7b8f2'
down_revision: Union[str, None] = 'c4a8b9e2f6d1'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


users = sa.table("users", sa.column("id", sa.UUID()))
subscriptions = sa.table(
    "subscriptions",
    sa.column("id", sa.UUID()),
    sa.column("user_id", sa.UUID()),
    sa.column("plan_id", sa.UUID()),
    sa.column("status", sa.String()),
)

FREE_PLAN_ID = "00000000-0000-0000-0000-0000000000f1"


def upgrade() -> None:
    bind = op.get_bind()
    all_user_ids = {row.id for row in bind.execute(sa.select(users.c.id))}
    subscribed_user_ids = {row.user_id for row in bind.execute(sa.select(subscriptions.c.user_id))}
    missing_user_ids = all_user_ids - subscribed_user_ids

    if not missing_user_ids:
        return

    op.bulk_insert(
        subscriptions,
        [
            {
                "id": str(uuid.uuid4()),
                "user_id": str(user_id),
                "plan_id": FREE_PLAN_ID,
                "status": "ACTIVE",
            }
            for user_id in missing_user_ids
        ],
    )


def downgrade() -> None:
    bind = op.get_bind()
    bind.execute(subscriptions.delete().where(subscriptions.c.plan_id == FREE_PLAN_ID))
