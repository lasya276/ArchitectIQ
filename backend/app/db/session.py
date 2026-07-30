import logging
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker
from app.core.config import settings

logger = logging.getLogger(__name__)

engine = create_engine(
    settings.SQLALCHEMY_DATABASE_URI,
    pool_pre_ping=True,
    pool_size=5,
    max_overflow=10
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def check_postgres_connection() -> dict:
    """Verify connectivity to the PostgreSQL database."""
    try:
        with engine.connect() as connection:
            result = connection.execute(text("SELECT 1"))
            result.scalar()
            return {"status": "healthy", "message": "PostgreSQL connection successful"}
    except Exception as e:
        logger.error(f"PostgreSQL Connection Error: {str(e)}")
        return {"status": "unhealthy", "message": f"PostgreSQL connection failed: {str(e)}"}
