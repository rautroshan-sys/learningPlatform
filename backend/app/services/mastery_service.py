"""
app/services/mastery_service.py
Business logic for mastery reads/writes — separated from route handlers.
"""
from supabase import Client

from app.adaptive.bkt import P_PRIOR
from app.core.logging import get_logger

logger = get_logger(__name__)


def get_mastery_map(db: Client, student_id: str) -> dict[str, float]:
    """Return {concept_id: p_mastery} for a student. Defaults to P_PRIOR."""
    rows = (
        db.table("mastery")
        .select("concept_id, p_mastery")
        .eq("student_id", student_id)
        .execute()
        .data
    )
    return {r["concept_id"]: r["p_mastery"] for r in rows}


def upsert_mastery(db: Client, student_id: str, concept_id: str, p_mastery: float) -> None:
    """Write or update a mastery row."""
    db.table("mastery").upsert(
        {
            "student_id": student_id,
            "concept_id": concept_id,
            "p_mastery": p_mastery,
        },
        on_conflict="student_id,concept_id",
    ).execute()
    logger.info("mastery_updated", student_id=student_id, concept_id=concept_id, p_mastery=round(p_mastery, 4))


def get_full_mastery(db: Client, student_id: str) -> list[dict]:
    """
    Full mastery profile joined with concept names — for /mastery/{student_id}.
    For concepts with no mastery row, returns P_PRIOR.
    """
    concepts = db.table("concepts").select("id, name").execute().data
    mastery_map = get_mastery_map(db, student_id)
    return [
        {
            "concept_id": c["id"],
            "name": c["name"],
            "p_mastery": mastery_map.get(c["id"], P_PRIOR),
        }
        for c in concepts
    ]
