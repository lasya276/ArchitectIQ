"""add_project_blueprints_table

Revision ID: 003_add_project_blueprints_table
Revises: 239b1797ee29
Create Date: 2026-08-15 19:00:00.000000

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = '003_add_project_blueprints_table'
down_revision: Union[str, None] = '239b1797ee29'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        'project_blueprints',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('project_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('version', sa.Integer(), nullable=False, server_default='1'),
        sa.Column('status', sa.String(length=50), nullable=False, server_default='completed'),
        sa.Column('sections', postgresql.JSONB(astext_type=sa.Text()), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.ForeignKeyConstraint(['project_id'], ['projects.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_project_blueprints_id'), 'project_blueprints', ['id'], unique=False)
    op.create_index(op.f('ix_project_blueprints_project_id'), 'project_blueprints', ['project_id'], unique=False)


def downgrade() -> None:
    op.drop_index(op.f('ix_project_blueprints_project_id'), table_name='project_blueprints')
    op.drop_index(op.f('ix_project_blueprints_id'), table_name='project_blueprints')
    op.drop_table('project_blueprints')
