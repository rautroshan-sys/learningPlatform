# PDR — Adaptive AI-Powered Personalized Learning Platform

## Problem

Students have different skill levels and learning gaps, but most educational
platforms provide the same content and assessments to everyone. Effective
learning requires continuous adaptation based on individual performance.
(Source: problem statement, verbatim intent.)

## Users

- Primary: students using the platform to learn a subject with topic-level
  prerequisites (e.g. programming fundamentals).
- Secondary (not built for MVP, noted for context): instructors who might
  view aggregate class mastery — out of scope for the 8-hour build.

## Pain points (from competitive analysis of existing platforms)

- Fixed, linear content sequencing regardless of prior knowledge
  (AICTE/SWAYAM-style MOOCs).
- No adaptive difficulty within an assessment — same quiz for every student.
- Generic recommendations or none at all (Oracle University-style catalogs
  lack a personalization engine).
- Feedback on wrong answers is binary (right/wrong) with no diagnosis of
  *why* the student got it wrong or what prerequisite concept is missing.

## Goals (functional requirements, mapped to the problem statement)

1. Diagnostic assessment on first use to seed an initial mastery estimate.
2. Track performance at the concept level (not just overall score).
3. Detect knowledge gaps by tracing unmet prerequisite concepts.
4. Generate a personalized learning path ordered by the concept dependency
   graph, weighted by current mastery.
5. Adapt quiz question difficulty automatically based on demonstrated
   mastery.
6. Provide AI-generated explanations, examples, and practice questions
   grounded in per-concept reference material (not free-form hallucination).
7. Continuously update the mastery profile after every attempt and use it
   for the next recommendation.

## Non-functional requirements

- Must run and demo live within the 8-hour build window.
- No paid infrastructure — every service used must have a usable free tier.
- Must survive a live demo doing several rapid quiz round-trips without
  hitting an API rate limit or crashing.

## Core user flow (MVP)

1. Student signs up / logs in (Supabase Auth).
2. Student takes a short diagnostic assessment (1-2 questions per root
   concept).
3. System computes initial per-concept mastery and generates a learning
   path.
4. Student views the path and starts a quiz on the first recommended
   concept.
5. On each answer: mastery updates (BKT), next question's difficulty tier is
   selected based on updated mastery, and — on a wrong answer — a grounded
   AI explanation is shown, with a guardrailed hint shown before the full
   answer.
6. Dashboard shows live per-concept mastery and the current recommended
   path, updating after every attempt.

## MVP scope (ruthless cut line)

In scope:
- Single subject/concept set (hardcoded or seeded, not user-authored content)
- Diagnostic → path → adaptive quiz → dashboard loop, fully working
- BKT mastery engine, concept DAG, tier-based difficulty
- Grounded Groq-based explanations and hints with pedagogical guardrails

Out of scope (explicitly, for this build):
- Multiple subjects / course catalogs
- Instructor-facing views or class-level analytics
- Spaced repetition scheduling across days
- Mobile app / offline mode
- Content authoring UI (concepts and questions are seeded via script, not
  created in-app)
- Multi-language support

## Why this wins

Most teams building this PS will ship a working quiz app with an LLM bolted
on for explanations — that satisfies the checklist but isn't actually
adaptive in the way the PS asks for. This build makes the adaptation
mechanism visible and explainable in the UI (mastery score, tier change, and
the specific prerequisite gap causing a redirect are all shown on screen,
not hidden in backend logic), which directly demonstrates every requirement
line in the PS rather than approximating it with a generic AI chatbot.