
from google import genai
from google.genai import types
from app.config import settings
from app.services.rag_service import RAGService
from app.schemas import TutorResponse, ErrorCategory, CognitiveLevel
from uuid import UUID

genai_client = genai.Client(api_key=settings.GEMINI_API_KEY)

class TutorService:
    @staticmethod
    def generate_tutoring_session(
        user_id: str,
        subject_id: str,
        subject_name: str,
        question_context: str,
        student_attempt_text: str,
        error_category: ErrorCategory,
        cognitive_level: str
    ) -> TutorResponse:
        
        # 1. Retrieve context from student's uploaded syllabus/notes using vector search
        retrieved_notes = RAGService.query_relevant_context(
            subject_id=subject_id,
            query_text=f"{question_context} {student_attempt_text}",
            match_count=3
        )

        # 2. Build Subject-Tailored Prompts
        subject_instructions = ""
        if "physics" in subject_name.lower():
            subject_instructions = "Check for mandatory IEB keyword omissions in definitions or sign/vector direction errors."
        elif "accounting" in subject_name.lower():
            subject_instructions = "Check GAAP/IFRS entry logic, financial statement classification, or cash flow movement errors."
        elif "math" in subject_name.lower():
            subject_instructions = "Isolate algebraic manipulation errors from core calculus/trig conceptual misunderstandings."
        elif "english" in subject_name.lower():
            subject_instructions = "Focus on literary terminology accuracy, tone analysis, or point-evidence-explanation structure."

        system_prompt = f"""
You are an expert Socratic IEB Grade 12 Tutor for {subject_name}.
The student made a mistake on a {cognitive_level} question.
Error Type Identified: {error_category.value}

SUBJECT-SPECIFIC GUIDANCE:
{subject_instructions}

RETRIEVED STUDENT NOTES & SYLLABUS REFERENCE:
{retrieved_notes}

QUESTION & STUDENT ATTEMPT:
Question: {question_context}
Student Attempt: {student_attempt_text}

INSTRUCTIONS:
1. Explain concisely WHERE the logic broke down without giving away the full answer immediately.
2. Quote the relevant rule or definition directly from the uploaded student notes provided above.
3. Provide step-by-step guidance on how to fix the approach.
4. Generate 1 targeted drill question of similar difficulty to test understanding right now.
"""

        response = genai_client.models.generate_content(
            model="gemini-1.5-pro",
            contents=system_prompt,
            config=types.GenerateContentConfig(
                response_mime_type="application/json",
                response_schema=TutorResponse,
                temperature=0.3
            )
        )

        return TutorResponse.model_validate_json(response.text)