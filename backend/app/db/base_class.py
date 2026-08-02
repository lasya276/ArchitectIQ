"""
SQLAlchemy Declarative Base — isolated to prevent circular imports.

Models import Base from here.
app.db.base imports all models (for Alembic autogenerate) and also re-exports Base.

Import hierarchy:
  base_class.py  <-- models/*.py  <-- base.py (Alembic only)
"""
from sqlalchemy.orm import declarative_base

Base = declarative_base()
