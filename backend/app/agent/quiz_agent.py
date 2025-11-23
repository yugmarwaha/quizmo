# app/agent/quiz_agent.py

import os
import json
from typing import Optional

import google.generativeai as genai
from dotenv import load_dotenv

from app.schemas import GenerateQuizResponse
from app.rag_store import search_kb

# Load env vars (for GEMINI_API_KEY)
load_dotenv()

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
if not GEMINI_API_KEY:
    raise RuntimeError("GEMINI_API_KEY not set in environment or .env file")

# Configure Gemini client
genai.configure(api_key=GEMINI_API_KEY)

# Pick a model – flash is cheap/fast, pro is smarter but slower
MODEL_NAME = "gemini-2.5-flash"
model = genai.GenerativeModel(MODEL_NAME)


def generate_quiz_agent(
    lecture_text: str,
    course_id: Optional[str] = None,
    num_questions: Optional[int] = 10,
) -> GenerateQuizResponse:
    # 1. Use RAG to get relevant context
    kb_chunks = search_kb(lecture_text, top_k=5, course_id=course_id)
    context_block = "\n\n---\n\n".join(
        f"Source: {c.source}\n{c.text}" for c in kb_chunks
    )

    # 2. Build prompt that includes retrieved context + current lecture
    system_prompt = """
You are an AI quiz generator for university-level courses.
Use ONLY the provided context and lecture to create accurate questions.
If something is not covered in the context, do not invent new facts.
Respond with valid JSON only.
"""

    user_prompt = f"""
CONTEXT FROM COURSE MATERIALS:
{context_block or "[No extra context found]"}

CURRENT LECTURE TEXT:
{lecture_text}

TASK:
- Generate a quiz with {num_questions} multiple-choice questions.
- Each question should have:
  - id (string)
  - type (string, use "mcq")
  - question (string)
  - options (list of 4 strings)
  - answer (exactly one of the options)
  - difficulty ("easy", "medium", or "hard")
- Cover a mix of recall and understanding questions.
- Do not include explanations in the answer field.
- Return JSON in the shape:
  {{
    "id": "quiz-uuid-or-title",
    "title": "Short Quiz Title",
    "questions": [
      {{
        "id": "q1",
        "type": "mcq",
        "question": "...",
        "options": ["A", "B", "C", "D"],
        "answer": "A",
        "difficulty": "medium"
      }},
      ...
    ]
  }}
"""

    full_prompt = system_prompt + "\n\n" + user_prompt

    # 3. Call Gemini and force JSON output
    response = model.generate_content(
        full_prompt,
        generation_config={
            "response_mime_type": "application/json",
        },
    )

    # response.text should be a JSON string
    quiz_dict = json.loads(response.text)

    # 4. Validate/parse into your Pydantic model
    return GenerateQuizResponse.model_validate(quiz_dict)
