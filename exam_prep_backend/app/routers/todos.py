from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional
from app.services.rag_service import supabase

router = APIRouter()

class TodoCreate(BaseModel):
    title: str
    subject: str
    dueDate: Optional[str] = None
    priority: Optional[str] = "Medium"
    completed: bool = False

class TodoUpdate(BaseModel):
    title: Optional[str] = None
    subject: Optional[str] = None
    dueDate: Optional[str] = None
    priority: Optional[str] = None
    completed: Optional[bool] = None

@router.get("/")
async def get_todos():
    res = supabase.table("tasks").select("*").eq("user_id", "user1").execute()
    # Map DB names to frontend names
    todos = []
    for row in (res.data or []):
        todos.append({
            "id": row['id'],
            "title": row['title'],
            "subject": row['subject'],
            "dueDate": row['due_date'],
            "priority": row['priority'],
            "completed": row['is_completed']
        })
    return {"todos": todos}

@router.post("/")
async def create_todo(todo: TodoCreate):
    res = supabase.table("tasks").insert({
        "user_id": "user1",
        "title": todo.title,
        "subject": todo.subject,
        "due_date": todo.dueDate,
        "priority": todo.priority,
        "is_completed": todo.completed
    }).execute()
    
    if res.data:
        row = res.data[0]
        return {
            "id": row['id'],
            "title": row['title'],
            "subject": row['subject'],
            "dueDate": row['due_date'],
            "priority": row['priority'],
            "completed": row['is_completed']
        }
    return {}

@router.put("/{todo_id}")
async def update_todo(todo_id: int, todo: TodoUpdate):
    updates = {}
    if todo.title is not None: updates["title"] = todo.title
    if todo.subject is not None: updates["subject"] = todo.subject
    if todo.dueDate is not None: updates["due_date"] = todo.dueDate
    if todo.priority is not None: updates["priority"] = todo.priority
    if todo.completed is not None: updates["is_completed"] = todo.completed
    
    res = supabase.table("tasks").update(updates).eq("id", todo_id).eq("user_id", "user1").execute()
    if res.data:
        row = res.data[0]
        return {
            "id": row['id'],
            "title": row['title'],
            "subject": row['subject'],
            "dueDate": row['due_date'],
            "priority": row['priority'],
            "completed": row['is_completed']
        }
    return {}

@router.delete("/{todo_id}")
async def delete_todo(todo_id: int):
    supabase.table("tasks").delete().eq("id", todo_id).eq("user_id", "user1").execute()
    return {"status": "success"}
