"""
CRUD Package Initializer.
Exposes crud_user, crud_project, and crud_workspace instances.
"""
from app.crud.crud_user import crud_user
from app.crud.crud_project import crud_project
from app.crud.crud_workspace import crud_workspace

__all__ = ["crud_user", "crud_project", "crud_workspace"]
