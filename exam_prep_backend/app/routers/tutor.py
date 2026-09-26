from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from google import genai
from google.genai import types
from app.services.rag_service import retrieve_relevant_context, client

router = APIRouter()

class ChatRequest(BaseModel):
    message: str
    grading_context: dict = None

@router.post("/chat")
async def chat_with_tutor(req: ChatRequest):
    try:
        # Determine subject if in context
        subject = req.grading_context.get("subject", "general") if req.grading_context else "general"
        
        # Retrieve context
        context_chunks = retrieve_relevant_context(req.message, subject)
        context_text = "\n".join(context_chunks)
        
        prompt = f"""You are an IEB Grade 12 AI Tutor.
Answer the student's question clearly. Use the syllabus context below if relevant.
If they ask about their grading, explain their mistakes constructively.
Context:
{context_text}

Student Question: {req.message}
"""
        
        response = client.models.generate_content(
            model='gemini-2.5-flash',
            contents=prompt,
        )
        
        return {"reply": response.text}
    except Exception as e:
        print(f"Chat error: {e}")
        raise HTTPException(status_code=500, detail=str(e))