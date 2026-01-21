from pydantic_settings import BaseSettings
from typing import List

class Settings(BaseSettings):
    # Database
    MONGODB_URI: str = "mongodb://localhost:27017"
    DATABASE_NAME: str = "ssdms_temple"

    # Auth
    SECRET_KEY: str = "ssdms-temple-secret-key-2024-secure"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 24 hours

    # Razorpay
    RAZORPAY_KEY_ID: str = "rzp_test_placeholder"
    RAZORPAY_KEY_SECRET: str = "placeholder_secret"

    # Temple Info
    TEMPLE_NAME: str = "श्री समर्थ धोंडुतात्या महाराज मंदिर"
    TEMPLE_LOCATION: str = "Dongarshelsoki, Maharashtra"
    TEMPLE_LAT: float = 19.0760
    TEMPLE_LNG: float = 72.8777

    # CORS
    CORS_ORIGINS: List[str] = ["http://localhost:5173", "http://localhost:3000", "http://127.0.0.1:5173"]

    class Config:
        env_file = ".env"

settings = Settings()
