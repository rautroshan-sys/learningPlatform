# Tasks

Status: `todo` / `in-progress` / `done` / `blocked`
Priority: `MVP-critical` / `wow-factor`

Hour estimates are against the 8-hour budget, assuming parallel work across
the 6-person team (2 backend, 2 frontend, 1-2 on AI/adaptive engine).

## Foundation (Hour 0-1)
- [ ] todo — MVP-critical — Create Supabase project, run schema migration
  (students, concepts, questions, attempts, mastery)
- [ ] todo — MVP-critical — Define concepts (with prerequisite_ids) by hand
  — this is the DAG structure and stays human-authored
- [ ] todo — MVP-critical — Auto-generate the diagnostic questions and
  ~6-10 quiz questions per concept via Groq, with the same generation call
  self-labeling each question's difficulty tier (low/mid/high) — don't
  hand-write questions and hand-tag tiers as two separate steps
- [ ] todo — MVP-critical — Auto-generate the per-concept grounding dict
  (definition + 1-2 examples) via a one-off batch script run ahead of the
  event, not built into the live app
- [ ] todo — MVP-critical — Set up Groq API key, confirm a test call works

## Backend (Hour 1-4)
- [ ] todo — MVP-critical — FastAPI project skeleton + Supabase auth check
  middleware
- [ ] todo — MVP-critical — `/diagnostic/start` and `/diagnostic/submit`
- [ ] todo — MVP-critical — `/path/{student_id}` (topological sort of
  concept DAG weighted by mastery)
- [ ] todo — MVP-critical — `/quiz/next` and `/quiz/answer` (tier selection
  + BKT update wired in)
- [ ] todo — MVP-critical — `/mastery/{student_id}`
- [ ] todo — wow-factor — `/ai/practice-question` (regenerate on tier
  exhaustion)

## AI/ML — adaptive engine (Hour 1-4, parallel with backend)
- [ ] todo — MVP-critical — BKT update function (prior, learn, guess, slip
  parameters; default prior 0.3)
- [ ] todo — MVP-critical — Gap detection: trace prerequisite_ids on wrong
  answer, cap backtrack depth at 2
- [ ] todo — MVP-critical — Groq prompt for `/ai/hint` with pedagogical
  guardrail (leading question first, full explanation on 2nd wrong attempt)
- [ ] todo — wow-factor — Cache generated explanations per concept+tier to
  cut Groq calls and rate-limit risk

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