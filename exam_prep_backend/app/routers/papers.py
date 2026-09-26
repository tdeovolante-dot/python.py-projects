from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from typing import Optional
from app.services.rag_service import process_and_embed_document, supabase

router = APIRouter()

@router.get("/")
async def list_papers(subject: Optional[str] = None):
    query = supabase.table("document_chunks").select("document_title, created_at").eq("subject", subject) if subject else supabase.table("document_chunks").select("document_title, created_at")
    res = query.execute()
    
    # Deduplicate by document_title
    seen = set()
    papers = []
    for row in (res.data or []):
        if row['document_title'] not in seen:
            seen.add(row['document_title'])
            papers.append({
                "id": len(papers) + 1,
                "title": row['document_title'],
                "date": row['created_at'].split('T')[0] if row['created_at'] else None
            })
            
    return {"papers": papers}

@router.post("/upload")
async def upload_paper(file: UploadFile = File(...), subject: str = Form(...)):
    try:
        file_bytes = await file.read()
        num_chunks = process_and_embed_document(file_bytes, file.filename, subject)
        return {"message": f"Processed {num_chunks} chunks successfully"}
    except Exception as e:
        print(f"Upload error: {e}")
        raise HTTPException(status_code=500, detail=str(e))