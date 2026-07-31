"""create plan and subscription tables

Revision ID: b3f2a7c1d4e5
Revises: a85ba64f8453
Create Date: 2026-07-31 12:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

revision: str = 'b3f2a7c1d4e5'
down_revision: Union[str, None] = 'a85ba64f8453'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table('plans',
    sa.Column('id', sa.UUID(), nullable=False),
    sa.Column('key', sa.String(length=20), nullable=False),
    sa.Column('name', sa.String(length=100), nullable=False),
    sa.Column('price_monthly', sa.Numeric(precision=10, scale=2), nullable=False),
    sa.Column('price_yearly', sa.Numeric(precision=10, scale=2), nullable=False),
    sa.Column('max_invoices_per_month', sa.Integer(), nullable=True),
    sa.Column('max_templates', sa.Integer(), nullable=True),
    sa.Column('stripe_price_id_monthly', sa.String(length=255), nullable=True),
    sa.Column('stripe_price_id_yearly', sa.String(length=255), nullable=True),
    sa.PrimaryKeyConstraint('id'),
    sa.UniqueConstraint('key')
    )
    op.create_table('subscriptions',
    sa.Column('id', sa.UUID(), nullable=False),
    sa.Column('user_id', sa.UUID(), nullable=False),
    sa.Column('plan_id', sa.UUID(), nullable=False),
    sa.Column('stripe_customer_id', sa.String(length=255), nullable=True),
    sa.Column('stripe_subscription_id', sa.String(length=255), nullable=True),
    sa.Column('status', sa.Enum('ACTIVE', 'PAST_DUE', 'CANCELED', 'TRIALING', name='subscription_status'), nullable=False),
    sa.Column('billing_interval', sa.Enum('MONTHLY', 'YEARLY', name='billing_interval'), nullable=True),
    sa.Column('current_period_end', sa.DateTime(timezone=True), nullable=True),
    sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
    sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
    sa.ForeignKeyConstraint(['plan_id'], ['plans.id'], ondelete='RESTRICT'),
    sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
    sa.PrimaryKeyConstraint('id'),
    sa.UniqueConstraint('user_id'),
    sa.UniqueConstraint('stripe_subscription_id')
    )
    op.create_index(op.f('ix_subscriptions_plan_id'), 'subscriptions', ['plan_id'], unique=False)
    op.create_index(op.f('ix_subscriptions_user_id'), 'subscriptions', ['user_id'], unique=True)


def downgrade() -> None:
    op.drop_index(op.f('ix_subscriptions_user_id'), table_name='subscriptions')
    op.drop_index(op.f('ix_subscriptions_plan_id'), table_name='subscriptions')
    op.drop_table('subscriptions')
    op.drop_table('plans')
    sa.Enum(name='subscription_status').drop(op.get_bind(), checkfirst=True)
    sa.Enum(name='billing_interval').drop(op.get_bind(), checkfirst=True)
