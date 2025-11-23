# app/agent/quiz_agent.py

import os
import json
from typing import Optional

from openai import OpenAI
from dotenv import load_dotenv

from app.schemas import (
    GenerateQuizResponse,
    PerformanceData,
    GenerateRecommendationsResponse,
)
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


def generate_recommendations_agent(
    performance_data: PerformanceData,
) -> GenerateRecommendationsResponse:
    """
    Generate personalized study recommendations based on user's quiz performance.
    """

    # Calculate performance statistics
    total_questions = len(performance_data.quiz.questions)
    correct_answers = len([a for a in performance_data.userAnswers if a.isCorrect])
    incorrect_answers = total_questions - correct_answers

    # Performance by difficulty
    difficulty_stats = {
        "easy": {"correct": 0, "total": 0},
        "medium": {"correct": 0, "total": 0},
        "hard": {"correct": 0, "total": 0},
    }

    for question in performance_data.quiz.questions:
        user_answer = next(
            (a for a in performance_data.userAnswers if a.questionId == question.id),
            None,
        )
        if user_answer and question.difficulty:
            difficulty_stats[question.difficulty]["total"] += 1
            if user_answer.isCorrect:
                difficulty_stats[question.difficulty]["correct"] += 1

    # Time analytics
    avg_time_per_question = (
        performance_data.totalTime / total_questions if total_questions > 0 else 0
    )

    # Build performance summary
    performance_summary = f"""
QUIZ PERFORMANCE SUMMARY:
- Total Questions: {total_questions}
- Correct Answers: {correct_answers}
- Incorrect Answers: {incorrect_answers}
- Score Percentage: {performance_data.scorePercentage:.1f}%
- Total Time: {performance_data.totalTime} seconds
- Average Time per Question: {avg_time_per_question:.1f} seconds

PERFORMANCE BY DIFFICULTY:
"""

    for difficulty, stats in difficulty_stats.items():
        if stats["total"] > 0:
            percentage = (stats["correct"] / stats["total"]) * 100
            performance_summary += f"- {difficulty.capitalize()}: {stats['correct']}/{stats['total']} ({percentage:.1f}%)\n"
        else:
            performance_summary += f"- {difficulty.capitalize()}: No questions\n"

    # Build prompts for AI
    system_prompt = """
You are an AI educational assistant that provides personalized study recommendations.
Analyze the student's quiz performance and generate specific, actionable recommendations.
Focus on identifying patterns, weaknesses, and suggesting concrete improvement strategies.
Be encouraging and constructive in your feedback.
"""

    user_prompt = f"""
{performance_summary}

QUIZ DETAILS:
Title: {performance_data.quiz.title}
Questions: {len(performance_data.quiz.questions)}

TASK:
Analyze this student's quiz performance and provide personalized recommendations. Return JSON with:

1. recommendations: Array of recommendation objects with:
   - type: "study_focus" | "time_management" | "learning_strategy" | "motivation" | "next_steps"
   - title: Brief title for the recommendation
   - description: Detailed explanation and advice
   - priority: "high" | "medium" | "low"

2. overallAssessment: A brief overall assessment of the student's performance

3. improvementAreas: Array of 2-3 key areas for improvement

Generate 4-6 specific recommendations based on the performance data. Focus on:
- Areas where the student struggled (low scores in certain difficulties)
- Time management issues (if average time is too high/low)
- Study strategies for improvement
- Encouragement for strong areas
- Next steps for continued learning

Return valid JSON only.
"""

    # Call OpenAI LLM
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
        raise RuntimeError(
            "OpenAI returned empty content for recommendations generation"
        )

    recommendations_dict = json.loads(content)

    # Validate/parse into Pydantic model
    return GenerateRecommendationsResponse.model_validate(recommendations_dict)
