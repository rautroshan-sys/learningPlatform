"""app/api/routes/quiz.py"""
from fastapi import APIRouter, Depends

from app.core.auth import get_current_user
from app.core.errors import AppError
from app.db.client import get_supabase
from app.schemas.schemas import QuizNextResponse, QuizAnswerRequest, QuizAnswerResponse
from app.services.quiz_service import get_next_question, process_answer

router = APIRouter(prefix="/quiz")


@router.get("/next/{student_id}", response_model=QuizNextResponse)
async def quiz_next(student_id: str, user: dict = Depends(get_current_user)):
    if user.get("sub") != student_id:
        raise AppError(403, "forbidden", "student_id does not match authenticated session.")

    db = get_supabase()
    question = get_next_question(db, student_id)
    return {"question": question}


@router.post("/answer", response_model=QuizAnswerResponse)
async def quiz_answer(body: QuizAnswerRequest, user: dict = Depends(get_current_user)):
    if user.get("sub") != body.student_id:
        raise AppError(403, "forbidden", "student_id does not match authenticated session.")

    db = get_supabase()
    result = process_answer(db, body.student_id, body.question_id, body.selected)
    return result
