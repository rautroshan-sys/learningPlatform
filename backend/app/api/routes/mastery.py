"""app/api/routes/mastery.py"""
from fastapi import APIRouter, Depends

from app.core.auth import get_current_user
from app.core.errors import AppError
from app.db.client import get_supabase
from app.schemas.schemas import MasteryResponse
from app.services.mastery_service import get_full_mastery

router = APIRouter()


@router.get("/mastery/{student_id}", response_model=MasteryResponse)
async def get_mastery(student_id: str, user: dict = Depends(get_current_user)):
    if user.get("sub") != student_id:
        raise AppError(403, "forbidden", "student_id does not match authenticated session.")

    db = get_supabase()
    mastery = get_full_mastery(db, student_id)
    return {"mastery": mastery}
