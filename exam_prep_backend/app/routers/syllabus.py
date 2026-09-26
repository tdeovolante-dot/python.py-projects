from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional
from app.services.rag_service import supabase

router = APIRouter()

class SyllabusUpdate(BaseModel):
    completed: bool

@router.get("/")
async def get_syllabus():
    res = supabase.table("syllabus_progress").select("*").eq("user_id", "user1").execute()
    completion = {}
    for row in (res.data or []):
        subj = row['subject']
        chap = int(row['chapter_id'])
        if subj not in completion:
            completion[subj] = {}
        completion[subj][chap] = row['is_completed']
        
    return {"completion": completion}

@router.put("/{subject}/{chapter_id}")
async def update_syllabus(subject: str, chapter_id: int, req: SyllabusUpdate):
    supabase.table("syllabus_progress").upsert({
        "user_id": "user1",
        "subject": subject,
        "chapter_id": str(chapter_id),
        "is_completed": req.completed
    }, on_conflict="user_id,subject,chapter_id").execute()
    
    return {"status": "success"}
