from pydantic import Field
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    # ── Database ──
    DATABASE_URL: str = Field(
        default="postgresql+asyncpg://user_admin:super_secret_password@localhost:5434/recruitment_system",
        description="PostgreSQL connection string"
    )

    # ── JWT ── (must match Next.js client/lib/auth-utils.ts)
    JWT_SECRET: str = Field(
        default="super-secret-jwt-key",
        description="Secret key for JWT generation"
    )
    JWT_ALGORITHM: str = "HS256"
    JWT_EXPIRE_HOURS: int = 24

    # ── Encryption (AES-256-GCM for PESEL etc.) ──
    ENCRYPTION_KEY: str = Field(
        default="12345678901234567890123456789012",
        description="32-byte key for AES-256-GCM encryption"
    )

    # ── File uploads ──
    UPLOAD_DIR: str = "./uploads"

    # ── CORS ──
    CORS_ORIGINS: list[str] = ["http://localhost:3000"]

    model_config = {"env_file": "../.env", "env_file_encoding": "utf-8", "extra": "ignore"}


settings = Settings()
