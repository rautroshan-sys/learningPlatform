# API Contract

Auth: all endpoints except `/health` require a Supabase session token in
`Authorization: Bearer <token>`. Backend verifies it against Supabase before
proceeding. Error shape is consistent across all endpoints:

```json
{ "error": "short_code", "message": "human readable message" }
```

---

### GET /health
Purpose: liveness check for deploy verification.
Response 200: `{ "status": "ok" }`

---

### GET /diagnostic/start
Purpose: fetch the diagnostic question set for a new student (1-2 questions
per root concept — concepts with no prerequisites).
Response 200:
```json
{ "questions": [{ "id": "q1", "concept_id": "c1", "body": "...", "options": ["..."] }] }
```
Error 401: not authenticated.

---

### POST /diagnostic/submit
Purpose: submit diagnostic answers, seed initial mastery rows.
Request:
```json
{ "answers": [{ "question_id": "q1", "selected": "a" }] }
```
Response 200:
```json
{ "mastery": [{ "concept_id": "c1", "p_mastery": 0.3 }] }
```
Error 400: malformed answers payload.

---

### GET /path/{student_id}
Purpose: return the current personalized learning path (concept DAG,
topologically sorted, weighted by mastery).
Response 200:
```json
{ "path": [{ "concept_id": "c1", "name": "...", "p_mastery": 0.3, "recommended": true }] }
```
Error 403: student_id does not match authenticated session.

---

### GET /quiz/next/{student_id}
Purpose: return the next question for the student, tier-selected from
current mastery of the active concept.
Response 200:
```json
{ "question": { "id": "q5", "concept_id": "c2", "difficulty_tier": 2, "body": "...", "options": ["..."] } }
```
Error 404: no questions left in any tier for this concept (should trigger
regeneration server-side — see RISK_REGISTER.md — not surfaced to frontend
as an error in the happy path).

---

### POST /quiz/answer
Purpose: submit an answer, trigger the BKT update, return updated mastery
and next-tier signal.
Request:
```json
{ "student_id": "s1", "question_id": "q5", "selected": "b" }
```
Response 200:
```json
{
  "correct": false,
  "p_mastery": 0.42,
  "tier_changed": true,
  "new_tier": 1,
  "gap_concept_id": "c1"
}
```
`gap_concept_id` is present only when a wrong answer traces back to an
unmet prerequisite below the mastery threshold; otherwise `null`.
Error 400: question_id not found or already answered in this session.

---

### GET /mastery/{student_id}
Purpose: full current mastery profile, for the dashboard. Polled
periodically by the frontend.
Response 200:
```json
{ "mastery": [{ "concept_id": "c1", "name": "...", "p_mastery": 0.42 }] }
```

---

### POST /ai/hint
Purpose: guardrailed hint after a wrong answer — first call returns a
leading question or partial explanation, not the full answer.
Request:
```json
{ "student_id": "s1", "question_id": "q5", "attempt_number": 1 }
```
Response 200:
```json
{ "hint": "...", "full_explanation_unlocked": false }
```
On `attempt_number >= 2`, `full_explanation_unlocked` is `true` and `hint`
contains the full grounded explanation.
Error 502: Groq call failed — response falls back to the static
grounding-dict explanation with `"source": "fallback"` added to the body.

---

### POST /ai/practice-question
Purpose: generate a fresh practice question for a concept when the tiered
question bank is exhausted.
Request:
```json
{ "concept_id": "c2", "difficulty_tier": 2 }
```
Response 200:
```json
{ "question": { "body": "...", "options": ["..."], "correct_answer": "b" } }
```