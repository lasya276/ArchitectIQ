import os
from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import List, Optional
from sqlalchemy.engine import URL

class Settings(BaseSettings):
    """
    Application Settings configuration class loading environment variables.
    """
    PROJECT_NAME: str = "ArchitectIQ API"
    API_V1_STR: str = "/api/v1"
    
    # PostgreSQL Configuration
    DATABASE_URL: Optional[str] = None
    POSTGRES_USER: Optional[str] = None
    POSTGRES_PASSWORD: Optional[str] = None
    POSTGRES_HOST: Optional[str] = None
    POSTGRES_PORT: Optional[str] = None
    POSTGRES_DB: Optional[str] = None

    # ChromaDB Vector Storage Configuration
    CHROMA_DB_PATH: str = "./chroma_data"
    
    # Security & JWT Token Settings
    JWT_SECRET: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 Days

    # HTTP-Only Cookie Configuration
    COOKIE_NAME: str = "access_token"
    COOKIE_SECURE: bool = False  # Set to True in production (HTTPS)
    COOKIE_DOMAIN: Optional[str] = None
    COOKIE_SAMESITE: str = "lax"
    
    # CORS Origins Configuration
    CORS_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://localhost:5173",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:5173",
    ]

    @property
    def SQLALCHEMY_DATABASE_URI(self) -> str:
        """Return the configured PostgreSQL URL or construct it from POSTGRES_* settings."""
        if self.DATABASE_URL:
            return self.DATABASE_URL

        postgres_settings = (
            self.POSTGRES_USER,
            self.POSTGRES_PASSWORD,
            self.POSTGRES_HOST,
            self.POSTGRES_PORT,
            self.POSTGRES_DB,
        )
        if not all(postgres_settings):
            raise ValueError(
                "Set DATABASE_URL or all five POSTGRES_* variables."
            )

        return URL.create(
            "postgresql+psycopg2",
            username=self.POSTGRES_USER,
            password=self.POSTGRES_PASSWORD,
            host=self.POSTGRES_HOST,
            port=int(self.POSTGRES_PORT),
            database=self.POSTGRES_DB,
        ).render_as_string(hide_password=False)

    # Gemini Configuration
    GEMINI_API_KEY: Optional[str] = None
    GEMINI_MODEL: str = "gemini-3.5-flash"

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

settings = Settings()
