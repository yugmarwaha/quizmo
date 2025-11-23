from typing import List

from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware

from app.schemas import GenerateQuizRequest, GenerateQuizResponse
from app.agent.quiz_agent import generate_quiz_agent
from app.auth import User, get_current_user
from app.db.quizzes_db import (
    save_quiz_for_user,
    list_quizzes_for_user,
    get_quiz_for_user,
)

app = FastAPI()

# Allow frontend dev (adjust origin later if you want)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # fine for hackathon / local dev
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def root():
    return {"status": "ok", "message": "Single-user quiz backend running"}


@app.post("/api/generate_quiz", response_model=GenerateQuizResponse)
def generate_quiz(req: GenerateQuizRequest):
    """
    Input (JSON):
      {
        "lectureText": "...."
      }

    Output (JSON):
      {
        "id": "quiz-uuid",
        "title": "Generated Quiz",
        "questions": [
          {
            "id": "q1",
            "type": "mcq",
            "question": "...",
            "options": ["A", "B", "C", "D"],
            "answer": "B",
            "difficulty": "medium"
          },
          ...
        ]
      }
    """
    quiz = generate_quiz_agent(
        req.lectureText, course_id=req.courseId, num_questions=req.numQuestions
    )
    return quiz

@app.post("/api/quizzes", response_model=GenerateQuizResponse)
def save_quiz_to_profile(
    quiz: GenerateQuizResponse,
    user: User = Depends(get_current_user),
):
    """
    Store a generated quiz inside the user's profile in DynamoDB.
    """
    saved = save_quiz_for_user(user.id, quiz)
    return saved


# LIST USER'S SAVED QUIZZES
@app.get("/api/quizzes", response_model=List[GenerateQuizResponse])
def list_my_quizzes(user: User = Depends(get_current_user)):
    """
    Return all quizzes saved by this user.
    """
    return list_quizzes_for_user(user.id)


# GET A SPECIFIC QUIZ
@app.get("/api/quizzes/{quiz_id}", response_model=GenerateQuizResponse)
def get_quiz(
    quiz_id: str,
    user: User = Depends(get_current_user),
):
    """
    Retrieve a single quiz saved in the user's profile.
    """
    quiz = get_quiz_for_user(user.id, quiz_id)
    if not quiz:
        raise HTTPException(
            status_code=404,
            detail="Quiz not found for this user.",
        )
    return quiz
