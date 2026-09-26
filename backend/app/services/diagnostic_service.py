"""
app/services/diagnostic_service.py
Business logic for diagnostic assessment flow.
"""
from supabase import Client

from app.adaptive.bkt import bkt_update, P_PRIOR
from app.core.logging import get_logger
from app.services.mastery_service import upsert_mastery

logger = get_logger(__name__)


def get_diagnostic_questions(db: Client) -> list[dict]:
    """
    Fetch 1-2 questions per root concept (concepts with no prerequisites).
    Root concepts are those where prerequisite_ids is null or empty.
    """
    concepts = db.table("concepts").select("id, name, prerequisite_ids").execute().data
    root_concepts = [
        c for c in concepts
        if not c.get("prerequisite_ids")
    ]

    questions = []
    for concept in root_concepts:
        rows = (
            db.table("questions")
            .select("id, concept_id, body, options, difficulty_tier")
            .eq("concept_id", concept["id"])
            .eq("difficulty_tier", 1)  # diagnostic always uses easiest tier
            .limit(2)
            .execute()
            .data
        )
        for r in rows:
            questions.append({
                "id": r["id"],
                "concept_id": r["concept_id"],
                "body": r["body"],
                "options": r["options"],
            })

    return questions


def process_diagnostic_submission(
    db: Client, student_id: str, answers: list[dict]
) -> list[dict]:
    """
    For each answered question:
      1. Determine correctness.
      2. Run BKT update starting from P_PRIOR.
      3. Upsert mastery row.
    Returns list of {concept_id, p_mastery}.
    """
    mastery_results: dict[str, float] = {}

    for answer in answers:
        question_id = answer["question_id"]
        selected = answer["selected"]

        rows = db.table("questions").select("concept_id, correct_answer").eq("id", question_id).execute().data
        if not rows:
            logger.warning("diagnostic_question_not_found", question_id=question_id)
            continue

        q = rows[0]
        concept_id = q["concept_id"]
        correct = selected.strip().lower() == q["correct_answer"].strip().lower()

        # Start from prior for diagnostic
        p_current = mastery_results.get(concept_id, P_PRIOR)
        p_new = bkt_update(p_current, correct)
        mastery_results[concept_id] = p_new

    # Upsert all mastery rows
    for concept_id, p_mastery in mastery_results.items():
        upsert_mastery(db, student_id, concept_id, p_mastery)

    logger.info("diagnostic_submitted", student_id=student_id, concepts_updated=len(mastery_results))
    return [{"concept_id": cid, "p_mastery": p} for cid, p in mastery_results.items()]
