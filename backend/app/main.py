"""
ArchitectIQ Main FastAPI Application Module.
Integrates Phase 1 infrastructure, Phase 2 Auth & Project API Routers, CORS Middleware, and Centralized Exception Handling.
"""
import logging
from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from starlette.exceptions import HTTPException as StarletteHTTPException

from app.core.config import settings
from app.db.session import check_postgres_connection
from app.db.vector_db import check_chroma_connection
from app.api.v1.api import api_router

logger = logging.getLogger(__name__)

app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    description="ArchitectIQ Backend Services — User Authentication & Project Workspace Management"
)

# Configure CORS Middleware for Cookie Credentials Transport
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global Exception Handler for HTTP Exceptions
@app.exception_handler(StarletteHTTPException)
async def http_exception_handler(request: Request, exc: StarletteHTTPException):
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "status": "error",
            "statusCode": exc.status_code,
            "message": exc.detail,
        },
    )

# Global Exception Handler for Pydantic Validation Errors
@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={
            "status": "error",
            "statusCode": status.HTTP_422_UNPROCESSABLE_ENTITY,
            "message": "Validation Error",
            "details": exc.errors(),
        },
    )

# Global Exception Handler for Unhandled Exception Errors
@app.exception_handler(Exception)
async def general_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled Server Error: {str(exc)}", exc_info=True)
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "status": "error",
            "statusCode": status.HTTP_500_INTERNAL_SERVER_ERROR,
            "message": "An internal server error occurred.",
        },
    )

# Include Version 1 API Router (/api/v1)
app.include_router(api_router, prefix=settings.API_V1_STR)

@app.get("/")
def root():
    """Root status endpoint."""
    return {
        "name": settings.PROJECT_NAME,
        "status": "online",
        "version": "2.0.0",
        "docs_url": "/docs"
    }

@app.get(f"{settings.API_V1_STR}/health")
def health_check():
    """
    Health Check Endpoint.
    Verifies API and PostgreSQL DB connectivity.
    ChromaDB (vector store) is disabled in Phase 2 and will be enabled in the RAG phase.
    """
    postgres_status = check_postgres_connection()
    chroma_status = check_chroma_connection()

    # ChromaDB 'disabled' is acceptable in Phase 2 — only Postgres must be healthy.
    is_system_healthy = postgres_status.get("status") == "healthy"

    return {
        "status": "healthy" if is_system_healthy else "degraded",
        "services": {
            "api": {"status": "healthy"},
            "database": postgres_status,
            "vector_store": chroma_status  # Preserved for future RAG phase
        }
    }
