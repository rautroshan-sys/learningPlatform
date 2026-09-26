"""app/api/routes/path.py"""
from fastapi import APIRouter, Depends

from app.core.auth import get_current_user
from app.core.errors import AppError
from app.db.client import get_supabase
from app.schemas.schemas import PathResponse
from app.services.mastery_service import get_mastery_map
from app.adaptive.dag import build_learning_path

router = APIRouter()


@router.get("/path/{student_id}", response_model=PathResponse)
async def get_path(student_id: str, user: dict = Depends(get_current_user)):
    # Enforce that student_id matches the authenticated session
    if user.get("sub") != student_id:
        raise AppError(403, "forbidden", "student_id does not match authenticated session.")

    db = get_supabase()
    concepts = db.table("concepts").select("id, name, prerequisite_ids").execute().data
    mastery_map = get_mastery_map(db, student_id)
    path = build_learning_path(concepts, mastery_map)
    return {"path": path}
