# app/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.schemas import (
    GenerateQuizRequest,
    GenerateQuizResponse,
    GenerateRecommendationsRequest,
    GenerateRecommendationsResponse,
)
from app.agent.quiz_agent import generate_quiz_agent, generate_recommendations_agent

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
