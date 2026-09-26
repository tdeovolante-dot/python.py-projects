from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional
from app.services.rag_service import supabase

router = APIRouter()

class RevisionUpdate(BaseModel):
    progress: int
    confidence: Optional[str] = None

@router.get("/")
async def get_revision():
    res = supabase.table("syllabus_progress").select("*").eq("user_id", "user1").execute()
    progress = {}
    confidence = {}
    for row in (res.data or []):
        subj = row['subject']
        chap = int(row['chapter_id'])
        if subj not in progress:
            progress[subj] = {}
            confidence[subj] = {}
        progress[subj][chap] = row['progress_percent'] or 0
        confidence[subj][chap] = row['confidence']
        
    return {"progress": progress, "confidence": confidence}

@router.put("/{subject}/{chapter_id}")
async def update_revision(subject: str, chapter_id: int, req: RevisionUpdate):
    supabase.table("syllabus_progress").upsert({
        "user_id": "user1",
        "subject": subject,
        "chapter_id": str(chapter_id),
        "progress_percent": req.progress,
        "confidence": req.confidence
    }, on_conflict="user_id,subject,chapter_id").execute()
    
    return {"status": "success"}
