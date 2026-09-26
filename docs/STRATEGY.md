# Winning Strategy

## The real user pain

Students hit a wall not because they lack access to content, but because
every platform — free government MOOCs (AICTE/SWAYAM-style) and paid
enterprise training (Oracle University-style) alike — gives them the same
sequence, the same difficulty, and the same explanation regardless of what
they specifically do or don't understand. When a student fails, they get
told they're wrong, not *why*, and they're rarely redirected to the
specific earlier concept the failure actually traces back to.

## Three obvious solution angles other teams will build

1. A quiz app with an LLM chatbot bolted on for explanations — no real
   mastery tracking, no adaptive difficulty, just "ask AI" as a button.
2. A static multi-level quiz where the *student* manually picks
   easy/medium/hard — satisfies "adaptive assessments" on paper but adapts
   to a self-report, not to demonstrated performance.
3. A recommendation feature based on similarity to other students'
   activity (basic collaborative filtering) rather than the individual
   student's own concept-level mastery and prerequisite structure.

All three technically touch the PS checklist. None of them make the
adaptation *visible* or *causally explainable* — which is exactly what
separates "adaptive" from "has an AI feature."

## The differentiated angle (still finishable in 8 hours)

Build the full loop around two lightweight, textbook-correct models instead
of one generic AI layer:
- **Bayesian Knowledge Tracing** (a ~30-line hand-written update) for
  per-concept mastery — principled, not a black box, and cheap to implement.
- **A concept prerequisite DAG** for gap detection and path ordering —
  gaps are a dependency-structure problem, not a similarity problem.

Then make every adaptation decision **visible in the UI in real time**: when
a wrong answer causes a tier drop, show it; when a wrong answer traces back
to an unmet prerequisite two levels up, name that concept on screen. Ground
every AI-generated explanation in a small local reference dict so it can't
hallucinate, and guardrail the hint prompt so it teaches instead of just
answering (CS50 Duck's approach) — this is a one-line prompt change with
outsized credibility in front of judges who've seen generic AI wrappers all
day.

## What CS50 and Scrimba specifically don't do (the reference gap)

Both are excellent platforms, but neither is adaptive in the sense this PS
demands — worth citing by name in the pitch, not just the generic
AICTE/Oracle comparison above:

- CS50 gives every student the identical problem set in the identical week
  regardless of last week's performance. Scrimba's scrims are fixed content
  — same challenge, same order, for everyone. Neither re-tiers difficulty
  *within* a session based on the last answer — this is exactly what the
  BKT tier engine does. Show it live with a small "moving to harder
  questions" toast so judges see the adaptation happen, not just trust it
  happened.
- CS50's Duck answers questions about the code in front of the student; it
  doesn't reach backward into an earlier week's concept they never
  mastered. The concept DAG is what lets this platform say "you're failing
  this because you never solidified [X], which you're at 40% mastery on" —
  surface that exact sentence on the dashboard, not just a silent path
  reorder.
- CS50 tracks a per-pset grade, Scrimba tracks per-course completion — both
  siloed by content unit. A single `mastery` table spanning every concept,
  live-updated and shown as one radar/bar chart, is the one glanceable
  artifact that proves the whole PS loop closed — this alone should
  out-demo most competing teams.

### Stress test against the 8h / 6-person filter
- BKT: ~30 lines, no training, no ML framework — passable in under an hour.
- DAG topological sort: ~20 lines, standard algorithm — under an hour.
- Supabase removes auth and DB setup friction entirely.
- Team of 6 parallelizes cleanly: 2 backend, 2 frontend, 1-2 on the
  adaptive engine and Groq prompts.
- **Verdict: passes the filter.** No fallback angle needed.

## MVP features mapped to judging criteria

| Criterion | Feature that demonstrates it |
|---|---|
| Problem-solution fit | Full assessment→gap→path→quiz→update loop working end to end |
| Innovation/uniqueness | Visible, explainable adaptation (mastery score, tier change, and named prerequisite gap shown live) vs. competitors' silent or absent adaptation |
| Technical depth | Hand-written BKT + DAG-based gap detection, not a thin LLM wrapper |
| Feasibility in time limit | Entirely managed services (Supabase, Groq) with no training or custom infra |
| Demo impact | The wow moment below, plus a live mastery dashboard that visibly updates after every answer |

## The wow moment

Live, in front of judges: answer 2-3 questions on a concept incorrectly.
The screen shows, in real time: mastery score dropping, quiz difficulty
tier dropping, and a named message — "gap detected: this depends on
[prerequisite concept], currently at 40% mastery" — with the learning path
reordering to put that prerequisite first. Then answer that prerequisite's
question correctly and show the path snapping back. This is one continuous,
narratable sequence that proves every line of the PS in under a minute.

## Cut list (drop in this order if time runs short)

1. `/ai/practice-question` regeneration on tier exhaustion (pre-seed enough
   questions instead).
2. Visible "tier changed" / "gap detected" toasts — fall back to the
   dashboard number alone updating (loses some demo polish, keeps the
   mechanism).
3. Micro-interruption questions mid-explanation (Scrimba-style) — cut
   entirely, keep explanations as single blocks.
4. Mastery dashboard chart styling — fall back to a plain list of
   concept: percentage if Recharts integration runs long.
5. Never cut: the BKT update, the concept DAG gap detection, and the
   diagnostic→path→quiz loop — these are the PS itself.