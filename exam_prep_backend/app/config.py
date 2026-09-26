
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    SUPABASE_URL: str = ""
    SUPABASE_KEY: str = ""
    GEMINI_API_KEY: str = ""

    class Config:
        env_file = ".env"

# This is the exact variable your database.py and services are trying to import!
settings = Settings()