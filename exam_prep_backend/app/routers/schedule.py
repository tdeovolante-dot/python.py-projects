
from fastapi import APIRouter, HTTPException
from app.database import supabase
from app.schemas import TimetableExtraction
from app.services.timetable_service import TimetableService
from datetime import datetime, timezone
from uuid import UUID

router = APIRouter()

@router.post("/upload-timetable")
def upload_and_parse_timetable(user_id: UUID, timetable_base64: str, mime_type: str):
    """
    Reads the timetable and saves the user's exam dates to the database.
    """
    # Define the specific subjects you are taking
    my_subjects = [
        "Mathematics", 
        "Physical Sciences", 
        "Accounting", 
        "Visual Arts", 
        "English Home Language",
        "Afrikaans",
        "Life Orientation"
    ]
    
    extracted_data = TimetableService.extract_user_exams(timetable_base64, mime_type, my_subjects)
    
    # Batch insert into Supabase
    rows_to_insert = [
        {
            "user_id": str(user_id),
            "subject_name": exam.subject_name,
            "paper_number": exam.paper_number,
            "exam_date": exam.exam_date.isoformat()
        } for exam in extracted_data.exams
    ]
    
    supabase.table("exam_schedule").insert(rows_to_insert).execute()
    return {"status": "success", "exams_scheduled": len(rows_to_insert)}

@router.get("/countdown/{user_id}")
def get_live_countdown(user_id: UUID):
    """
    Returns the next upcoming exams and the exact days/hours remaining.
    """
    response = supabase.table("exam_schedule") \
        .select("*") \
        .eq("user_id", str(user_id)) \
        .gte("exam_date", datetime.now(timezone.utc).isoformat()) \
        .order("exam_date", desc=False) \
        .execute()
        
    if not response.data:
        return {"upcoming_exams": []}
        
    exams = response.data
    for exam in exams:
        exam_time = datetime.fromisoformat(exam["exam_date"])
        time_left = exam_time - datetime.now(timezone.utc)
        exam["days_remaining"] = time_left.days
        
    return {"upcoming_exams": exams}