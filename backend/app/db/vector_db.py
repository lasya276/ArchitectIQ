import logging
import chromadb
from chromadb.config import Settings as ChromaSettings
from app.core.config import settings

logger = logging.getLogger(__name__)

def get_chroma_client():
    """Initialize and return a persistent ChromaDB client instance."""
    try:
        client = chromadb.PersistentClient(path=settings.CHROMA_DB_PATH)
        return client
    except Exception as e:
        logger.error(f"ChromaDB Client Initialization Error: {str(e)}")
        raise e

def check_chroma_connection() -> dict:
    """Verify connectivity and status of ChromaDB vector store."""
    try:
        client = get_chroma_client()
        heartbeat = client.heartbeat()
        return {
            "status": "healthy",
            "message": "ChromaDB connection successful",
            "heartbeat": heartbeat
        }
    except Exception as e:
        logger.error(f"ChromaDB Connection Error: {str(e)}")
        return {
            "status": "unhealthy",
            "message": f"ChromaDB connection failed: {str(e)}"
        }
