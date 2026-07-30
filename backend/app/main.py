from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.db.session import check_postgres_connection
from app.db.vector_db import check_chroma_connection

app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    description="ArchitectIQ Backend Services — Phase 1 Base Infrastructure"
)

# Configure CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def root():
    return {
        "name": settings.PROJECT_NAME,
        "status": "online",
        "docs_url": "/docs"
    }

@app.get(f"{settings.API_V1_STR}/health")
def health_check():
    """
    Phase 1 Health Check Endpoint.
    Verifies API, PostgreSQL, and ChromaDB vector store connectivity.
    """
    postgres_status = check_postgres_connection()
    chroma_status = check_chroma_connection()
    
    is_system_healthy = (
        postgres_status.get("status") == "healthy" and 
        chroma_status.get("status") == "healthy"
    )

    return {
        "status": "healthy" if is_system_healthy else "degraded",
        "services": {
            "api": {"status": "healthy"},
            "database": postgres_status,
            "vector_store": chroma_status
        }
    }
