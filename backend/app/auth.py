# app/auth.py
from pydantic import BaseModel

class User(BaseModel):
    id: str

def get_current_user() -> User:
    # TEMP for hackathon. Later, replace with real auth.
    return User(id="demo-user-1")
