import logging
from app.core.config import settings

# --- Phase 2: ChromaDB is NOT required. Guarded for future RAG phase. ---
# NOTE: We catch Exception (not just ImportError) because the installed version
# of chromadb is incompatible with NumPy 2.0 and raises AttributeError on import.
# All ChromaDB code is preserved here for re-enablement in the RAG phase.
try:
    import chromadb
    from chromadb.config import Settings as ChromaSettings
    CHROMA_AVAILABLE = True
except Exception:  # noqa: BLE001 — catches ImportError AND numpy/chromadb AttributeError
    chromadb = None  # type: ignore[assignment]
    ChromaSettings = None  # type: ignore[assignment]
    CHROMA_AVAILABLE = False

logger = logging.getLogger(__name__)

def get_chroma_client():
    """Initialize and return a persistent ChromaDB client instance.

    NOTE: ChromaDB is disabled in Phase 2. This function is preserved
    for the future RAG phase and will raise if called when unavailable.
    """
    if not CHROMA_AVAILABLE:
        raise RuntimeError(
            "ChromaDB is not installed. It is required only for the RAG phase."
        )
    try:
        client = chromadb.PersistentClient(path=settings.CHROMA_DB_PATH)
        return client
    except Exception as e:
        logger.error(f"ChromaDB Client Initialization Error: {str(e)}")
        raise e

def check_chroma_connection() -> dict:
    """Verify connectivity and status of ChromaDB vector store.

    Returns a 'disabled' status when ChromaDB is not installed (Phase 2).
    """
    if not CHROMA_AVAILABLE:
        logger.info("ChromaDB is disabled in Phase 2. Skipping connection check.")
        return {
            "status": "disabled",
            "message": "ChromaDB is not enabled in Phase 2 (reserved for RAG phase)"
        }
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
