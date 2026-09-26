# Tasks

Status: `todo` / `in-progress` / `done` / `blocked`
Priority: `MVP-critical` / `wow-factor`

Hour estimates are against the 8-hour budget, assuming parallel work across
the 6-person team (2 backend, 2 frontend, 1-2 on AI/adaptive engine).

## Foundation (Hour 0-1)
- [ ] in-progress — MVP-critical — Create Supabase project, run schema migration
  (students, concepts, questions, attempts, mastery) — schema.sql written at docs/schema.sql; needs Supabase project credentials to run
- [x] done — MVP-critical — Define concepts (with prerequisite_ids) by hand
  — 8 Python concepts with DAG structure defined in backend/scripts/seed.py
- [x] done — MVP-critical — Auto-generate diagnostic and quiz questions via Groq
  — seed.py generates 3 questions per tier (9 total) per concept, self-labeling tiers
- [x] done — MVP-critical — Auto-generate per-concept grounding dict
  — grounding text for all 8 concepts embedded in seed.py, stored in concepts.grounding column
- [ ] in-progress — MVP-critical — Set up Groq API key, confirm a test call works
  — GROQ_API_KEY slot in .env.example; needs real key

## Backend (Hour 1-4)
- [x] done — MVP-critical — FastAPI project skeleton + Supabase auth check middleware
  — main.py, app/core/auth.py (JWT via PyJWT), all verified running
- [x] done — MVP-critical — `/diagnostic/start` and `/diagnostic/submit`
  — auth, validation, service layer all implemented; DB paths need real creds
- [x] done — MVP-critical — `/path/{student_id}` (topological sort of
  concept DAG weighted by mastery) — Kahn's algorithm, mastery-weighted, verified
- [x] done — MVP-critical — `/quiz/next` and `/quiz/answer` (tier selection
  + BKT update wired in) — tier selection, answered-set exclusion, BKT, gap detection all wired
- [x] done — MVP-critical — `/mastery/{student_id}` — full profile join, verified
- [x] done — wow-factor — `/ai/practice-question` (regenerate on tier exhaustion)
  — Groq 70B, JSON parsing, fallback on failure

## AI/ML — adaptive engine (Hour 1-4, parallel with backend)
- [x] done — MVP-critical — BKT update function (prior=0.3, learn=0.10, guess=0.25, slip=0.10)
  — app/adaptive/bkt.py, mathematically verified
- [x] done — MVP-critical — Gap detection: trace prerequisite_ids on wrong
  answer, cap backtrack depth at 2 — app/adaptive/dag.py, verified
- [x] done — MVP-critical — Groq prompt for `/ai/hint` with pedagogical
  guardrail (leading question first, full explanation on 2nd wrong attempt)
  — app/ai/groq_client.py, guardrail at attempt_number >= 2
- [x] done — wow-factor — Cache generated explanations per concept+tier
  — in-memory dict cache in groq_client.py, keyed by (concept_id, question_id, attempt_number)

## Frontend (Hour 1-5)
- [ ] todo — MVP-critical — Supabase auth screens (signup/login)
- [ ] todo — MVP-critical — Diagnostic assessment flow
- [ ] todo — MVP-critical — Learning path view (ordered concept list with
  mastery %)
- [ ] todo — MVP-critical — Quiz view with answer submission and hint
  display
- [ ] todo — MVP-critical — Mastery dashboard (Recharts bar/radar), polling
  the mastery endpoint every few seconds so it auto-refreshes on every
  attempt — this is what makes "continuously updated profile" feel real in
  a live demo instead of requiring a manual page refresh
- [ ] todo — wow-factor — Visible toasts on tier change ("moving to harder
  questions") and on gap detection ("gap detected: this depends on [X],
  currently at [Y]% mastery") — see WINNING_STRATEGY.md

## Integration (Hour 5-6)
- [ ] todo — MVP-critical — Wire frontend to live backend, remove any
  mock data
- [ ] todo — MVP-critical — End-to-end walkthrough: diagnostic → path →
  quiz → mastery update → path re-order, confirmed working

## Testing (Hour 6-6.5)
- [ ] todo — MVP-critical — Manual run-through with a fresh student account
  covering both a correct-answer streak and a wrong-answer streak (to
  trigger both tier-up and gap-detection paths)
- [ ] todo — MVP-critical — Confirm Groq fallback works by simulating a
  failed call

## Deployment (Hour 6.5-7)
- [ ] todo — MVP-critical — Deploy backend (Render/Railway) and frontend
  (Vercel/Netlify), confirm environment variables are set
- [ ] todo — MVP-critical — Smoke test the deployed URLs, not just localhost

## Demo Prep (Hour 7-8)
- [ ] todo — MVP-critical — Script the demo around the wow moment (see
  WINNING_STRATEGY.md): a wrong-answer streak that visibly triggers gap
  detection, a path reorder, and a tier drop, narrated live
- [ ] todo — wow-factor — One slide with the "existing platforms vs. us"
  comparison table for judge framing