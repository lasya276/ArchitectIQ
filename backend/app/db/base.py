"""
Database Declarative Base Registry module.
Imports Base from base_class and all ORM models to allow Alembic autogeneration.

Import order is safe because models now import from base_class (not this file).
"""
from app.db.base_class import Base  # noqa — re-exported for Alembic env.py

# Import models so Alembic autogenerate can detect schema changes
from app.models.user import User  # noqa
from app.models.project import Project  # noqa
from app.models.workspace import ProjectWorkspace  # noqa
from app.models.questionnaire import ProjectQuestionnaire  # noqa
from app.models.blueprint import ProjectBlueprint  # noqa
from app.models.software_design import ProjectSoftwareDesign  # noqa


