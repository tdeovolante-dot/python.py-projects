
import json
import base64
from google import genai
from google.genai import types
from app.config import settings
from app.schemas import QuestionRubric, QuestionEvaluationResult, ErrorCategory, CognitiveLevel

genai_client = genai.Client(api_key=settings.GEMINI_API_KEY)

class GradingService:
    @staticmethod
    def evaluate_student_answer(
        question_rubric: QuestionRubric,
        image_base64: str
    ) -> QuestionEvaluationResult:
        
        # Decode base64 image bytes
        image_bytes = base64.b64decode(image_base64)

        rubric_str = question_rubric.model_dump_json(indent=2)

        prompt = f"""
You are an expert Grade 12 IEB Exam Marker. 
Evaluate the student's handwritten answer in the provided image strictly against this official marking guideline:

OFFICIAL RUBRIC & QUESTION CONTEXT:
{rubric_str}

GRADING RULES:
1. Examine the image carefully. Match the student's working against each `rubric_breakdown` step.
2. Award partial marks where intermediate steps are correct according to `marks`.
3. Apply official IEB "Follow-Through" (CA) marks: If a calculation error occurred in step 1, but step 2 correctly uses that wrong value with correct method, award the step 2 method mark.
4. Categorize any lost marks into:
   - 'Conceptual Gap': Misunderstood theory/principle or chose wrong formula.
   - 'Execution Error': Arithmetic/algebraic mistake or bad substitution.
   - 'Exam Technique': Missing required units, bad rounding, or missing key required definition terms.
   - 'None': Achieved full marks.
5. Provide a 1-2 sentence actionable diagnosis explaining where marks were lost and how to fix it.
"""

        response = genai_client.models.generate_content(
            model="gemini-1.5-pro",
            contents=[
                types.Part.from_bytes(data=image_bytes, mime_type="image/jpeg"),
                prompt
            ],
            config=types.GenerateContentConfig(
                response_mime_type="application/json",
                response_schema=QuestionEvaluationResult,
                temperature=0.1 # Low temperature for accurate, deterministic grading
            )
        )

        return QuestionEvaluationResult.model_validate_json(response.text)