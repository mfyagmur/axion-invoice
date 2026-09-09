"""create security_alerts table

Revision ID: f6a7b8c9d1e2
Revises: e5f6a7b8c9d1
Create Date: 2026-09-09 09:10:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


revision: str = 'f6a7b8c9d1e2'
down_revision: Union[str, None] = 'e5f6a7b8c9d1'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

def upgrade() -> None:
    op.create_table(
        'security_alerts',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('severity', sa.Enum('critical', 'high', 'web_server', 'low', name='security_alert_severity'), nullable=False),
        sa.Column('category', sa.String(100), nullable=False),
        sa.Column('title', sa.String(255), nullable=False),
        sa.Column('description', sa.String(1000), nullable=True),
        sa.Column('source', sa.String(100), nullable=True),
        sa.Column('is_resolved', sa.Boolean(), nullable=False, server_default='false'),
        sa.Column('resolved_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index('ix_security_alerts_created_at', 'security_alerts', ['created_at'])


def downgrade() -> None:
    op.drop_index('ix_security_alerts_created_at', table_name='security_alerts')
    op.drop_table('security_alerts')
    sa.Enum(name='security_alert_severity').drop(op.get_bind(), checkfirst=True)
