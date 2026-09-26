from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from typing import Optional, List
from pydantic import BaseModel, Field
import json
from google import genai
from google.genai import types
from app.services.rag_service import retrieve_relevant_context, client, supabase

router = APIRouter()

class GradingResult(BaseModel):
    score: float
    total_marks: float
    feedback: str
    error_categories: List[str]
    cognitive_levels: List[str]

@router.post("/grade")
async def grade_submission(
    file: UploadFile = File(...),
    subject: str = Form(default="math")
):
    try:
        file_bytes = await file.read()
        mime_type = file.content_type or "image/jpeg"
        
        # Retrieve context
        context_chunks = retrieve_relevant_context("common mistakes and grading rubrics", subject)
        context_text = "\n\n".join(context_chunks)
        
        system_instruction = f"""You are an experienced IEB Grade 12 Subject Teacher for {subject}.
Grade the attached student submission based on the provided context if applicable.
Return a structured JSON with 'score', 'total_marks', 'feedback', 'error_categories', and 'cognitive_levels'.
Context: {context_text}
"""
        if "physics" in subject.lower():
            system_instruction += "For Physics: Enforce strict keyword matching. Enforce 3-step solution: Formula Choice, Vector Direction & Sign, Final Units & Direction."
        elif "accounting" in subject.lower():
            system_instruction += "For Accounting: Diagnostic ledger analysis. Highlight non-cash movement mistakes."
        elif "math" in subject.lower():
            system_instruction += "For Mathematics: Classify algebraic vs conceptual errors. Render step-by-step working using LaTeX format."
        elif "afrikaans" in subject.lower():
            system_instruction += "For Afrikaans FAL: Grade language, structure, and comprehension accuracy."
            
        # Use Gemini 1.5 Pro for vision grading
        response = client.models.generate_content(
            model='gemini-1.5-pro',
            contents=[
                types.Part.from_bytes(data=file_bytes, mime_type=mime_type),
                "Grade this student submission according to the instructions."
            ],
            config=types.GenerateContentConfig(
                system_instruction=system_instruction,
                response_mime_type="application/json",
                response_schema=GradingResult,
                temperature=0.2
            )
        )
        
        result = json.loads(response.text)
        
        # Save errors to error_book
        for error in result.get("error_categories", []):
            try:
                supabase.table("error_book").upsert({
                    "user_id": "user1",
                    "subject": subject,
                    "topic": error,
                    "error_category": error,
                    "frequency": 1
                }, on_conflict="user_id,subject,topic,error_category").execute()
            except Exception as e:
                print(f"Failed to save error: {e}")
                
        return result
    except Exception as e:
        print(f"Error grading: {e}")
        raise HTTPException(status_code=500, detail=str(e))