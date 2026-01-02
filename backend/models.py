# backend/models.py
from sqlmodel import SQLModel, Field
from typing import Optional

class Task(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: Optional[str] = Field(default=None, index=True) # Ye None hona chahiye
    title: str
    description: Optional[str] = Field(default=None) # Ye bhi None
    completed: bool = Field(default=False)