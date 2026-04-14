# micro-os — Project Specification

## Problem Statement

Build a production-quality personal productivity ecosystem for a single developer. All data is local (IndexedDB), all apps run offline-first as a single SPA, and AI features degrade gracefully when APIs are unavailable. This is not a demo or scaffold — every decision reflects senior engineering judgment.

---

## Clarifications Applied

| Question | Decision |
|---|---|
| Claude model ID | `claude-haiku-3-5-20241022` |
| Journal / Habits / Snippets scope | Full implementation (specs defined below) |
| Geist font in Vite | Install `geist` npm package, reference its CSS file for CSS variables |
| shadcn/ui primitives | Use `@radix-ui/*` packages as the underlying primitive layer |
| App import pattern | Relative path imports from dashboard into each app's `src/` |
| Done criteria | All 12 steps complete + all quality bars passing |

---

## Tech Stack (non-negotiable)

| Concern | Choice |
|---|---|
| Monorepo | Turborepo + pnpm workspaces |
| Build | Vite 6 (per app) |
| Framework | React 19 + TypeScript (strict mode) |
| Styling | Tailwind CSS v4 + shadcn/ui (manual, no CLI) |
| UI primitives | `@radix-ui/*` packages |
| State | Zustand (per-app stores, persist middleware) |
| Local DB | Dexie.js (IndexedDB) |
| PWA | vite-plugin-pwa (Workbox, offline-first) |
| Inter-app comms | BroadcastChannel API (no library) |
| AI | Custom tiered client: Ollama → Groq → Claude Haiku |
| Routing | React Router v7 (inside dashboard SPA) |
| Icons | lucide-react |
| PDF export | jsPDF + html2canvas |
| Search | Fuse.js (client-side fuzzy) |
| Charts | Recharts |
| Drag-and-drop | @dnd-kit/core (job-tracker Kanban) |
| Font | `geist` npm package (CSS variables) |

---

## Project Structure

```
micro-os/
├── apps/
│   ├── dashboard/               # Central launcher SPA — the "OS shell"
│   ├── email-composer/          # Gmail drafting + reply suggestion tool
│   ├── linkedin-gen/            # LinkedIn post + idea generator
│   └── job-tracker/             # Job application Kanban board
├── packages/
│   ├── ui/                      # @micro/ui — shared shadcn/ui component library
│   ├── storage/                 # @micro/storage — Dexie.js schema + typed hooks
│   ├── ai/                      # @micro/ai — tiered LLM client
│   ├── data-bus/                # @micro/data-bus — BroadcastChannel event bus
│   └── config/                  # @micro/config — shared ESLint, TS, Tailwind configs
├── turbo.json
├── pnpm-workspace.yaml
├── .env.example
└── README.md
```

### Architecture Rules

1. **Single SPA.** All micro-apps are lazy-loaded routes within `apps/dashboard`. The `apps/` directories outside dashboard contain their own source but are imported via relative paths by dashboard — not iframed, not separately served.
2. **Shared packages only.** Every app imports from `@micro/*` packages for shared concerns. No app duplicates storage logic, AI calls, or UI components.
3. **IndexedDB for all data.** `localStorage` is only allowed for tiny config flags (theme preference, last-opened app, API keys with a client-side-only warning).
4. **AI calls via `@micro/ai` only.** No app calls an LLM API directly.
5. **n8n stubs only.** Integration points are typed webhook utility functions with `// TODO: wire to n8n webhook at localhost:5678` comments. Do not implement n8n.
6. **Offline-first.** Every app works fully offline. AI call failures degrade gracefully — show a placeholder, never crash.
7. **TypeScript strict mode everywhere.** No `any`. No `// @ts-ignore`.

---

## Package Specifications

### @micro/config

**Location:** `packages/config/`

Contents:
- `tsconfig.base.json` — `strict: true`, `target: ES2022`, `moduleResolution: bundler`
- `eslint.config.base.js` — react, typescript-eslint, import rules
- `tailwind.config.base.ts` — design tokens as CSS variables (see Design System)

All apps and packages extend these. No copy-pasting config.

---

### @micro/ui

**Location:** `packages/ui/`

Built on `@radix-ui/*` primitives with Tailwind CSS v4. Components are manually authored — no shadcn CLI. All components are typed and dark-mode aware.

**Exported components:**

| Component | Notes |
|---|---|
| `Button` | variants: `default`, `ghost`, `outline`, `destructive` |
| `Input` | |
| `Textarea` | |
| `Label` | |
| `Card`, `CardHeader`, `CardContent`, `CardFooter` | |
| `Badge` | variants: `default`, `success`, `warning`, `destructive`, `info` |
| `Dialog`, `DialogContent`, `DialogHeader` | Radix Dialog primitive |
| `Dropdown`, `DropdownItem` | Radix DropdownMenu primitive |
| `Sidebar` | Collapsible, icon+label nav, 240px expanded / 56px collapsed |
| `AppShell` | Layout: sidebar + main content area |
| `EmptyState` | icon + heading + subtext + optional CTA |
| `LoadingSpinner` | |
| `Toast` | via `sonner` |
| `Kbd` | Keyboard shortcut badge |

**Design system tokens** (defined in `tailwind.config.base.ts` as CSS variables):

```
Background:  --bg-primary: #0f0f0f  --bg-secondary: #1a1a1a  --bg-tertiary: #242424
Text:        --text-primary: #f0f0f0  --text-secondary: #a0a0a0  --text-muted: #606060
Border:      --border: #2a2a2a  --border-hover: #3a3a3a
Accent:      --accent: #6366f1  --accent-hover: #818cf8  --accent-muted: #6366f120
Success:     --success: #22c55e  --success-muted: #22c55e20
Warning:     --warning: #f59e0b  --warning-muted: #f59e0b20
Destructive: --destructive: #ef4444  --destructive-muted: #ef444420
```

Default theme: **dark**. Light theme toggle is a stretch goal — do not implement unless core is complete.

**Typography:**
- Font: Geist Sans — install `geist` npm package, reference its CSS file to load the font and set CSS variables
- Mono: Geist Mono — for code, IDs, dates in monospace contexts
- Scale: `12px / 14px / 16px / 20px / 24px / 32px` — no other sizes

---

### @micro/storage

**Location:** `packages/storage/`

Single Dexie database: `'micro-os-db'`, version 1.

**Schema:**

```typescript
emails:   '++id, subject, from, to, date, labels, threadId, status, draftReply'
          status: 'inbox' | 'draft-replied' | 'archived'

jobs:     '++id, company, role, status, appliedAt, notes, url, salary, contacts'
          status: 'wishlist' | 'applied' | 'screen' | 'technical' | 'offer' | 'rejected' | 'withdrawn'

posts:    '++id, platform, content, hook, variants, tags, createdAt, status'
          platform: 'linkedin' | 'twitter'
          status: 'draft' | 'published'

journal:  '++id, date, content, mood, tags, wordCount'
          mood: 'great' | 'good' | 'neutral' | 'bad' | 'terrible'

habits:   '++id, name, frequency, completions, streak, createdAt'
          frequency: 'daily' | 'weekly'

snippets: '++id, title, content, language, tags, createdAt, lastUsed'

ai_cache: '++id, hash, prompt, systemPrompt, model, result, createdAt'
          TTL: 24 hours (checked on read)
```

**Typed hooks** (one per table):

```typescript
useEmails()    → { data, loading, error, add, update, remove, search }
useJobs()      → { data, loading, error, add, update, remove, search }
usePosts()     → { data, loading, error, add, update, remove, search }
useJournal()   → { data, loading, error, add, update, remove, search }
useHabits()    → { data, loading, error, add, update, remove, search }
useSnippets()  → { data, loading, error, add, update, remove, search }
```

`search()` uses Fuse.js for fuzzy matching on relevant text fields per table.

**Cross-table search:**

```typescript
globalSearch(query: string): Promise<SearchResult[]>
// SearchResult is a discriminated union typed by table name
```

---

### @micro/ai

**Location:** `packages/ai/`

**Primary export:**

```typescript
ask(options: AskOptions): Promise<AskResult>

type AskOptions = {
  prompt: string
  systemPrompt?: string
  tier?: 'local' | 'free' | 'paid'   // default: 'free'
  taskType?: 'draft' | 'summarize' | 'generate' | 'classify' | 'extract'
  maxTokens?: number
  cache?: boolean                      // default: true
}

type AskResult = {
  content: string
  model: string
  tier: 'local' | 'free' | 'paid'
  cached: boolean
  error?: string
}
```

**Tier routing:**

| Tier | Provider | Model | Env var | Fallback |
|---|---|---|---|---|
| `local` | Ollama at `http://localhost:11434` | `llama3.1:8b` | — | Falls through to `free` if unreachable |
| `free` | Groq API | `llama3-8b-8192` | `VITE_GROQ_API_KEY` | Falls through to `paid` if key missing or quota exceeded |
| `paid` | Anthropic API | `claude-haiku-3-5-20241022` | `VITE_ANTHROPIC_API_KEY` | Returns graceful error result — never throws |

**Cache:** SHA-256 hash of `(prompt + systemPrompt + model)`. Stored in `ai_cache` IndexedDB table with 24-hour TTL. Cache hit returns instantly without network call.

**React hook:**

```typescript
useAI(): { loading: boolean, result: AskResult | null, error: string | null, run: (options: AskOptions) => void }
```

---

### @micro/data-bus

**Location:** `packages/data-bus/`

Thin wrapper around `BroadcastChannel`. Channel name: `'micro-os-bus'`.

**Exports:**

```typescript
emit(event: BusEvent, payload?: unknown): void
on(event: BusEvent, handler: (payload: unknown) => void): () => void  // returns cleanup fn

type BusEvent =
  | 'job:added'
  | 'job:updated'
  | 'email:draft-created'
  | 'email:archived'
  | 'post:published'
  | 'journal:saved'
  | 'habit:completed'
  | 'search:global'

useBusEvent(event: BusEvent, handler: (payload: unknown) => void): void
// React hook — auto-cleans up on unmount
```

---

## App Specifications

### apps/dashboard (route: `/`)

The OS shell. Hosts all other apps as lazy-loaded routes.

**Layout:**
- Sidebar (collapsible, 240px expanded / 56px collapsed)
  - Logo: `"micro-os"` in Geist Mono, accent color, top of sidebar
  - Nav items (icon + label): Home, Email, LinkedIn, Jobs, Journal, Habits, Snippets
  - Bottom: Settings icon, keyboard shortcut hint (`⌘K`)
- Main content area: full remaining width, no max-width cap

**Home route (`/`):**
- Grid of app cards (2-col tablet, 3-col desktop): app name, description, last-used timestamp, quick-action button
- Recent activity feed: last 10 cross-app events from `@micro/data-bus`
- 3 stat counters: open jobs, inbox emails, posts drafted

**Command palette (`⌘K` / `Ctrl+K`):**
- Full-screen modal triggered by keyboard shortcut
- Searches all `@micro/storage` tables via `globalSearch()`
- Results grouped by type (email, job, post, etc.) with icons
- Keyboard navigable (arrow keys + enter)
- Enter navigates to the relevant app + item

**PWA config (`vite-plugin-pwa`):**
- App name: `"micro-os"`
- Cache strategy: `NetworkFirst` for API calls, `CacheFirst` for assets
- Offline fallback page showing which features are available offline
- Install prompt: show dismissable banner, handle gracefully

**Settings route (`/settings`):**
- API key inputs (Groq, Anthropic) stored in `localStorage` — clearly labeled as client-side only with a security warning
- AI tier preference selector
- Clear all data button (with confirmation dialog)
- Export all data as JSON button

---

### apps/email-composer (route: `/email`)

**Purpose:** Draft and manage email replies with AI assistance.

**Views:**

1. **Inbox list**
   - Emails from `@micro/storage`, sorted by date
   - Each row: sender, subject, date, status badge, quick-archive button
   - Filter tabs: All / Needs Reply / Archived

2. **Compose / Reply view** (triggered by clicking an email or "New Draft")
   - Left panel: original email thread (read-only, scrollable)
   - Right panel: AI draft area
     - Context input: "What's the goal of this reply?" (optional)
     - Tone selector: Professional / Friendly / Direct / Brief
     - Generate button → `useAI()` with `tier: 'free'`
     - Shows 2 variants side by side
     - Edit area: user refines selected variant
     - Word count + reading time display
     - "Save Draft" → saves to `@micro/storage`, emits `email:draft-created`
     - "Send to Gmail" → `// TODO: wire to n8n webhook at localhost:5678`
       Payload: `{ type: 'create-draft', to, subject, body, threadId }`

3. **Empty state** when inbox is empty — button to manually add an email (paste subject + body)

---

### apps/linkedin-gen (route: `/linkedin`)

**Purpose:** Generate LinkedIn posts and build a content library.

**Views:**

1. **Idea generator**
   - Prompt input: "What's the core idea or experience you want to share?"
   - Format selector: Story / Insight / List / Hot take / Behind the scenes
   - Audience selector: Engineers / Hiring managers / Founders / General
   - Generate → `useAI()`, returns 3 post hooks (opening lines only)
   - Click a hook → expands into full post generation view

2. **Post editor**
   - Left: editable post textarea with character counter (LinkedIn max: 3000)
   - Right: live preview styled as a LinkedIn post card (avatar, name, "micro-os user", formatted text with line breaks preserved)
   - Hashtag suggester: auto-generates 5 relevant hashtags, toggleable
   - "Save draft" → `@micro/storage`
   - "Mark as published" → updates status, emits `post:published` on data-bus
   - Variants tab: 2 alternative versions of the same post

3. **Content library**
   - Grid of saved posts, filterable by status (draft / published) and tags
   - Click to reopen in editor
   - Delete with confirmation

---

### apps/job-tracker (route: `/jobs`)

**Purpose:** Track job applications through the pipeline.

**Views:**

1. **Kanban board** (primary view)
   - Columns: Wishlist → Applied → Screen → Technical → Offer → Rejected
   - Cards: company logo initial, role title, company, days since applied
   - Drag-and-drop between columns (`@dnd-kit/core`)
   - Click card → opens detail drawer (right panel slide-in)
   - "+ Add" button in each column header

2. **Job detail drawer**
   - Fields: Company, Role, URL, Salary range, Applied date, Notes (markdown textarea — stored as markdown, rendered as plain text in drawer)
   - Contacts section: add names + LinkedIn URLs
   - Status change buttons matching Kanban columns
   - AI Coach: "Prep for this role" → `useAI()` with role + company context, returns 5 likely interview questions
   - Archive and Delete actions at bottom
   - `// TODO: wire to n8n webhook when status changes to 'technical' or 'offer'`
     Payload: `{ type: 'job-status-change', company, role, status, jobId }`

3. **Analytics view** (toggle from Kanban)
   - Funnel chart (Recharts): applications at each stage
   - Response rate: (screens + technical + offers) / total applied
   - Avg days to response (applied → first screen)
   - Applications per week bar chart (last 8 weeks)
   - Top companies by stage

---

### apps/journal (route: `/journal`)

**Purpose:** Daily journaling with mood tracking and AI reflection prompts.

**Views:**

1. **Today's entry** (default view)
   - Date header (today's date, Geist Mono)
   - Mood selector: 5 options (great / good / neutral / bad / terrible) with emoji indicators
   - Full-width textarea for journal content (auto-saves to `@micro/storage` on blur, debounced 500ms)
   - Word count display
   - Tag input (comma-separated, stored as array)
   - "AI Reflection Prompt" button → `useAI()` with `taskType: 'generate'`, returns a single thoughtful journaling prompt based on recent entries (last 3 entries passed as context)
   - Emits `journal:saved` on data-bus on save

2. **Entry history** (calendar or list toggle)
   - Calendar view: month grid, days with entries highlighted by mood color
   - List view: entries sorted by date descending, showing date, mood badge, first 100 chars of content
   - Click any entry to open it in the editor view

3. **Insights panel** (sidebar or bottom section)
   - Mood trend chart (Recharts line chart, last 30 days)
   - Streak counter: consecutive days with entries
   - Word count total (all time)
   - Most used tags

---

### apps/habits (route: `/habits`)

**Purpose:** Track daily and weekly habits with streaks.

**Views:**

1. **Today's habits** (default view)
   - List of all habits, grouped by frequency (Daily / Weekly)
   - Each habit row: name, streak badge, completion checkbox for today
   - Checking off a habit updates `completions` array and recalculates `streak`
   - Emits `habit:completed` on data-bus
   - "+ Add habit" button → inline form (name, frequency)
   - Edit / Delete per habit (via row actions)

2. **Habit detail / history**
   - Click a habit → opens detail panel
   - Completion heatmap (GitHub-style grid, last 12 weeks) using Recharts or a custom SVG grid
   - Current streak, longest streak, completion rate (last 30 days)

3. **Weekly summary** (shown on Sunday or on demand)
   - Which habits were completed this week
   - Which were missed
   - AI encouragement message → `useAI()` with `taskType: 'generate'`, brief motivational note based on completion data

---

### apps/snippets (route: `/snippets`)

**Purpose:** Personal code snippet library with fuzzy search.

**Views:**

1. **Snippet library** (default view)
   - Grid or list toggle
   - Each card: title, language badge, first 3 lines of content (monospace), tags, last-used date
   - Search bar at top → Fuse.js fuzzy search on title + content + tags (via `useSnippets().search()`)
   - Filter by language (derived from stored snippets)
   - "+ New snippet" button

2. **Snippet editor**
   - Title input
   - Language selector (free-text input with common suggestions: TypeScript, Python, Bash, SQL, etc.)
   - Code textarea (Geist Mono, no syntax highlighting required — keep it simple)
   - Tags input
   - "Save" → `@micro/storage`, updates `lastUsed` on open
   - "Copy to clipboard" button
   - "Export as file" button (downloads as `.ts`, `.py`, etc. based on language)
   - Delete with confirmation

3. **Empty state** with a prompt to add the first snippet

---

## Seed Data

Seeded on first run via `localStorage` flag `'micro-os-seeded'`. Data must feel real, not obviously fake.

**Jobs (3 entries across different stages):**
- Stripe — Senior Full-Stack Engineer — `applied` — $125k–$145k
- Vercel — Staff Engineer, Developer Experience — `screen` — $140k–$160k
- Anthropic — AI Application Engineer — `technical` — $150k–$175k

**Emails (2 entries):**
- From: `recruiter@stripe.com` — Subject: "Re: Senior Full-Stack Engineer — Next Steps" — status: `inbox`
- From: `hiring@vercel.com` — Subject: "Technical screen scheduled — Vercel Staff Engineer" — status: `inbox`

**LinkedIn post (1 draft):**
- Topic: "What I learned building a type-safe event bus with TypeScript discriminated unions" — status: `draft`

**Habits (2 entries):**
- "Deep work block (2h)" — daily — streak: 4
- "Weekly code review + refactor" — weekly — streak: 2

---

## Environment Variables

`.env.example` at repo root:

```
# AI — all optional, system degrades gracefully without them
VITE_GROQ_API_KEY=
VITE_ANTHROPIC_API_KEY=

# n8n — leave blank until n8n setup is complete
VITE_N8N_WEBHOOK_URL=http://localhost:5678/webhook
```

---

## Build Order

Build in exactly this order. Complete each step before starting the next. Do not skip ahead.

| Step | Deliverable |
|---|---|
| 1 | `pnpm-workspace.yaml` + `turbo.json` + root `package.json` |
| 2 | `@micro/config` (tsconfig, eslint, tailwind base) |
| 3 | `@micro/ui` (all components listed above) |
| 4 | `@micro/storage` (Dexie schema + all hooks + seed data logic) |
| 5 | `@micro/data-bus` |
| 6 | `@micro/ai` (full tiered client + cache) |
| 7 | `apps/dashboard` — shell only (layout, sidebar, routing, ⌘K palette, PWA config) |
| 8 | `apps/job-tracker` (Kanban + detail drawer + analytics) |
| 9 | `apps/email-composer` |
| 10 | `apps/linkedin-gen` |
| 11 | `apps/journal` + `apps/habits` + `apps/snippets` |
| 12 | Wire dashboard Home route stats + activity feed with real storage data. Write `README.md` and `.env.example`. |

---

## Quality Bars

Every component must meet these bars before moving to the next step:

- `tsc --noEmit` passes with zero errors
- No console errors in the browser
- Works with no API keys set (AI calls degrade gracefully)
- Works with no internet (IndexedDB data loads, no white screens)
- Empty states handled (never a blank page with no explanation)
- Loading states handled (spinner or skeleton, never layout shift)
- Error states handled (toast notification, never a crash)

---

## Constraints

- No `create-react-app` or Next.js
- No Redux or Context API for app state (Zustand only)
- No CSS-in-JS (Tailwind only)
- No authentication (local-only, single user)
- No external services except the AI APIs listed above
- No n8n implementation (stubs only)
- No analytics, tracking, or telemetry
- No `any` in TypeScript
- No placeholder/lorem ipsum — all seed/mock data must be realistic

---

## Completion Criteria (Ralph Loop Done)

The implementation is complete when:

1. All 12 build steps are finished
2. `tsc --noEmit` passes across the entire monorepo (`turbo run typecheck`)
3. The dev server starts without errors (`turbo run dev`)
4. All 7 apps/routes render without console errors
5. All quality bars above are met for every component
6. Seed data loads correctly on first run
7. AI calls degrade gracefully when `VITE_GROQ_API_KEY` and `VITE_ANTHROPIC_API_KEY` are unset
8. The app is installable as a PWA (manifest + service worker registered)
