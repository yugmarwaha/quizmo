# app/schemas.py
from pydantic import BaseModel
from typing import List, Optional, Literal, Union


class Question(BaseModel):
    id: str
    # what kind of question this is – default to "mcq" for now
    type: Literal["mcq", "tf", "mcq_multi", "fill"] = "mcq"

    question: str

    # MCQ questions: list of options
    # TF / fill-in: options can be None
    options: Optional[List[str]] = None

    answer: Union[str, List[str]]

    # optional explanation shown after answering
    explanation: Optional[str] = None

    # difficulty label – optional but recommended
    difficulty: Optional[Literal["easy", "medium", "hard"]] = None

    # if you later want to track which RAG chunk this came from
    # (you can leave it None for now)
    source_chunk_index: Optional[int] = None


class Quiz(BaseModel):
    id: str
    title: str
    questions: List[Question]


class GenerateQuizRequest(BaseModel):
    lectureText: str
    # used to keep RAG separated by course
    courseId: Optional[str] = None
    # number of questions to generate
    numQuestions: Optional[int] = 10


class UserAnswer(BaseModel):
    questionId: str
    selectedAnswer: Union[str, List[str]]
    isCorrect: bool
    timeSpent: Optional[int] = None


class PerformanceData(BaseModel):
    quiz: Quiz
    userAnswers: List[UserAnswer]
    totalTime: int
    scorePercentage: float


class Recommendation(BaseModel):
    type: Literal[
        "study_focus",
        "time_management",
        "learning_strategy",
        "motivation",
        "next_steps",
    ]
    title: str
    description: str
    priority: Literal["high", "medium", "low"]


class GenerateRecommendationsRequest(BaseModel):
    performanceData: PerformanceData


class GenerateRecommendationsResponse(BaseModel):
    recommendations: List[Recommendation]
    overallAssessment: str
    improvementAreas: List[str]


class GenerateQuizResponse(Quiz):
    pass
