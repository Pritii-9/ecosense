import os

from dotenv import load_dotenv

load_dotenv()


class Config:
    """Central place for all environment-based settings."""

    APP_NAME = os.getenv("APP_NAME", "EcoSense")
    MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017")
    MONGO_DB_NAME = os.getenv("MONGO_DB_NAME", "ecosense")
    JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY", "change-me-in-production")
    JWT_EXPIRES_IN_HOURS = int(os.getenv("JWT_EXPIRES_IN_HOURS", "24"))
    AUTH_CODE_EXPIRY_MINUTES = int(os.getenv("AUTH_CODE_EXPIRY_MINUTES", "10"))
    CORS_ORIGINS = os.getenv(
        "CORS_ORIGINS",
        "http://localhost:5173,http://localhost:3000,http://localhost:8080",
    )
    CORS_ORIGINS_LIST = [origin.strip() for origin in CORS_ORIGINS.split(",") if origin.strip()]
    SMTP_HOST = os.getenv("SMTP_HOST", "")
    SMTP_PORT = int(os.getenv("SMTP_PORT", "587"))
    SMTP_USERNAME = os.getenv("SMTP_USERNAME", "")
    SMTP_PASSWORD = os.getenv("SMTP_PASSWORD", "")
    SMTP_USE_TLS = os.getenv("SMTP_USE_TLS", "true").lower() == "true"
    SMTP_FROM_EMAIL = os.getenv("SMTP_FROM_EMAIL", SMTP_USERNAME)
    SMTP_FROM_NAME = os.getenv("SMTP_FROM_NAME", APP_NAME)
