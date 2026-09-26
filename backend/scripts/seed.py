#!/usr/bin/env python3
"""
scripts/seed.py
One-off seed script: creates the schema and populates concepts, questions,
and grounding dict via Groq.

Run ONCE before the hackathon demo:
  cd backend && python scripts/seed.py

Requires .env to be populated with real credentials.
"""
import json
import os
import sys
import time

# Load env before any app imports
from pathlib import Path
from dotenv import load_dotenv

load_dotenv(Path(__file__).parent.parent / ".env")

import sys
sys.path.insert(0, str(Path(__file__).parent.parent))

SUPABASE_URL = os.environ["SUPABASE_URL"]
SUPABASE_SERVICE_ROLE_KEY = os.environ["SUPABASE_SERVICE_ROLE_KEY"]
GROQ_API_KEY = os.environ["GROQ_API_KEY"]

# Use shim for new-format keys (sb_secret_...) or supabase-py for legacy JWTs
if SUPABASE_SERVICE_ROLE_KEY.startswith("sb_secret_") or SUPABASE_SERVICE_ROLE_KEY.startswith("sb_publishable_"):
    from app.db.client import _SupabaseShim
    db = _SupabaseShim(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
else:
    from supabase import create_client
    db = create_client(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

# ── 1. Define Concepts (DAG) ──────────────────────────────────────────────────
# Subject: Python Programming Fundamentals
# This is the human-authored concept DAG — not AI-generated.
CONCEPTS = [
    {"id": "c1", "name": "Variables & Data Types", "prerequisite_ids": []},
    {"id": "c2", "name": "Control Flow (if/else)", "prerequisite_ids": ["c1"]},
    {"id": "c3", "name": "Loops (for/while)", "prerequisite_ids": ["c1", "c2"]},
    {"id": "c4", "name": "Functions", "prerequisite_ids": ["c2", "c3"]},
    {"id": "c5", "name": "Lists & Indexing", "prerequisite_ids": ["c1"]},
    {"id": "c6", "name": "Dictionaries", "prerequisite_ids": ["c5"]},
    {"id": "c7", "name": "String Methods", "prerequisite_ids": ["c1"]},
    {"id": "c8", "name": "File I/O", "prerequisite_ids": ["c4", "c5"]},
]

GROUNDING = {
    "c1": "Variables store data. Python is dynamically typed: x=5 (int), x='hi' (str), x=3.14 (float), x=True (bool).",
    "c2": "if condition: executes a block when true. else: runs when false. elif chains multiple conditions.",
    "c3": "for x in iterable: loops over each element. while condition: loops until condition is False. break exits early, continue skips to next.",
    "c4": "def name(params): defines a function. return sends a value back. Functions encapsulate reusable logic.",
    "c5": "Lists are ordered, mutable sequences: lst=[1,2,3]. Index with lst[0]. Slice with lst[1:3]. Append with lst.append(x).",
    "c6": "Dicts map keys to values: d={'a':1}. Access with d['a']. Add with d['b']=2. Keys must be hashable.",
    "c7": "str.upper(), str.lower(), str.split(), str.strip(), str.replace(), str.find(), f-strings: f'Hello {name}'.",
    "c8": "open(path, mode) returns a file object. Modes: 'r' read, 'w' write, 'a' append. Use 'with open(...)' to auto-close.",
}


def seed_concepts():
    print("Seeding concepts...")
    for c in CONCEPTS:
        row = {
            "id": c["id"],
            "name": c["name"],
            "prerequisite_ids": c["prerequisite_ids"],
            "grounding": GROUNDING.get(c["id"], ""),
        }
        db.table("concepts").upsert(row, on_conflict="id").execute()
    print(f"  {len(CONCEPTS)} concepts seeded.")


def generate_questions_for_concept(concept_id: str, concept_name: str, grounding: str) -> list[dict]:
    """Use Groq to generate 3 questions per tier (9 total) for a concept."""
    from groq import Groq
    client = Groq(api_key=GROQ_API_KEY)

    all_questions = []
    tier_labels = {1: "beginner", 2: "intermediate", 3: "advanced"}

    for tier, label in tier_labels.items():
        prompt = f"""Generate 3 {label}-difficulty multiple-choice questions about: {concept_name}
Grounding: {grounding}

Output ONLY a JSON array of 3 objects, each with:
- body: the question text (string)
- options: list of exactly 4 strings (the choices, not labeled a/b/c/d)  
- correct_answer: the exact text of the correct option (must match one of the options exactly)

No markdown, no extra text — raw JSON array only."""

        try:
            resp = client.chat.completions.create(
                model="qwen/qwen3.8-27b",
                messages=[{"role": "user", "content": prompt}],
                max_tokens=1500,
                timeout=20,
            )
            raw = resp.choices[0].message.content.strip()
            if raw.startswith("```"):
                raw = raw.split("```")[1]
                if raw.startswith("json"):
                    raw = raw[4:]
            questions = json.loads(raw.strip())
            for q in questions:
                all_questions.append({
                    "concept_id": concept_id,
                    "difficulty_tier": tier,
                    "body": q["body"],
                    "options": q["options"],
                    "correct_answer": q["correct_answer"],
                })
            print(f"    ✓ {label} tier: {len(questions)} questions")
        except Exception as exc:
            print(f"    ✗ {label} tier failed: {exc}")

        time.sleep(0.5)  # light rate-limit buffer

    return all_questions


def seed_questions():
    print("Seeding questions via Groq (this takes ~30-60s)...")
    all_questions = []
    for c in CONCEPTS:
        print(f"  Concept: {c['name']}")
        qs = generate_questions_for_concept(c["id"], c["name"], GROUNDING.get(c["id"], ""))
        all_questions.extend(qs)

    print(f"\nInserting {len(all_questions)} questions...")
    # Insert in batches
    batch_size = 20
    for i in range(0, len(all_questions), batch_size):
        batch = all_questions[i:i + batch_size]
        db.table("questions").insert(batch).execute()
    print(f"  Done.")


def seed_diagnostic_student():
    """Insert a test student row for manual testing."""
    try:
        db.table("students").upsert(
            {"id": "test-student-001", "name": "Test Student"},
            on_conflict="id"
        ).execute()
        print("Test student 'test-student-001' seeded.")
    except Exception as exc:
        print(f"Student seed skipped (may already exist): {exc}")


if __name__ == "__main__":
    print("=== Seed script starting ===")
    seed_concepts()
    seed_questions()
    seed_diagnostic_student()
    print("\n=== Seed complete ===")
    print("Next step: run the schema migration SQL in Supabase SQL editor (see docs/schema.sql)")
