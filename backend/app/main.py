# app/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.schemas import GenerateQuizRequest, GenerateQuizResponse
from app.agent.quiz_agent import generate_quiz_agent

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
