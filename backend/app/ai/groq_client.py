"""
app/ai/groq_client.py
Thin wrapper around the Groq SDK.
All AI logic routes through this module — never called directly from routes.
Handles timeout and API failure with a defined fallback.
"""
import os
from groq import Groq, APIError, APITimeoutError

from app.core.config import get_settings
from app.core.logging import get_logger

logger = get_logger(__name__)

# In-memory explanation cache: (concept_id, tier, attempt_number) -> hint text
_hint_cache: dict[tuple, str] = {}

HINT_TIMEOUT_SECONDS = 10


def _get_client() -> Groq:
    settings = get_settings()
    return Groq(api_key=settings.GROQ_API_KEY)


def get_hint(
    question_body: str,
    correct_answer: str,
    concept_name: str,
    grounding: str,
    attempt_number: int,
    cache_key: tuple | None = None,
) -> tuple[str, bool, str]:
    """
    Generate a hint for a wrong answer.
    - attempt_number == 1: return a leading question (guardrail)
    - attempt_number >= 2: return full grounded explanation

    Returns: (hint_text, full_explanation_unlocked, source)
    source is "groq" or "fallback"
    """
    full_unlocked = attempt_number >= 2

    # Check cache first
    if cache_key and cache_key in _hint_cache:
        return _hint_cache[cache_key], full_unlocked, "cache"

    if full_unlocked:
        system_prompt = (
            "You are a patient tutor. Given a question the student got wrong, "
            "provide a clear, grounded explanation of why the correct answer is right. "
            "Ground your explanation in the provided concept definition. "
            "Be concise (3-4 sentences). Do not hallucinate details not in the grounding."
        )
        user_prompt = (
            f"Concept: {concept_name}\n"
            f"Grounding: {grounding}\n\n"
            f"Question: {question_body}\n"
            f"Correct answer: {correct_answer}\n\n"
            "Explain why this is correct."
        )
    else:
        system_prompt = (
            "You are a Socratic tutor. Ask a single leading question that steers "
            "the student toward the correct answer without revealing it. "
            "Keep it to one sentence."
        )
        user_prompt = (
            f"Concept: {concept_name}\n"
            f"Grounding: {grounding}\n\n"
            f"Question: {question_body}\n\n"
            "Ask a single leading question to guide the student."
        )

    model = "allam-2-7b"  # fastest available model for hints (replaces llama-3.1-8b)

    try:
        client = _get_client()
        response = client.chat.completions.create(
            model=model,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt},
            ],
            max_tokens=300,
            timeout=HINT_TIMEOUT_SECONDS,
        )
        hint = response.choices[0].message.content.strip()
        if cache_key:
            _hint_cache[cache_key] = hint
        return hint, full_unlocked, "groq"

    except (APITimeoutError, APIError, Exception) as exc:
        logger.warning("groq_hint_failed", error=str(exc), fallback="static")
        fallback = (
            f"Review the concept: {concept_name}. {grounding} "
            f"The correct answer is: {correct_answer}."
        )
        return fallback, full_unlocked, "fallback"


def generate_practice_question(
    concept_name: str,
    grounding: str,
    difficulty_tier: int,
) -> dict | None:
    """
    Generate a fresh practice question via Groq.
    Returns dict with keys: body, options (list), correct_answer
    or None on failure (caller handles gracefully).
    """
    tier_label = {1: "beginner", 2: "intermediate", 3: "advanced"}.get(difficulty_tier, "intermediate")
    system_prompt = (
        "You are an educational content generator. Generate a multiple-choice question "
        f"at {tier_label} difficulty about the given concept. "
        "Output ONLY valid JSON with keys: body (string), options (list of 4 strings a-d), correct_answer (one of a/b/c/d). "
        "No markdown, no explanation — raw JSON only."
    )
    user_prompt = (
        f"Concept: {concept_name}\n"
        f"Definition: {grounding}\n\n"
        "Generate the question JSON."
    )

    try:
        client = _get_client()
        response = client.chat.completions.create(
            model="qwen/qwen3.8-27b",  # best quality available (replaces llama-3.3-70b)
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt},
            ],
            max_tokens=400,
            timeout=15,
        )
        import json
        raw = response.choices[0].message.content.strip()
        # Strip markdown fences if present
        if raw.startswith("```"):
            raw = raw.split("```")[1]
            if raw.startswith("json"):
                raw = raw[4:]
        return json.loads(raw.strip())
    except Exception as exc:
        logger.warning("groq_practice_question_failed", error=str(exc))
        return None
