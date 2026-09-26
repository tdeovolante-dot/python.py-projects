from pathlib import Path
from dotenv import load_dotenv
load_dotenv()
# Force load .env from project root directory
env_path = Path(__file__).resolve().parent.parent / ".env"
load_dotenv(dotenv_path=env_path)
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import papers, grading, accountability, tutor, syllabus, revision, todos, notes

app = FastAPI(
    title="IEB Grade 12 Exam Prep & AI Tutor API",
    version="1.0.0",
    description="Centralized past paper tracking, vision AI grading, error book analytics, and RAG tutoring."
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Wire all routers
app.include_router(papers.router, prefix="/api/papers", tags=["Past Papers"])
app.include_router(grading.router, prefix="/api/grading", tags=["AI Vision Grading"])
app.include_router(accountability.router, prefix="/api/accountability", tags=["Daily Tracker & Error Book"])
app.include_router(tutor.router, prefix="/api/tutor", tags=["AI Tutor & RAG Notes"])
app.include_router(syllabus.router, prefix="/api/syllabus", tags=["Syllabus Tracker"])
app.include_router(revision.router, prefix="/api/revision", tags=["Revision Tracker"])
app.include_router(todos.router, prefix="/api/todos", tags=["Todos"])
app.include_router(notes.router, prefix="/api/notes", tags=["Notes"])

@app.get("/")
def root_check():
    return {
        "status": "online",
        "system": "IEB Exam Prep Backend",
        "version": "1.0.0"
    }