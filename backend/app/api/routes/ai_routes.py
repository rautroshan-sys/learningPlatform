"""app/api/routes/ai_routes.py"""
from fastapi import APIRouter, Depends

from app.core.auth import get_current_user
from app.core.errors import AppError
from app.core.logging import get_logger
from app.db.client import get_supabase
from app.schemas.schemas import (
    HintRequest,
    HintResponse,
    PracticeQuestionRequest,
    PracticeQuestionResponse,
)
from app.ai.groq_client import get_hint, generate_practice_question

logger = get_logger(__name__)
router = APIRouter(prefix="/ai")

# Static grounding dict — fallback for hints when no per-concept grounding exists
# This gets replaced by the seeded grounding dict once the seed script runs
_FALLBACK_GROUNDING = "Review the concept fundamentals and re-read your notes."


def _get_grounding(db, concept_id: str) -> tuple[str, str]:
    """
    Fetch concept name and grounding text from DB.
    Falls back to generic text if no grounding row exists.
    """
    rows = db.table("concepts").select("name, grounding").eq("id", concept_id).execute().data
    if rows:
        return rows[0].get("name", ""), rows[0].get("grounding") or _FALLBACK_GROUNDING
    return concept_id, _FALLBACK_GROUNDING


@router.post("/hint", response_model=HintResponse)
async def hint(body: HintRequest, user: dict = Depends(get_current_user)):
    if user.get("sub") != body.student_id:
        raise AppError(403, "forbidden", "student_id does not match authenticated session.")

    db = get_supabase()

    # Fetch question and concept
    rows = db.table("questions").select("concept_id, body, correct_answer").eq("id", body.question_id).execute().data
    if not rows:
        raise AppError(400, "question_not_found", f"Question {body.question_id} not found.")
    q = rows[0]

    concept_name, grounding = _get_grounding(db, q["concept_id"])
    cache_key = (q["concept_id"], body.question_id, body.attempt_number)

    hint_text, full_unlocked, source = get_hint(
        question_body=q["body"],
        correct_answer=q["correct_answer"],
        concept_name=concept_name,
        grounding=grounding,
        attempt_number=body.attempt_number,
        cache_key=cache_key,
    )

    response = HintResponse(
        hint=hint_text,
        full_explanation_unlocked=full_unlocked,
    )
    if source == "fallback":
        response.source = "fallback"

    return response


@router.post("/practice-question", response_model=PracticeQuestionResponse)
async def practice_question(
    body: PracticeQuestionRequest, user: dict = Depends(get_current_user)
):
    db = get_supabase()
    concept_name, grounding = _get_grounding(db, body.concept_id)

    result = generate_practice_question(concept_name, grounding, body.difficulty_tier)
    if result is None:
        raise AppError(502, "generation_failed", "Could not generate a practice question. Please try again.")

    # Validate required keys are present
    for key in ("body", "options", "correct_answer"):
        if key not in result:
            raise AppError(502, "malformed_response", f"AI response missing field: {key}")

    return {"question": result}
