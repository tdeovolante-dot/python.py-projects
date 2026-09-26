from fastapi import APIRouter
from pydantic import BaseModel
from typing import List, Optional
import datetime
from app.services.rag_service import supabase

router = APIRouter()

class MorningSetup(BaseModel):
    user_id: str
    daily_goals: List[str]

class EveningReview(BaseModel):
    rating: int
    accomplish: str
    improve: str

class StudyBlocksReq(BaseModel):
    user_id: str

@router.get("/morning-setup/{user_id}")
async def get_morning_setup(user_id: str):
    today = datetime.date.today().isoformat()
    res = supabase.table("daily_goals").select("goals").eq("user_id", user_id).eq("date", today).execute()
    if res.data:
        return {"daily_goals": res.data[0]["goals"]}
    return {"daily_goals": []}

@router.post("/morning-setup")
async def post_morning_setup(req: MorningSetup):
    today = datetime.date.today().isoformat()
    # Replace single quotes for safety if needed, supabase handles this.
    supabase.table("daily_goals").upsert({
        "user_id": req.user_id,
        "date": today,
        "goals": req.daily_goals
    }, on_conflict="user_id,date").execute()
    return {"status": "success"}

@router.get("/weakest-topics/{user_id}")
async def get_weakest_topics(user_id: str):
    res = supabase.table("error_book").select("*").eq("user_id", user_id).order("frequency", desc=True).limit(5).execute()
    topics = []
    for row in (res.data or []):
        # Fake a performance score based on frequency
        score = max(0, 100 - (row.get('frequency', 1) * 10))
        topics.append({
            "subject": row['subject'],
            "topic": row['topic'],
            "error_category": row['error_category'],
            "performance_score": score
        })
    return {"weakest_topics": topics}

@router.post("/study-blocks/generate")
async def generate_study_blocks(req: StudyBlocksReq):
    # Fetch weakest topics to generate blocks
    res = supabase.table("error_book").select("*").eq("user_id", req.user_id).order("frequency", desc=True).limit(2).execute()
    blocks = []
    times = ["14:00 - 15:30", "16:00 - 17:00"]
    durations = [90, 60]
    
    if res.data:
        for i, row in enumerate(res.data):
            blocks.append({
                "time": times[i % len(times)],
                "subject": row['subject'],
                "topic": f"Review {row['topic']}",
                "duration": durations[i % len(durations)]
            })
    else:
        blocks = [
            {"time": "14:00 - 15:30", "subject": "Mathematics", "topic": "General Revision", "duration": 90}
        ]
        
    return {"study_blocks": blocks}

@router.put("/evening-review/{user_id}")
async def submit_evening_review(user_id: str, req: EveningReview):
    today = datetime.date.today().isoformat()
    supabase.table("evening_reviews").upsert({
        "user_id": user_id,
        "date": today,
        "rating": req.rating,
        "accomplish": req.accomplish,
        "improve": req.improve
    }, on_conflict="user_id,date").execute()
    return {"status": "success"}