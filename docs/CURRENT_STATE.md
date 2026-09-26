# Current State

**Status: Backend & Frontend implementation complete (MVP phase). Real credentials configured, DB seeded successfully. UI is wired to mock data for visual verification.**

---

## Implemented (Backend — Completed, 2026-09-26)

### Foundation
- FastAPI app entrypoint (`main.py`) with lifespan hook, CORS, error handlers
- Config loading via pydantic-settings
- Supabase client (`app/db/client.py`) with `httpx`-based shim for the `sb_secret_...` service role key format (which breaks the official `supabase-py` client)
- Structured logging via structlog
- Global error handling
- Auth middleware (`app/core/auth.py`)

### Adaptive Engine
- BKT implementation (`app/adaptive/bkt.py`)
- Concept DAG utilities (`app/adaptive/dag.py`)

### Services
- `mastery_service.py`
- `quiz_service.py`
- `diagnostic_service.py`

### API Routes (all match API_CONTRACT.md exactly)
- All 9 routes implemented.

### AI Layer
- Groq client (`app/ai/groq_client.py`) — Switched to `qwen/qwen3.8-27b` and `allam-2-7b` due to Groq free-tier model availability restrictions.

### Supporting Files
- `docs/schema.sql` — Schema applied to live Supabase DB.
- `backend/scripts/seed.py` — Database seeded successfully with 69 tiered questions.
- `backend/.env` — Configured with live Supabase and Groq keys.

---

## Implemented (Frontend — Completed, 2026-09-26)

- Scaffolded Vite + React + TypeScript + Tailwind v3 + shadcn/ui.
- **Pages Built & Verified:**
  - `src/layouts/MainLayout.tsx`: Common header and routing wrapper.
  - `src/pages/Dashboard.tsx`: Displays the live updating learning path and a `recharts` radar chart of current mastery levels. Includes a 5-second polling interval.
  - `src/pages/Diagnostic.tsx`: Multi-step initial assessment flow to calibrate new users.
  - `src/pages/Quiz.tsx`: Adaptive quiz interface. Implements the Scrimba-style edit-in-place scratchpad and the CS50-style AI Tutor for hints. Includes sonner toasts for tier-ups and gap detection.
- **Data Layer:** `src/services/api.ts` implements all endpoints matching `API_CONTRACT.md` using simulated network delays and local mock data (`src/data/mock.ts`), allowing the UI to be fully interactive.
- **Deviations/Notes:**
  - Auth screens are skipped for now since we are purely running mock data for UI visual check.
  - The Figma link was missing, so we designed a premium dark mode UI inspired by CS50/Scrimba using shadcn/ui and Tailwind.

## Next Steps
- Integrate frontend with live backend API (replace `api.ts` mock functions with actual Fastapi calls).
- End-to-end walkthrough and demo script preparation.