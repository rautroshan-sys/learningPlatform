"""
app/services/quiz_service.py
Business logic for quiz flow: next-question selection and answer processing.
"""
from supabase import Client

from app.adaptive.bkt import bkt_update, select_tier, P_PRIOR
from app.adaptive.dag import detect_gap
from app.core.errors import AppError
from app.core.logging import get_logger
from app.services.mastery_service import get_mastery_map, upsert_mastery

logger = get_logger(__name__)


def get_next_question(db: Client, student_id: str) -> dict:
    """
    Select the next question for the student.
    1. Find the recommended concept (first below mastery threshold from path).
    2. Select a question at the appropriate tier based on current mastery.
    3. Exclude questions the student already answered in this session.
    Returns a question dict or raises 404.
    """
    from app.adaptive.dag import build_learning_path
    from app.adaptive.bkt import MASTERY_THRESHOLD

    concepts = db.table("concepts").select("id, name, prerequisite_ids").execute().data
    mastery_map = get_mastery_map(db, student_id)
    path = build_learning_path(concepts, mastery_map)

    # Find recommended concept
    recommended = next((c for c in path if c["recommended"]), None)
    if not recommended:
        # All concepts mastered — pick highest mastery concept for reinforcement
        recommended = max(path, key=lambda c: c["p_mastery"])

    concept_id = recommended["concept_id"]
    p_mastery = mastery_map.get(concept_id, P_PRIOR)
    tier = select_tier(p_mastery)

    # Get already-answered question IDs for this student
    answered_ids = _get_answered_question_ids(db, student_id)

    # Try the selected tier, then fall back to adjacent tiers
    question = _pick_question(db, concept_id, tier, answered_ids)
    if question is None:
        for fallback_tier in [1, 2, 3]:
            if fallback_tier != tier:
                question = _pick_question(db, concept_id, fallback_tier, answered_ids)
                if question:
                    break

    if question is None:
        raise AppError(404, "no_questions", f"No unanswered questions left for concept {concept_id}.")

    return question


def _pick_question(db: Client, concept_id: str, tier: int, exclude_ids: set) -> dict | None:
    rows = (
        db.table("questions")
        .select("id, concept_id, difficulty_tier, body, options")
        .eq("concept_id", concept_id)
        .eq("difficulty_tier", tier)
        .execute()
        .data
    )
    available = [r for r in rows if r["id"] not in exclude_ids]
    if not available:
        return None
    return available[0]


def _get_answered_question_ids(db: Client, student_id: str) -> set:
    rows = (
        db.table("attempts")
        .select("question_id")
        .eq("student_id", student_id)
        .execute()
        .data
    )
    return {r["question_id"] for r in rows}


def process_answer(db: Client, student_id: str, question_id: str, selected: str) -> dict:
    """
    1. Look up the question and verify it exists.
    2. Determine correctness.
    3. BKT update on concept mastery.
    4. Gap detection if wrong.
    5. Persist attempt + updated mastery.
    6. Return the answer response shape from API_CONTRACT.md.
    """
    import time

    # Fetch question
    rows = db.table("questions").select("*").eq("id", question_id).execute().data
    if not rows:
        raise AppError(400, "question_not_found", f"Question {question_id} not found.")
    question = rows[0]
    concept_id = question["concept_id"]

    # Check if already answered
    existing = (
        db.table("attempts")
        .select("id")
        .eq("student_id", student_id)
        .eq("question_id", question_id)
        .execute()
        .data
    )
    if existing:
        raise AppError(400, "already_answered", f"Question {question_id} already answered.")

    correct = selected.strip().lower() == question["correct_answer"].strip().lower()

    # BKT update
    mastery_map = get_mastery_map(db, student_id)
    p_old = mastery_map.get(concept_id, P_PRIOR)
    p_new = bkt_update(p_old, correct)
    old_tier = select_tier(p_old)
    new_tier = select_tier(p_new)
    tier_changed = old_tier != new_tier

    # Gap detection (only on wrong answers)
    gap_concept_id = None
    if not correct:
        concepts = db.table("concepts").select("id, name, prerequisite_ids").execute().data
        gap_concept_id = detect_gap(concept_id, concepts, mastery_map)

    # Persist attempt
    db.table("attempts").insert({
        "student_id": student_id,
        "question_id": question_id,
        "correct": correct,
        "timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
        "response_time_ms": 0,  # frontend can send this later; 0 is safe default
    }).execute()

    # Persist mastery
    upsert_mastery(db, student_id, concept_id, p_new)

    logger.info(
        "answer_processed",
        student_id=student_id,
        question_id=question_id,
        correct=correct,
        p_old=round(p_old, 4),
        p_new=round(p_new, 4),
        tier_changed=tier_changed,
        gap=gap_concept_id,
    )

    return {
        "correct": correct,
        "p_mastery": p_new,
        "tier_changed": tier_changed,
        "new_tier": new_tier,
        "gap_concept_id": gap_concept_id,
    }
