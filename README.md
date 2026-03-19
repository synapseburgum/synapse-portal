# Synapse Portal

Personal dashboard and app hub with a **mobile-first Gardening app**.

## Tech Stack

- **Framework:** Next.js 15 (App Router)
- **Database:** SQLite + Prisma ORM (dev-ready, can migrate to PostgreSQL later)
- **UI:** Custom **Synaptic design system** (OKLCH palette, dark mode, motion)
- **Icons:** Lucide React
- **API:** REST endpoints for UI + agent automation

## Getting Started

```bash
npm install
npm run db:push
npm run db:seed
npm run dev
```

Open: `http://localhost:3456` (or your configured local port).

## Gardening App Features

- **Plant Library**
  - List and filter plants by category
  - Plant detail pages with sowing/harvest windows
  - New plant form
- **Seed Inventory**
  - Track quantity, expiry, supplier, and batch code
  - Low stock filtering
  - Add/view seed batches
- **Tasks (Persistent checkboxes)**
  - One-off and recurring tasks (daily/weekly/monthly)
  - Per-date completion tracking via `TaskCompletion`
  - Batch completion endpoint for agent workflows
- **Calendar**
  - Day / Week / Month views
  - Color-coded event types: sowing, harvest, task, transplant
  - Aggregates data from tasks, plantings, and plant windows
- **Plantings Lifecycle**
  - Track status progression (`sown → germinated → transplanted → growing → ...`)
  - Add plantings and update status from detail page

## Daily Brief Features

- TL;DR summary at top + expandable full briefing
- Searchable archive (date range + content query)
- Previous/Next day navigation
- Jump-to-date picker
- Export brief as `.txt`
- Mark read/unread
- Pin/unpin important briefs
- Optional `audioUrl` for Clark-generated audio briefing links
- Auto-generation of today's brief from weather + garden workload context

## Key Routes

### UI
- `/`
- `/brief`
- `/gardening`
- `/gardening/plants`
- `/gardening/plants/new`
- `/gardening/plants/[id]`
- `/gardening/seeds`
- `/gardening/seeds/new`
- `/gardening/seeds/[id]`
- `/gardening/tasks`
- `/gardening/tasks/new`
- `/gardening/calendar`
- `/gardening/plantings`
- `/gardening/plantings/new`
- `/gardening/plantings/[id]`
- `/weather`
- `/inbox`
- `/today`

> Agent monitor pages were removed. Use CNS directly: `http://localhost:3477`

### API

#### Plants
- `GET /api/gardening/plants`
- `POST /api/gardening/plants` (auth)
- `GET /api/gardening/plants/[id]`
- `PUT /api/gardening/plants/[id]` (auth)
- `DELETE /api/gardening/plants/[id]` (auth)

#### Seeds
- `GET /api/gardening/seeds`
- `POST /api/gardening/seeds` (auth)
- `GET /api/gardening/seeds/[id]`
- `PUT /api/gardening/seeds/[id]` (auth)
- `DELETE /api/gardening/seeds/[id]` (auth)

#### Tasks
- `GET /api/gardening/tasks`
- `POST /api/gardening/tasks` (auth)
- `GET /api/gardening/tasks/[id]`
- `PUT /api/gardening/tasks/[id]` (auth)
- `DELETE /api/gardening/tasks/[id]` (auth)
- `PATCH /api/gardening/tasks/[id]/complete` (UI toggle persistence)
- `POST /api/gardening/tasks/batch-complete` (auth)

#### Plantings
- `GET /api/gardening/plantings`
- `POST /api/gardening/plantings` (auth)
- `GET /api/gardening/plantings/[id]`
- `PUT /api/gardening/plantings/[id]` (auth)
- `DELETE /api/gardening/plantings/[id]` (auth)

#### Calendar
- `GET /api/gardening/calendar?from=ISO&to=ISO&view=day|week|month`

#### Brief pipeline (file-based)
- `POST /api/brief` - store daily brief JSON into `data/briefs/YYYY-MM-DD.json`
- `GET /api/brief/today` - return today's brief (or most recent)
- `GET /api/brief/list` - list available briefs (date + title)

Auth for `POST /api/brief`:
- Preferred: set `BRIEF_API_KEY` and send either:
  - `Authorization: Bearer <BRIEF_API_KEY>`
  - `X-API-Key: <BRIEF_API_KEY>`
- Fallback (if no key configured): localhost-only host check.

Clark integration (recommended):
```bash
curl -X POST http://localhost:3456/api/brief \
  -H 'content-type: application/json' \
  -H "authorization: Bearer $BRIEF_API_KEY" \
  -d @daily-brief.json
```

#### Today
- `GET /api/today/summary` - morning command-center payload (tasks, agents, weather, Telegram draft)

## Database Seeding

`npm run db:seed` adds:
- 20 common UK vegetables
- 10 common herbs

## Scripts

- `npm run dev`
- `npm run build`
- `npm run db:push`
- `npm run db:seed`
- `npm run db:studio`

## Notes

- The UI is designed for small screens first (375px+).
- Dark mode is supported with `prefers-color-scheme`.
- Agent auth uses API keys via `Authorization: Bearer <key>` or `X-API-Key`.
