from typing import List, Optional

from fastapi import FastAPI, HTTPException, Depends, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from pypdf import PdfReader
import io

from app.schemas import (
    GenerateQuizRequest,
    GenerateQuizResponse,
    GenerateRecommendationsRequest,
    GenerateRecommendationsResponse,
)
from app.agent.quiz_agent import generate_quiz_agent, generate_recommendations_agent
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


@app.post("/api/upload_and_generate_quiz", response_model=GenerateQuizResponse)
async def upload_and_generate_quiz(
    file: UploadFile = File(...),
    courseId: Optional[str] = Form(None),
    numQuestions: int = Form(10),
):
    """
    Upload a PDF file and generate a quiz from its content.

    Input (multipart/form-data):
      - file: PDF file
      - courseId (optional): Course identifier
      - numQuestions (optional): Number of questions to generate (default: 10)

    Output (JSON): Same as generate_quiz endpoint
    """
    if not file.filename.endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are supported")

    try:
        # Read the uploaded file
        contents = await file.read()
        pdf_file = io.BytesIO(contents)

        # Extract text from PDF
        pdf_reader = PdfReader(pdf_file)
        lecture_text = ""
        for page in pdf_reader.pages:
            lecture_text += page.extract_text() + "\n"

        if not lecture_text.strip():
            raise HTTPException(
                status_code=400, detail="Could not extract text from PDF"
            )

        # Generate quiz using the extracted text
        quiz = generate_quiz_agent(
            lecture_text, course_id=courseId, num_questions=numQuestions
        )
        return quiz

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing PDF: {str(e)}")


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


@app.post(
    "/api/generate_recommendations", response_model=GenerateRecommendationsResponse
)
def generate_recommendations(req: GenerateRecommendationsRequest):
    """
    Generate personalized study recommendations based on quiz performance.

    Input (JSON):
      {
        "performanceData": {
          "quiz": { ... },
          "userAnswers": [ ... ],
          "totalTime": 300,
          "scorePercentage": 75.0
        }
      }

    Output (JSON):
      {
        "recommendations": [
          {
            "type": "study_focus",
            "title": "Focus on Hard Questions",
            "description": "You struggled with hard questions...",
            "priority": "high"
          }
        ],
        "overallAssessment": "Good performance with room for improvement...",
        "improvementAreas": ["Time management", "Hard question practice"]
      }
    """
    recommendations = generate_recommendations_agent(req.performanceData)
    return recommendations
