# Gardening App Implementation Plan (Synapse Portal)

**Date:** 2026-03-18  
**Audience:** Synapse engineering + agent team  
**Purpose:** Define a practical, mobile-first build plan for the full Gardening app across UI, API, data model, and agent integration.

---

## TL;DR

- **Build this in 6 phases**: foundation → plant library → seeds → tasks → calendar → plantings + agent automation.
- **Adopt route-level CRUD** (`/api/gardening/<entity>` and `/api/gardening/<entity>/[id]`) with scoped API key auth.
- **Upgrade schema** for recurrence, calendar event unification, and stronger data integrity (enums + indexes + optional event table).
- **Ship mobile-first UX patterns first** (sticky filters, bottom action bars, compressed cards, progressive disclosure).
- **Create a dedicated Gardener Agent** with planning, reminders, inventory checks, and NLP→API command execution.

---

## Overnight Sprint Progress Update — 2026-03-19 01:00 (Europe/London)

### ✅ Shipped in this sprint
- Implemented a new **Agent Status Monitor** feature focused on Tim’s real multi-agent workflow.
- Added new page: **`/agents`** (mobile-first layout + auto-refresh + manual refresh).
- Added new API endpoint: **`GET /api/agents/status`**.
- Added shared server utility: **`lib/agents.ts`** for reusable status aggregation.
- Integrated Agent Monitor into dashboard:
  - New app card on home screen (`/`)
  - “Open full monitor” CTA in home agent panel
  - Top nav now includes **Agents**

### Mobile-first behavior delivered
- Stats and status cards remain readable on small screens.
- Message previews clamp to 2 lines to avoid overflow.
- Single-column hero behavior on narrow devices.
- Refresh control is touch-friendly and visible at top of page.

### Status logic
- **Active**: last event ≤ 20 minutes
- **Idle**: 20 minutes to 3 hours
- **Offline**: > 3 hours or no events
- Tracks: `main`, `clark`, `scout`, `marketing`, `dev`, `ops`, `reviewer`, `workspace`, `terminal`

### Validation completed
- `npm run build` passed (type-check + production build successful).
- Endpoint smoke test: `/api/agents/status` returns expected JSON schema.
- Seeded-data verification done to confirm active/idle/offline transitions.
- HTML response checks confirmed `/agents` route and new nav/app links render.

### Notes
- Browser automation tool was unavailable during this run (gateway timeout), so validation was performed with build + HTTP checks instead.
- No betting/gambling/Racer features were added.

---

## Overnight Sprint Progress Update — 2026-03-19 02:00 (Europe/London)

### ✅ Shipped in this sprint
- Implemented a **mobile-first responsive navigation system** across the portal.
- Added client component: **`components/MobileNav.tsx`**.
- Updated **`app/layout.tsx`** to use `Link` + `MobileNav` with route-aware active states.
- Updated **`app/globals.css`** to improve small-screen nav ergonomics:
  - compact brand sizing on mobile,
  - proper touch-friendly menu toggle,
  - full-width menu links,
  - slide-down nav panel behavior retained.

### Why this was selected
- Most useful immediate improvement for Tim was reducing friction on phone usage.
- Existing nav had mobile styles but no functional toggle wiring, so routes like `/agents` were less accessible on small screens.
- This improves access to key daily surfaces (Dashboard, Gardening, Agents) in one-thumb usage.

### Mobile-first behavior delivered
- Hamburger menu now opens/closes reliably on screens ≤768px.
- Menu closes automatically after navigation.
- Current section is highlighted (Dashboard / Gardening / Agents).
- Touch targets and spacing are preserved for quick overnight checks from mobile.

### Validation completed
- `npm run build` passed after changes.
- Route smoke tests passed on dev server (`/`, `/agents`, `/gardening`).
- Verified page HTML includes mobile menu affordance (`Open navigation menu`) and new Agent Monitor copy.

### Notes
- Browser automation remained unavailable due gateway timeout, so testing was done via Next build + HTTP smoke checks.
- No betting/gambling/Racer functionality introduced.

---

## 1) Current State Snapshot

### What already exists
- Next.js 15 App Router
- Prisma + SQLite (local)
- Core models: `GardenPlant`, `GardenPlanting`, `SeedInventory`, `GardenTask`, `TaskCompletion`
- Existing APIs: list/create + partial patch for plants, tasks, plantings
- New Synaptic design tokens (OKLCH, dark mode, typography, motion)
- Existing pages: gardening overview + basic plants list

### Gaps to close
- No full CRUD for all entities
- No `/seeds`, `/tasks`, `/calendar`, `/plantings` pages
- No detail/edit flows
- No normalized event model for robust calendar rendering
- API auth is global key only (no scoped keys / audit)
- No Gardener agent contract, memory schema, or tool protocol

---

## 2) Product Scope (Feature-by-Feature)

### A. Plant Library (`/gardening/plants`)
- Browse catalog (card/list toggle on mobile)
- Filter by `category` (vegetable/herb/flower/fruit)
- Search by name/variety/notes
- Plant detail page with sowing + harvest windows
- Edit + archive/delete plant

### B. Seed Inventory (`/gardening/seeds`)
- Track quantity, expiry, supplier, batch code
- Low-stock and near-expiry indicators
- Add/edit stock entries
- Optional stock adjustments (+/-) with reason log

### C. Task System (`/gardening/tasks`)
- Persistent completion state
- Daily/weekly tracking using `TaskCompletion`
- Recurring schedules (daily/weekly/monthly/custom)
- Filter tabs: Today / Upcoming / Completed / Overdue

### D. Calendar (`/gardening/calendar`)
- Three views: DAY / WEEK / MONTH
- Color-coded windows:
  - Sowing windows
  - Harvest windows
  - Task due dates
- Tap event → detail drawer/modal

### E. Active Plantings (`/gardening/plantings`)
- Track lifecycle status progression:
  `sown → germinated → transplanted → growing → harvested`
- Status timeline per planting
- Quick status updates from mobile card actions

### F. REST API + Agent Control
- Full CRUD for plants, seeds, tasks, plantings
- Calendar event aggregation endpoint
- Scoped API key auth for agents
- Idempotent mutation patterns for voice/NL commands

---

## 3) Recommended Information Architecture

## App Routes (App Router)

```text
app/
  gardening/
    layout.tsx
    page.tsx                         # Overview dashboard

    plants/
      page.tsx                       # List + filter + search
      new/page.tsx                   # Create plant
      [id]/page.tsx                  # Plant detail
      [id]/edit/page.tsx             # Edit plant

    seeds/
      page.tsx                       # Inventory list
      new/page.tsx                   # Add seed stock entry
      [id]/page.tsx                  # Seed item detail
      [id]/edit/page.tsx             # Edit seed item

    tasks/
      page.tsx                       # Task board (today/upcoming/completed)
      new/page.tsx                   # Create task
      [id]/page.tsx                  # Task detail/history
      [id]/edit/page.tsx             # Edit task

    calendar/
      page.tsx                       # Day/Week/Month view switcher

    plantings/
      page.tsx                       # Active + historical plantings
      new/page.tsx                   # Start new planting
      [id]/page.tsx                  # Planting timeline/detail
      [id]/edit/page.tsx             # Edit planting
```

## Shared Components (mobile-first)

```text
components/
  gardening/
    layout/
      GardeningTopNav.tsx
      GardeningBottomTabs.tsx        # mobile quick nav

    filters/
      CategoryChips.tsx
      SearchInput.tsx
      DateRangeFilter.tsx
      SegmentedControl.tsx           # day/week/month, tabs

    cards/
      PlantCard.tsx
      SeedCard.tsx
      TaskCard.tsx
      PlantingCard.tsx
      EventCard.tsx

    detail/
      PlantDetailPanel.tsx
      TaskHistoryPanel.tsx
      PlantingTimeline.tsx

    forms/
      PlantForm.tsx
      SeedInventoryForm.tsx
      TaskForm.tsx
      PlantingForm.tsx

    calendar/
      CalendarHeader.tsx
      DayView.tsx
      WeekView.tsx
      MonthView.tsx
      CalendarLegend.tsx
      CalendarEventChip.tsx

    states/
      EmptyState.tsx
      LoadingSkeleton.tsx
      ErrorState.tsx
```

## Data / Utilities

```text
lib/
  gardening/
    types.ts                         # shared TS types + enums
    constants.ts                     # category/status/colors
    date.ts                          # date-fns helpers
    recurrence.ts                    # recurrence expansion logic
    calendar.ts                      # map entities -> calendar events
    validators.ts                    # zod schemas for forms/API
    permissions.ts                   # API scope checks

  api/
    response.ts                      # consistent success/error envelope
    pagination.ts
```

---

## 4) Mobile-First UX Patterns (non-negotiable)

1. **Sticky top filters** on list pages (search + chips).
2. **Bottom action bar** for primary add actions on small screens.
3. **Card-first layouts** with progressive disclosure (tap for detail).
4. **One-thumb interactions** for checkbox/status updates.
5. **Inline optimistic updates** for check completion + status transitions.
6. **Segmented controls** for tabs and calendar mode switching.
7. **Safe touch targets** (min 44px) and high-contrast status chips.
8. **Offline-tolerant behavior** (graceful error states + retry CTA).

---

## 5) API Specification (Full CRUD)

## Authentication & Authorization

- Continue header support:
  - `Authorization: Bearer <token>`
  - `X-API-Key: <token>`
- Move from single global key to DB-backed keys (`ApiKey`) with scopes:
  - `gardening:read`
  - `gardening:write`
  - `gardening:admin`

## Response Contract

```json
{
  "ok": true,
  "data": {},
  "meta": {"requestId": "..."}
}
```

Errors:
```json
{
  "ok": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "dueDate is required",
    "details": {}
  }
}
```

## Endpoints

### Plants
- `GET /api/gardening/plants?category=&q=&page=&limit=`
- `POST /api/gardening/plants`
- `GET /api/gardening/plants/:id`
- `PATCH /api/gardening/plants/:id`
- `DELETE /api/gardening/plants/:id` *(soft-delete preferred)*

### Seed Inventory
- `GET /api/gardening/seeds?plantId=&expiringBefore=&lowStock=`
- `POST /api/gardening/seeds`
- `GET /api/gardening/seeds/:id`
- `PATCH /api/gardening/seeds/:id`
- `DELETE /api/gardening/seeds/:id`
- `POST /api/gardening/seeds/:id/adjust` *(quantity delta + reason)*

### Tasks
- `GET /api/gardening/tasks?status=&dueFrom=&dueTo=&recurring=`
- `POST /api/gardening/tasks`
- `GET /api/gardening/tasks/:id`
- `PATCH /api/gardening/tasks/:id`
- `DELETE /api/gardening/tasks/:id`
- `POST /api/gardening/tasks/:id/complete` *(idempotent, date-aware)*
- `POST /api/gardening/tasks/:id/uncomplete`
- `GET /api/gardening/tasks/:id/completions`

### Plantings
- `GET /api/gardening/plantings?status=&plantId=&active=`
- `POST /api/gardening/plantings`
- `GET /api/gardening/plantings/:id`
- `PATCH /api/gardening/plantings/:id`
- `DELETE /api/gardening/plantings/:id`
- `POST /api/gardening/plantings/:id/status` *(validate next status)*

### Calendar
- `GET /api/gardening/calendar?view=day|week|month&from=&to=`
  - returns unified `events[]` with `type` (`sowing_window|harvest_window|task_due|planting_status`) and color token

### Agent Operations
- `POST /api/gardening/agent/command`
  - accepts normalized intent payload from Gardener agent (optional but recommended)
- `GET /api/gardening/agent/context`
  - digest for agent planning (due tasks, low stock, expiring seeds)

---

## 6) Database Changes (Prisma)

## Recommended model hardening

### Add enums
- `PlantCategory` (`VEGETABLE|HERB|FLOWER|FRUIT`)
- `PlantingStatus` (`SOWN|GERMINATED|TRANSPLANTED|GROWING|HARVESTED|FAILED`)
- `RecurrenceType` (`NONE|DAILY|WEEKLY|MONTHLY|CUSTOM`)

### Update `GardenTask`
Add fields:
- `recurrenceType RecurrenceType @default(NONE)`
- `recurrenceInterval Int @default(1)`
- `recurrenceDays String?` *(JSON for weekly day indexes)*
- `startDate DateTime?`
- `endDate DateTime?`
- `isArchived Boolean @default(false)`

### Update `GardenPlant`
Add fields:
- `isArchived Boolean @default(false)`
- `sunRequirement String?` *(full sun/partial/shade)*
- `wateringFrequencyDays Int?`

### Update `SeedInventory`
Add fields:
- `minimumStock Int?`
- `isArchived Boolean @default(false)`

### Add optional event log models
- `GardenActivityLog` (entity, action, payload, actor, timestamp)
- `SeedAdjustment` (seedId, delta, reason, createdAt)

### Indexes to add
- `GardenTask(dueDate, completed)`
- `GardenPlant(category, name)`
- `GardenPlanting(status, sowDate)`
- `SeedInventory(expiryDate, quantity)`

---

## 7) Gardener Agent Specification

## Agent mission
Own planning, reminders, inventory hygiene, and operational updates for the Gardening app via natural language + voice commands.

## Required capabilities
1. **Read context**: tasks due, windows, stock risk, planting status.
2. **Interpret commands**: “Add tomato sowing task every Sunday”.
3. **Execute safely** via scoped API calls.
4. **Summarize actions** in plain language.
5. **Proactive prompts** for expiring seeds / missed tasks.

## Tooling contract
- Primary tool: Gardening REST API (authenticated with scoped key)
- Secondary: local date/time helper and recurrence parser
- Optional: notification endpoint for reminders

## Memory model
- `gardener_preferences` (zones, routine days, reminder times)
- `active_season_context` (month, climate assumptions)
- `open_followups` (decisions needed from Tim)

## Intent schema (example)
```json
{
  "intent": "create_task",
  "confidence": 0.92,
  "entities": {
    "title": "Water greenhouse tomatoes",
    "recurrence": "weekly",
    "days": [0],
    "dueTime": "09:00"
  },
  "requiresConfirmation": false
}
```

## Safety / policy
- Never delete entities without explicit confirmation.
- For low-confidence intent (<0.75), ask clarifying question.
- All writes should return user-facing confirmation with changed fields.

---

## 8) Build Options (for Calendar + Recurrence)

| Option | Benefits | Risks | Cost/Complexity | Fit |
|---|---|---|---|---|
| A. Custom calendar views (day/week/month) in React | Full design control, lightweight | More dev time for edge cases | Medium-High | **Best long-term fit** for Synaptic UX |
| B. FullCalendar integration + custom theming | Faster to ship rich interactions | Theming may feel third-party | Medium | Good fallback if timeline tight |
| C. Hybrid (Month custom, Day/Week library-backed) | Balanced speed and control | Mixed architecture complexity | Medium-High | Acceptable but less clean |

**Recommendation:** **Option A** if design quality is priority; fallback to **Option B** if delivery pressure increases.

---

## 9) Implementation Order & Dependencies

## Phase 0 — Foundations (1 day)
| Timeframe | Action | Owner | Output |
|---|---|---|---|
| Day 1 | Add Zod validators, API response helpers, scope-aware auth middleware | Dev | Shared API infra complete |
| Day 1 | Prisma migration for enums/indexes/task recurrence fields | Dev | Updated schema + migration |

## Phase 1 — Plant Library (1–2 days)
| Timeframe | Action | Owner | Output |
|---|---|---|---|
| Day 2 | Build `/plants` list with search + category chips | Dev | Mobile-first plant list |
| Day 2-3 | Build detail/new/edit pages + full CRUD endpoints | Dev | Plant management complete |

## Phase 2 — Seed Inventory (1–2 days)
| Timeframe | Action | Owner | Output |
|---|---|---|---|
| Day 3-4 | Build `/seeds` list/detail/forms | Dev | Seed inventory UI complete |
| Day 4 | Add low-stock/expiry logic + adjust endpoint | Dev | Inventory intelligence complete |

## Phase 3 — Tasks & Recurrence (2 days)
| Timeframe | Action | Owner | Output |
|---|---|---|---|
| Day 5 | Build `/tasks` board and persistent completion toggles | Dev | Task UX complete |
| Day 5-6 | Recurrence expansion + completion history API | Dev | Daily/weekly tracking stable |

## Phase 4 — Plantings & Status Flow (1 day)
| Timeframe | Action | Owner | Output |
|---|---|---|---|
| Day 6-7 | Build `/plantings` views + status transition rules | Dev | Lifecycle tracking complete |

## Phase 5 — Calendar (2 days)
| Timeframe | Action | Owner | Output |
|---|---|---|---|
| Day 7-8 | Implement day/week/month views + unified events endpoint | Dev | Calendar functional |
| Day 8-9 | Color coding, legends, event drawer interactions | Dev | Polished calendar UX |

## Phase 6 — Gardener Agent Integration (1 day)
| Timeframe | Action | Owner | Output |
|---|---|---|---|
| Day 9-10 | Implement agent context + command handlers + docs | Dev + Agent | NLP/voice control ready |

---

## 10) Risks & Mitigations

| Risk | Impact | Mitigation | Trigger |
|---|---|---|---|
| Recurrence logic edge cases (DST, monthly dates) | Incorrect task generation | Use date-fns + explicit recurrence tests + idempotent completion API | Failing date-bound tests |
| Calendar complexity expands scope | Delayed delivery | Timebox custom build; fallback to FullCalendar if >2 days overrun | Phase 5 slips by >1 day |
| Mobile UX regressions with dense data | Poor usability | Define card compression + sticky filters + touch target checks | User testing flags >3 blockers |
| Agent write safety | Accidental destructive actions | Scoped keys, confirmation rules, audit log | Ambiguous commands detected |
| SQLite performance with growth | Slow list/calendar queries | Add indexes now; plan Postgres migration path | Query p95 > 200ms locally |

---

## 11) Definition of Done (DoD)

- All six feature areas have complete mobile-first UI flows.
- CRUD endpoints exist for each entity with validation + scope checks.
- Calendar supports day/week/month with color-coded event types.
- Task completion persistence + recurrence tracking verified.
- Agent can successfully execute natural-language operations across entities.
- Tests pass for validators, recurrence logic, and status transitions.
- Dark mode and reduced-motion remain compliant with Synaptic design system.

---

## 12) Next 24 Hours (Immediate Execution)

1. Implement schema migration (enums, recurrence fields, indexes).
2. Add shared API infrastructure (`validators`, `response`, scoped auth).
3. Build full CRUD route pattern for **Plants** as reference implementation.
4. Build `Seeds` list + create flow to validate mobile patterns.

---

## Sources and confidence

- Sources: Existing codebase in `/app`, `/components`, `/lib`, `/prisma/schema.prisma`.
- Confidence: **High** for architecture and phased delivery; **Medium** for calendar implementation effort (depends on custom vs library choice).
