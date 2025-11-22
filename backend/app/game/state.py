# app/game/state.py
from typing import Dict, Any
from app.schemas import Quiz

QUIZZES: Dict[str, Quiz] = {}
SESSIONS: Dict[str, Any] = {}
