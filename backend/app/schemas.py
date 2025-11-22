# app/schemas.py
from pydantic import BaseModel
from typing import List, Optional, Literal


class Question(BaseModel):
    id: str
    # what kind of question this is – default to "mcq" for now
    type: Literal["mcq", "tf", "fill"] = "mcq"

    question: str

    # MCQ questions: list of options
    # TF / fill-in: options can be None
    options: Optional[List[str]] = None

    answer: str

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


class GenerateQuizResponse(Quiz):
    pass

