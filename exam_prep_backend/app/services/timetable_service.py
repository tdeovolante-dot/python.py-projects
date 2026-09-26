
import base64
from google import genai
from google.genai import types
from app.config import settings
from app.schemas import TimetableExtraction

genai_client = genai.Client(api_key=settings.GEMINI_API_KEY)

class TimetableService:
    @staticmethod
    def extract_user_exams(timetable_base64: str, mime_type: str, user_subjects: list[str]) -> TimetableExtraction:
        file_bytes = base64.b64decode(timetable_base64)
        
        prompt = f"""
        Extract the exam dates and times from this IEB final timetable document.
        Filter the results ONLY for the following subjects: {', '.join(user_subjects)}.
        Convert all times to standard ISO 8601 format assuming South African Standard Time (SAST).
        """

        response = genai_client.models.generate_content(
            model="gemini-1.5-pro",
            contents=[
                types.Part.from_bytes(data=file_bytes, mime_type=mime_type),
                prompt
            ],
            config=types.GenerateContentConfig(
                response_mime_type="application/json",
                response_schema=TimetableExtraction,
                temperature=0.0
            )
        )

        return TimetableExtraction.model_validate_json(response.text)