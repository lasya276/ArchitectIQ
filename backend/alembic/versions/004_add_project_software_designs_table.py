"""add_project_software_designs_table

Revision ID: 004_add_project_software_designs_table
Revises: 003_add_project_blueprints_table
Create Date: 2026-08-25 22:15:00.000000

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = '004_project_software_designs'
down_revision: Union[str, None] = '003_add_project_blueprints_table'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        'project_software_designs',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('project_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('blueprint_version', sa.Integer(), nullable=False),
        sa.Column('version', sa.Integer(), nullable=False, server_default='1'),
        sa.Column('status', sa.String(length=50), nullable=False, server_default='completed'),
        sa.Column('sections', postgresql.JSONB(astext_type=sa.Text()), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.ForeignKeyConstraint(['project_id'], ['projects.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_project_software_designs_id'), 'project_software_designs', ['id'], unique=False)
    op.create_index(op.f('ix_project_software_designs_project_id'), 'project_software_designs', ['project_id'], unique=False)


def downgrade() -> None:
    op.drop_index(op.f('ix_project_software_designs_project_id'), table_name='project_software_designs')
    op.drop_index(op.f('ix_project_software_designs_id'), table_name='project_software_designs')
    op.drop_table('project_software_designs')
