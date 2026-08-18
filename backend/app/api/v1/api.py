"""
API Version 1 Central Router Aggregation Module.
Includes Auth, Users, Projects, and Questionnaires API routers.
"""
from fastapi import APIRouter
from app.api.v1.auth import router as auth_router
from app.api.v1.users import router as users_router
from app.api.v1.projects import router as projects_router
from app.api.v1.questionnaires import router as questionnaires_router
from app.api.v1.blueprints import router as blueprints_router

api_router = APIRouter()

api_router.include_router(auth_router, prefix="/auth", tags=["Authentication"])
api_router.include_router(users_router, prefix="/users", tags=["Users"])
api_router.include_router(projects_router, prefix="/projects", tags=["Projects & Workspace"])
api_router.include_router(questionnaires_router, prefix="/projects", tags=["Questionnaires"])
api_router.include_router(blueprints_router, prefix="/projects", tags=["Architecture Blueprints"])

