
import os
import io
import logging
from typing import Any, Optional
import pypdf
from dotenv import load_dotenv
from supabase import create_client
from google import genai

logger = logging.getLogger(__name__)

supabase: Optional[Any] = None
client_db: Optional[Any] = None

supabase_url = os.getenv("SUPABASE_URL")
supabase_key = (
    os.getenv("SUPABASE_KEY")
    or os.getenv("SUPABASE_SERVICE_ROLE_KEY")
    or os.getenv("SUPABASE_ANON_KEY")
)

if supabase_url and supabase_key:
    try:
        supabase = create_client(supabase_url, supabase_key)
        client_db = supabase
    except Exception:
        logger.exception("Failed to initialize Supabase client")

# Initialize modern GenAI client explicitly with API key
genai_client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))

def get_embedding(text: str):
    response = genai_client.models.embed_content(
        model="text-embedding-004",
        contents=text
    )
    return response.embedding

def retrieve_relevant_context(query: str, match_threshold: float = 0.3, match_count: int = 4) -> str:
    """Retrieves relevant text chunks from Supabase using vector similarity search."""
    try:
        query_embedding = get_embedding(query)
        if not supabase:
            return ""
        
        response = supabase.rpc(
            "match_documents",
            {
                "query_embedding": query_embedding,
                "match_threshold": match_threshold,
                "match_count": match_count
            }
        ).execute()
        
        data = response.data
        if not data:
            return ""
        
        context = "\n\n".join([chunk.get("content", "") for chunk in data])
        return context
    except Exception:
        logger.exception("Error retrieving relevant context")
        return ""

def process_and_embed_document(file_content: bytes, metadata: dict):
    """Extracts text from PDF, chunks it, generates embeddings, and saves to Supabase."""
    try:
        reader = pypdf.PdfReader(io.BytesIO(file_content))
        text = ""
        for page in reader.pages:
            extracted = page.extract_text()
            if extracted:
                text += extracted + "\n"

        chunk_size = 1000
        chunks = [text[i:i + chunk_size] for i in range(0, len(text), chunk_size)]

        for idx, chunk in enumerate(chunks):
            if not chunk.strip():
                continue
            embedding = get_embedding(chunk)
            
            if supabase:
                supabase.table("document_chunks").insert({
                    "content": chunk,
                    "embedding": embedding,
                    "metadata": {**metadata, "chunk_index": idx}
                }).execute()
        
        return {"status": "success", "chunks_processed": len(chunks)}
    except Exception as e:
        logger.exception("Error processing and embedding document")
        raise e
    