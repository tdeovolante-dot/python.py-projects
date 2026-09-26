
from supabase import create_client, Client
from app.config import settings

url: str = settings.SUPABASE_URL
key: str = settings.SUPABASE_KEY

supabase: Client = create_client(url, key)

# Add this helper function for FastAPI dependency injection
def get_db():
    return supabase