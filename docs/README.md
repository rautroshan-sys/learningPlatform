# Adaptive AI-Powered Personalized Learning Platform
For hackathon build. 8-hour time limit, 6-person team.

## Problem

Students have different skill levels and learning gaps, but most educational
platforms (SWAYAM/AICTE-style MOOCs, Oracle University-style enterprise
training) serve the same content and assessments to everyone. Effective
learning requires continuous adaptation based on individual performance.

## Solution

A platform that runs one full adaptive learning cycle:
Diagnostic Assessment → Knowledge Gap Analysis → Personalized Learning Path →
Adaptive Quiz → Updated Recommendations — backed by a live, per-concept
mastery profile (Bayesian Knowledge Tracing) and a prerequisite concept graph
that explains *why* a gap exists, not just that one exists.

See `docs/WINNING_STRATEGY.md` for the differentiated angle and
`docs/ARCHITECTURE.md` for the full diagram and data flow.

## Tech stack

- Frontend: React (Vite) + Tailwind CSS + Recharts
- Backend: FastAPI (Python) + Uvicorn
- Database/Auth: Supabase (managed Postgres + built-in auth)
- AI: Groq API (Llama 3.1 8B for low-latency calls, Llama 3.3 70B for
  explanations), grounded with a small local per-concept reference dict
- Mastery model: hand-written Bayesian Knowledge Tracing (no training, no ML
  framework)

## Repo structure

```
/
├── README.md
├── .env.example
├── docs/
│   ├── PDR.md
│   ├── ARCHITECTURE.md
│   ├── API_CONTRACT.md
│   ├── TASKS.md
│   ├── CURRENT_STATE.md
│   ├── RISK_REGISTER.md
│   └── WINNING_STRATEGY.md
├── backend/
└── frontend/
```

# Backend

FastAPI service. Implementation not started — this is the planning stage.

Endpoints to build are frozen in `../docs/API_CONTRACT.md`. Do not deviate
from that contract without updating the doc first, so frontend work
happening in parallel doesn't break.

Planned structure once implementation begins:
```
backend/
├── main.py
├── routes/
├── adaptive/        # BKT update, concept DAG, tier selection
├── ai/              # Groq prompt building, grounding dict
└── db/              # Supabase client, schema
```

# Frontend

React (Vite) app. Implementation not started — this is the planning stage.

Consumes the endpoints frozen in `../docs/API_CONTRACT.md`.

Planned structure once implementation begins:
```
frontend/
├── src/
│   ├── pages/       # Diagnostic, Path, Quiz, Dashboard
│   ├── components/
│   └── lib/         # Supabase client, fetch helpers
```

## Setup

Not yet implemented — planning stage only. Once code starts, backend and
frontend each get their own setup instructions in their respective
`README.md`.