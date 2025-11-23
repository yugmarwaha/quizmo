# app/db/quizzes_db.py
import os
import uuid
from datetime import datetime
from typing import List, Dict, Any, Optional

import boto3
from boto3.dynamodb.conditions import Key

from app.schemas import GenerateQuizResponse, Question  # adjust import if needed

AWS_REGION = os.getenv("AWS_REGION", "us-east-2")
DDB_QUIZZES_TABLE = os.getenv("DDB_QUIZZES_TABLE", "UserQuizzes")

dynamodb = boto3.resource("dynamodb", region_name=AWS_REGION)
quizzes_table = dynamodb.Table(DDB_QUIZZES_TABLE)


def save_quiz_for_user(user_id: str, quiz: GenerateQuizResponse) -> GenerateQuizResponse:
    quiz_id = quiz.id or f"quiz-{uuid.uuid4()}"

    item = {
        "userId": user_id,
        "quizId": quiz_id,
        "title": quiz.title,
        "courseId": getattr(quiz, "courseId", None),
        "questions": [q.model_dump() for q in quiz.questions],
        "createdAt": datetime.utcnow().isoformat(),
    }

    quizzes_table.put_item(Item=item)

    # return a copy with the quiz_id ensured
    quiz_dict = quiz.model_dump()
    quiz_dict["id"] = quiz_id
    return GenerateQuizResponse.model_validate(quiz_dict)


def list_quizzes_for_user(user_id: str) -> List[GenerateQuizResponse]:
    resp = quizzes_table.query(
        KeyConditionExpression=Key("userId").eq(user_id)
    )
    items = resp.get("Items", [])

    quizzes: List[GenerateQuizResponse] = []
    for it in items:
        q = GenerateQuizResponse.model_validate(
            {
                "id": it["quizId"],
                "title": it.get("title", ""),
                "questions": it.get("questions", []),
            }
        )
        quizzes.append(q)

    return quizzes


def get_quiz_for_user(user_id: str, quiz_id: str) -> Optional[GenerateQuizResponse]:
    resp = quizzes_table.get_item(
        Key={"userId": user_id, "quizId": quiz_id}
    )
    item = resp.get("Item")
    if not item:
        return None

    return GenerateQuizResponse.model_validate(
        {
            "id": item["quizId"],
            "title": item.get("title", ""),
            "questions": item.get("questions", []),
        }
    )
