# micro-os

A personal productivity ecosystem for a single developer. All data is local (IndexedDB), all apps run offline-first as a single SPA, and AI features degrade gracefully when APIs are unavailable.

## Apps

| Route | App | Purpose |
|---|---|---|
| `/` | Dashboard | Home, stats, activity feed, ⌘K command palette |
| `/jobs` | Job Tracker | Kanban board, detail drawer, analytics |
| `/email` | Email Composer | AI-assisted email drafting |
| `/linkedin` | LinkedIn Generator | Post generation and content library |
| `/journal` | Journal | Daily entries with mood tracking |
| `/habits` | Habits | Daily/weekly habit tracking with streaks |
| `/snippets` | Snippets | Code snippet library with fuzzy search |
| `/settings` | Settings | API keys, data export, clear data |

## Tech stack

- **Monorepo**: Turborepo + pnpm workspaces
- **Build**: Vite 6 (dashboard app)
- **Framework**: React 19 + TypeScript strict mode
- **Styling**: Tailwind CSS v4 + custom shadcn/ui components on Radix UI primitives
- **State**: Zustand (per-app stores)
- **Local DB**: Dexie.js (IndexedDB)
- **PWA**: vite-plugin-pwa (Workbox, offline-first)
- **Inter-app comms**: BroadcastChannel API (`@micro/data-bus`)
- **AI**: Tiered client — Ollama → Groq → Claude Haiku (`@micro/ai`)
- **Drag-and-drop**: @dnd-kit (job tracker Kanban)
- **Charts**: Recharts

## Project structure

```
micro-os/
├── apps/
│   ├── dashboard/       # OS shell — hosts all routes
│   ├── email-composer/  # Email drafting app
│   ├── linkedin-gen/    # LinkedIn post generator
│   ├── job-tracker/     # Job application Kanban
│   ├── journal/         # Daily journal
│   ├── habits/          # Habit tracker
│   └── snippets/        # Code snippet library
└── packages/
    ├── ui/              # @micro/ui — shared component library
    ├── storage/         # @micro/storage — Dexie schema + typed hooks
    ├── ai/              # @micro/ai — tiered LLM client
    ├── data-bus/        # @micro/data-bus — BroadcastChannel event bus
    └── config/          # @micro/config — shared TS, ESLint, Tailwind configs
```

## Setup

### Prerequisites

- Node.js ≥ 22
- pnpm ≥ 10

### Install

```bash
pnpm install
```

### Environment variables

Copy `.env.example` to `.env` in the repo root and fill in your API keys. All keys are optional — the system degrades gracefully without them.

```bash
cp .env.example .env
```

| Variable | Purpose |
|---|---|
| `VITE_GROQ_API_KEY` | Groq API key (free tier, llama3-8b-8192) |
| `VITE_ANTHROPIC_API_KEY` | Anthropic API key (paid fallback, claude-haiku-3-5-20241022) |
| `VITE_N8N_WEBHOOK_URL` | n8n webhook base URL (stub — not implemented) |

API keys can also be set in the app at `/settings` — they are stored in `localStorage` (client-side only).

### Run

```bash
pnpm dev
```

Opens the dashboard at [http://localhost:5173](http://localhost:5173).

### Typecheck

```bash
pnpm typecheck
```

### Build

```bash
pnpm build
```

## AI tiers

The `@micro/ai` package routes requests through three tiers, falling through on failure:

1. **local** — Ollama at `http://localhost:11434` (model: `llama3.1:8b`). Requires Ollama running locally.
2. **free** — Groq API (model: `llama3-8b-8192`). Requires `VITE_GROQ_API_KEY`.
3. **paid** — Anthropic API (model: `claude-haiku-3-5-20241022`). Requires `VITE_ANTHROPIC_API_KEY`.

All AI calls are cached in IndexedDB for 24 hours by prompt hash.

## Data

All data is stored in IndexedDB (`micro-os-db`). No data leaves the browser except AI API calls.

On first run, sample data is seeded automatically (3 jobs, 2 emails, 1 LinkedIn draft, 2 habits).

To export all data: **Settings → Export all data as JSON**.  
To clear all data: **Settings → Clear all data**.

## n8n integration

Webhook stubs are present in the codebase with `// TODO: wire to n8n webhook` comments. Set `VITE_N8N_WEBHOOK_URL` and implement the webhook handlers in n8n to enable:

- Email → Gmail draft creation (`/email` → Send to Gmail)
- Job status change notifications (`/jobs` → status changes to `technical` or `offer`)