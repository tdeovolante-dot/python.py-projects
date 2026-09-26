from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional
from app.services.rag_service import supabase

router = APIRouter()

class NoteCreate(BaseModel):
    title: str
    subject: str
    content: str

class NoteUpdate(BaseModel):
    title: Optional[str] = None
    subject: Optional[str] = None
    content: Optional[str] = None

@router.get("/")
async def get_notes():
    res = supabase.table("notes").select("*").eq("user_id", "user1").execute()
    notes = []
    for row in (res.data or []):
        notes.append({
            "id": row['id'],
            "title": row['title'],
            "subject": row['subject'],
            "content": row['content'],
            "date": row['updated_at'].split('T')[0] if row['updated_at'] else None
        })
    return {"notes": notes}

@router.post("/")
async def create_note(note: NoteCreate):
    res = supabase.table("notes").insert({
        "user_id": "user1",
        "title": note.title,
        "subject": note.subject,
        "content": note.content
    }).execute()
    if res.data:
        row = res.data[0]
        return {
            "id": row['id'],
            "title": row['title'],
            "subject": row['subject'],
            "content": row['content'],
            "date": row['updated_at'].split('T')[0] if row['updated_at'] else None
        }
    return {}

@router.put("/{note_id}")
async def update_note(note_id: int, note: NoteUpdate):
    updates = {}
    if note.title is not None: updates["title"] = note.title
    if note.subject is not None: updates["subject"] = note.subject
    if note.content is not None: updates["content"] = note.content
    
    res = supabase.table("notes").update(updates).eq("id", note_id).eq("user_id", "user1").execute()
    if res.data:
        row = res.data[0]
        return {
            "id": row['id'],
            "title": row['title'],
            "subject": row['subject'],
            "content": row['content'],
            "date": row['updated_at'].split('T')[0] if row['updated_at'] else None
        }
    return {}

@router.delete("/{note_id}")
async def delete_note(note_id: int):
    supabase.table("notes").delete().eq("id", note_id).eq("user_id", "user1").execute()
    return {"status": "success"}
