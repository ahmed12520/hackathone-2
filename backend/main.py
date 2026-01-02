from fastapi import FastAPI, HTTPException, Depends, Header
from fastapi.middleware.cors import CORSMiddleware
from sqlmodel import SQLModel, Session, create_engine, select
from .models import Task
import os
from dotenv import load_dotenv
from typing import List, Optional
from pydantic import BaseModel

load_dotenv()

# Configuration
DATABASE_URL = os.getenv("DATABASE_URL")
engine = create_engine(
    DATABASE_URL.replace("postgresql://", "postgresql+psycopg2://"),
    pool_size=5,
    max_overflow=10,
    pool_recycle=300,
    pool_pre_ping=True
)
app = FastAPI(title="Hackathon Todo API")

# CORS SETUP
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class TaskUpdate(BaseModel):
    title: Optional[str] = None
    completed: Optional[bool] = None

# ✅ FIXED AUTH MIDDLEWARE
async def get_current_user(authorization: str = Header(None)):
    if not authorization:
        raise HTTPException(status_code=401, detail="Missing Authorization Header")
    
    try:
        parts = authorization.split(" ")
        if len(parts) != 2:
            raise HTTPException(status_code=401, detail="Invalid token format")
        
        token = parts[1]
        
        # Better-Auth ke opaque tokens unique hote hain. 
        # Hum isi token ko as a User Identity use karenge.
        return str(token) 
        
    except Exception as e:
        print(f"Auth Error: {e}")
        raise HTTPException(status_code=401, detail="Invalid token")

@app.on_event("startup")
def on_startup():
    SQLModel.metadata.create_all(engine)

# --- ROUTES ---

@app.get("/api/tasks", response_model=List[Task])
def get_tasks(user_id: str = Depends(get_current_user)):
    with Session(engine) as session:
        # ✅ Filter: Ab sirf login user ke tasks milenge
        statement = select(Task).where(Task.user_id == user_id)
        tasks = session.exec(statement).all()
        return tasks

@app.post("/api/tasks", response_model=Task)
def create_task(task_input: Task, user_id: str = Depends(get_current_user)):
    # ✅ Secure: Login user ki ID/Token attach ho rahi hai
    task_input.user_id = user_id
    with Session(engine) as session:
        session.add(task_input)
        session.commit()
        session.refresh(task_input)
        return task_input

@app.delete("/api/tasks/{task_id}")
def delete_task(task_id: int, user_id: str = Depends(get_current_user)):
    with Session(engine) as session:
        db_task = session.get(Task, task_id)
        # ✅ Security Check: Task exist kare aur isi user ka ho
        if not db_task or db_task.user_id != user_id:
            raise HTTPException(status_code=404, detail="Task not found or unauthorized")
        
        session.delete(db_task)
        session.commit()
        return {"message": "Task deleted successfully"}

@app.patch("/api/tasks/{task_id}")
def update_task(task_id: int, task_data: TaskUpdate, user_id: str = Depends(get_current_user)):
    with Session(engine) as session:
        db_task = session.get(Task, task_id)
        if not db_task or db_task.user_id != user_id:
            raise HTTPException(status_code=404, detail="Task not found or unauthorized")
        
        if task_data.title is not None:
            db_task.title = task_data.title
        if task_data.completed is not None:
            db_task.completed = task_data.completed
            
        session.add(db_task)
        session.commit()
        session.refresh(db_task)
        return db_task

@app.patch("/api/tasks/{task_id}/complete")
def toggle_task(task_id: int, user_id: str = Depends(get_current_user)):
    with Session(engine) as session:
        db_task = session.get(Task, task_id)
        if not db_task or db_task.user_id != user_id:
            raise HTTPException(status_code=404, detail="Task not found or unauthorized")
        
        db_task.completed = not db_task.completed
        session.add(db_task)
        session.commit()
        session.refresh(db_task)
        return db_task

@app.api_route("/api/auth/{path:path}", methods=["GET", "POST"])
async def auth_handler(path: str):
    return {"message": "Auth route reached"}