from pydantic import BaseModel
from typing import Optional
from datetime import date
from enum import Enum

# --- Enums ---
class ErrorCategory(str, Enum):
    CONCEPTUAL = "conceptual"
    CALCULATION = "calculation"
    READING = "reading"
    INTERPRETATION = "interpretation"
    OTHER = "other"

class CognitiveLevel(str, Enum):
    KNOWLEDGE = "knowledge"
    ROUTINE_PROCEDURE = "routine_procedure"
    COMPLEX_PROCEDURE = "complex_procedure"
    PROBLEM_SOLVING = "problem_solving"

# --- Schedule & Timetable Schemas ---
class ExamEvent(BaseModel):
    subject: str
    paper: str
    date: str
    time: str

class TimetableExtraction(BaseModel):
    events: list[ExamEvent] = []

# --- Daily Accountability Schemas ---
class CreateDailyAccountability(BaseModel):
    date: date
    study_hours_goal: float = 0.0
    study_hours_completed: float = 0.0
    status: str = "pending"
    notes: Optional[str] = None

class UpdateDailyAccountability(BaseModel):
    study_hours_goal: Optional[float] = None
    study_hours_completed: Optional[float] = None
    status: Optional[str] = None
    notes: Optional[str] = None

class CreateStudyBlock(BaseModel):
    subject: str
    planned_start: str
    planned_end: str
    completed: bool = False

# --- AI Tutor & RAG Schemas ---
class TutorQueryRequest(BaseModel):
    query: str
    subject: Optional[str] = None
    topic: Optional[str] = None

class TutorResponse(BaseModel):
    response: str
    sources: list[str] = []
    suggested_followups: list[str] = []

# --- Grading Schemas ---
class GradingResult(BaseModel):
    score: float
    total_marks: float
    feedback: str
    error_categories: list[ErrorCategory] = []
    cognitive_levels: list[CognitiveLevel] = []

# --- Past Papers Schemas ---
class PaperResponse(BaseModel):
    id: str
    subject: str
    year: int
    paper_number: int
    pdf_url: str