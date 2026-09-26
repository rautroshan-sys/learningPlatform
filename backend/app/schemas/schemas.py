"""
app/schemas/
Pydantic request/response models matching API_CONTRACT.md exactly.
"""
from __future__ import annotations

from typing import Optional
from pydantic import BaseModel


# ── Shared ────────────────────────────────────────────────────────────────────

class ErrorResponse(BaseModel):
    error: str
    message: str


# ── /diagnostic ───────────────────────────────────────────────────────────────

class DiagnosticQuestion(BaseModel):
    id: str
    concept_id: str
    body: str
    options: list[str]


class DiagnosticStartResponse(BaseModel):
    questions: list[DiagnosticQuestion]


class AnswerItem(BaseModel):
    question_id: str
    selected: str


class DiagnosticSubmitRequest(BaseModel):
    answers: list[AnswerItem]


class MasteryItem(BaseModel):
    concept_id: str
    p_mastery: float


class DiagnosticSubmitResponse(BaseModel):
    mastery: list[MasteryItem]


# ── /path ─────────────────────────────────────────────────────────────────────

class PathConcept(BaseModel):
    concept_id: str
    name: str
    p_mastery: float
    recommended: bool


class PathResponse(BaseModel):
    path: list[PathConcept]


# ── /quiz ─────────────────────────────────────────────────────────────────────

class QuizQuestion(BaseModel):
    id: str
    concept_id: str
    difficulty_tier: int
    body: str
    options: list[str]


class QuizNextResponse(BaseModel):
    question: QuizQuestion


class QuizAnswerRequest(BaseModel):
    student_id: str
    question_id: str
    selected: str


class QuizAnswerResponse(BaseModel):
    correct: bool
    p_mastery: float
    tier_changed: bool
    new_tier: int
    gap_concept_id: Optional[str] = None


# ── /mastery ──────────────────────────────────────────────────────────────────

class MasteryConceptItem(BaseModel):
    concept_id: str
    name: str
    p_mastery: float


class MasteryResponse(BaseModel):
    mastery: list[MasteryConceptItem]


# ── /ai/hint ──────────────────────────────────────────────────────────────────

class HintRequest(BaseModel):
    student_id: str
    question_id: str
    attempt_number: int


class HintResponse(BaseModel):
    hint: str
    full_explanation_unlocked: bool
    source: Optional[str] = None  # "fallback" when Groq failed


# ── /ai/practice-question ─────────────────────────────────────────────────────

class PracticeQuestionRequest(BaseModel):
    concept_id: str
    difficulty_tier: int


class GeneratedQuestion(BaseModel):
    body: str
    options: list[str]
    correct_answer: str


class PracticeQuestionResponse(BaseModel):
    question: GeneratedQuestion
