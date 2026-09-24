"""
CRUD Package Initializer.
Exposes crud_user, crud_project, crud_workspace, crud_questionnaire, crud_blueprint, and crud_software_design instances.
"""
from app.crud.crud_user import crud_user
from app.crud.crud_project import crud_project
from app.crud.crud_workspace import crud_workspace
from app.crud.crud_questionnaire import crud_questionnaire
from app.crud.crud_blueprint import crud_blueprint
from app.crud.crud_software_design import crud_software_design

__all__ = [
    "crud_user",
    "crud_project",
    "crud_workspace",
    "crud_questionnaire",
    "crud_blueprint",
    "crud_software_design",
]

