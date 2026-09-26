"""app/api/routes/diagnostic.py"""
from fastapi import APIRouter, Depends

from app.core.auth import get_current_user
from app.core.errors import AppError
from app.db.client import get_supabase
from app.schemas.schemas import (
    DiagnosticStartResponse,
    DiagnosticSubmitRequest,
    DiagnosticSubmitResponse,
)
from app.services.diagnostic_service import (
    get_diagnostic_questions,
    process_diagnostic_submission,
)

router = APIRouter(prefix="/diagnostic")


@router.get("/start", response_model=DiagnosticStartResponse)
async def diagnostic_start(user: dict = Depends(get_current_user)):
    db = get_supabase()
    questions = get_diagnostic_questions(db)
    return {"questions": questions}


@router.post("/submit", response_model=DiagnosticSubmitResponse)
async def diagnostic_submit(
    body: DiagnosticSubmitRequest,
    user: dict = Depends(get_current_user),
):
    if not body.answers:
        raise AppError(400, "malformed_payload", "answers list must not be empty.")

    db = get_supabase()
    student_id = user.get("sub")
    mastery = process_diagnostic_submission(db, student_id, [a.model_dump() for a in body.answers])
    return {"mastery": mastery}
