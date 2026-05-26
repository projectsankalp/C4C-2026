from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from questions import QUESTIONS
from scoring import calculate_result

app = FastAPI(title="AI Wellness Screening API")

# CORS middleware for local frontend communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class AnswerSubmission(BaseModel):
    track: str
    answers: list[int]

@app.get("/questions/{track}")
def get_questions(track: str):
    """
    Returns the list of questions for a specific screening track.
    """
    return QUESTIONS.get(track, [])

@app.post("/submit")
def submit_answers(data: AnswerSubmission):
    """
    Calculates screening score and returns customized recommendations.
    """
    total_score = sum(data.answers)
    result = calculate_result(total_score, data.track)
    return result
