from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    # ── Database ──
    DATABASE_URL: str = (
        "postgresql+asyncpg://user_admin:super_secret_password@localhost:5432/recruitment_system"
    )

    # ── JWT ── (must match Next.js client/lib/auth-utils.ts)
    JWT_SECRET: str = "super-secret-jwt-key"
    JWT_ALGORITHM: str = "HS256"
    JWT_EXPIRE_HOURS: int = 24

    # ── Encryption (AES-256-GCM for PESEL etc.) ──
    ENCRYPTION_KEY: str = "12345678901234567890123456789012"

    # ── File uploads ──
    UPLOAD_DIR: str = "./uploads"

    # ── CORS ──
    CORS_ORIGINS: list[str] = ["http://localhost:3000"]

    model_config = {"env_file": "../.env", "env_file_encoding": "utf-8"}


settings = Settings()
