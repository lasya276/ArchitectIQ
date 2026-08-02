import os
from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import List, Optional

class Settings(BaseSettings):
    """
    Application Settings configuration class loading environment variables.
    """
    PROJECT_NAME: str = "ArchitectIQ API"
    API_V1_STR: str = "/api/v1"
    
    # PostgreSQL Configuration
    POSTGRES_USER: str = "architect_user"
    POSTGRES_PASSWORD: str = "architect_secure_password"
    POSTGRES_HOST: str = "localhost"
    POSTGRES_PORT: str = "5432"
    POSTGRES_DB: str = "architectiq_db"
    
    # ChromaDB Vector Storage Configuration
    CHROMA_DB_PATH: str = "./chroma_data"
    
    # Security & JWT Token Settings
    JWT_SECRET: str = "architectiq_dev_super_secret_key_change_in_production_32bytes"
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
        """Construct PostgreSQL SQLAlchemy Connection String."""
        return f"postgresql://{self.POSTGRES_USER}:{self.POSTGRES_PASSWORD}@{self.POSTGRES_HOST}:{self.POSTGRES_PORT}/{self.POSTGRES_DB}"

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

settings = Settings()
