-- schema.sql
-- Run this in the Supabase SQL editor ONCE before starting the backend.
-- Safe to run multiple times (uses IF NOT EXISTS / ON CONFLICT).

CREATE TABLE IF NOT EXISTS students (
    id   TEXT PRIMARY KEY,  -- Supabase auth user UUID
    name TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS concepts (
    id               TEXT PRIMARY KEY,
    name             TEXT NOT NULL,
    prerequisite_ids JSONB DEFAULT '[]',
    grounding        TEXT  -- per-concept definition + example for AI grounding
);

CREATE TABLE IF NOT EXISTS questions (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    concept_id      TEXT NOT NULL REFERENCES concepts(id),
    difficulty_tier INT  NOT NULL CHECK (difficulty_tier IN (1, 2, 3)),
    body            TEXT NOT NULL,
    options         JSONB NOT NULL,  -- list of option strings
    correct_answer  TEXT NOT NULL    -- exact text matching one option
);

CREATE TABLE IF NOT EXISTS attempts (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id      TEXT NOT NULL,
    question_id     UUID NOT NULL REFERENCES questions(id),
    correct         BOOLEAN NOT NULL,
    timestamp       TIMESTAMPTZ DEFAULT NOW(),
    response_time_ms INT DEFAULT 0
);

-- Composite unique: one mastery row per (student, concept)
CREATE TABLE IF NOT EXISTS mastery (
    student_id  TEXT NOT NULL,
    concept_id  TEXT NOT NULL REFERENCES concepts(id),
    p_mastery   FLOAT NOT NULL DEFAULT 0.3,
    last_updated TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (student_id, concept_id)
);

-- Index for frequent mastery reads
CREATE INDEX IF NOT EXISTS idx_mastery_student ON mastery(student_id);
CREATE INDEX IF NOT EXISTS idx_attempts_student ON attempts(student_id);
CREATE INDEX IF NOT EXISTS idx_questions_concept_tier ON questions(concept_id, difficulty_tier);
