# app/agent/quiz_agent.py

import os
import json
from typing import Optional

from openai import OpenAI
from dotenv import load_dotenv

from app.schemas import GenerateQuizResponse
from app.rag_store import search_kb

# Load env vars (for OPENAI_API_KEY)
load_dotenv()

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
if not OPENAI_API_KEY:
    raise RuntimeError("OPENAI_API_KEY not set in environment or .env file")

client = OpenAI(api_key=OPENAI_API_KEY)

# LLM model for quiz generation
MODEL_NAME = "gpt-4o-mini"


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

    # 2. Build prompts
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
- Generate a quiz with {num_questions} questions.
- Mix of question types: approximately 50% multiple-choice single correct (mcq), 25% true/false (tf), 25% multiple-choice multi-correct (mcq_multi).
- For MCQ single correct questions:
  - type: "mcq"
  - options: list of 4 strings
  - answer: single string, one of the options
- For TF questions:
  - type: "tf"
  - options: null
  - answer: "True" or "False"
- For MCQ multi-correct questions:
  - type: "mcq_multi"
  - options: list of 4 strings
  - answer: list of strings, 2-3 correct options from the list
- Each question should have:
  - id (string)
  - type (string, "mcq", "tf", or "mcq_multi")
  - question (string)
  - options (list for mcq/mcq_multi, null for tf)
  - answer (string for mcq/tf, list for mcq_multi)
  - explanation (string, brief explanation of the correct answer based on the context)
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
        "explanation": "Brief explanation of why A is correct based on the context.",
        "difficulty": "medium"
      }},
      {{
        "id": "q2",
        "type": "tf",
        "question": "...",
        "options": null,
        "answer": "True",
        "explanation": "Brief explanation of why the statement is true.",
        "difficulty": "easy"
      }},
      {{
        "id": "q3",
        "type": "mcq_multi",
        "question": "...",
        "options": ["A", "B", "C", "D"],
        "answer": ["A", "C"],
        "explanation": "Brief explanation of why A and C are the correct options.",
        "difficulty": "hard"
      }},
      ...
    ]
  }}
"""

    # 3. Call OpenAI LLM and force JSON output
    response = client.chat.completions.create(
        model=MODEL_NAME,
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt},
        ],
        response_format={"type": "json_object"},
    )

    content = response.choices[0].message.content
    if not content:
        raise RuntimeError("OpenAI returned empty content for quiz generation")

    quiz_dict = json.loads(content)

    # 4. Validate/parse into your Pydantic model
    return GenerateQuizResponse.model_validate(quiz_dict)
