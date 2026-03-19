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

## Overnight Sprint Progress Update — 2026-03-19 03:00 (Europe/London)

### ✅ Shipped in this sprint
- Implemented a new **Daily Brief** feature as a high-utility, mobile-first command center for overnight and morning triage.
- Added new page: **`/brief`**.
- Added new API endpoint: **`GET /api/brief/daily`**.
- Added shared server utility: **`lib/brief.ts`** to aggregate notifications, garden task urgency, and agent health in one payload.
- Integrated Daily Brief into navigation and discovery points:
  - New **Brief** item in mobile nav/top nav.
  - New **Daily Brief** app card on dashboard (`/`).

### Why this was selected
- Most useful next improvement for Tim is a single screen that answers: **What needs attention first right now?**
- Tim’s setup spans Telegram + multi-agent operations + gardening tasks; this feature reduces context switching between `/`, `/agents`, and `/gardening/tasks`.
- It is especially practical for overnight/early-morning checks on phone.

### Mobile-first behavior delivered
- Priority-first layout with compact cards and clear action routing.
- Responsive KPI grid (4→2→1 columns) for small screens.
- Tap-friendly priority queue rows linking directly to action pages.
- Tight notification rows with clamped message previews.

### Daily brief logic delivered
- Summary KPIs:
  - unread notifications
  - garden tasks due today
  - overdue tasks
  - offline agents
- Priority queue auto-populates from urgency signals:
  - overdue tasks
  - offline agents
  - unread notifications
- Includes:
  - due/overdue task shortlist
  - agent watchlist (non-active agents)
  - unread notification feed

### Validation completed
- `npm run build` passed (type-check + production build successful).
- Runtime smoke checks passed on production server (`npm run start -p 3470`):
  - `/brief`
  - `/api/brief/daily`
  - dashboard links/nav to `/brief`
- Confirmed nav active states and mobile menu include the new Brief route.

### Notes
- The existing dev server on `:3456` was serving an older build; validation was therefore run against a fresh production server on `:3470` after build.
- No betting/gambling/Racer functionality added.

---

## Overnight Sprint Progress Update — 2026-03-19 05:00 (Europe/London)

### ✅ Shipped in this sprint
- Implemented a new **Quick Capture Inbox** feature for fast, natural-language task capture on mobile.
- Added new page: **`/inbox`** with phone-first capture flow and suggestion chips.
- Added new API endpoint: **`POST /api/inbox/capture`**.
- Added shared parser utility: **`lib/quickCapture.ts`** for lightweight intent + due-date + recurrence extraction.
- Added client capture component: **`components/quickcapture/QuickCaptureClient.tsx`**.
- Integrated Inbox into portal discovery:
  - New **Inbox** item in top/mobile nav.
  - New **Quick Capture Inbox** app card on dashboard (`/`).

### Why this was selected
- Tim’s primary workflow is message-first (Telegram), so converting rough text into structured actions is highest practical value.
- This removes friction from mobile use: one input box, one tap, immediate task creation.
- It complements existing Gardening + Brief + Agents surfaces without adding complexity.

### Mobile-first behavior delivered
- Full-width capture CTA with 44px+ touch target.
- Suggestion chips for one-tap quick entry.
- Compact feedback panel with parsed output (title/due/recurrence/confidence).
- Single-screen-first layout for thumb use.

### Capture logic delivered
- Classifies capture text into:
  - `garden_task` (creates `GardenTask`),
  - fallback `notification` note (creates Notification).
- Extracts common due hints:
  - today / tomorrow / next week / in N days / weekday / next weekday.
- Extracts recurrence hints:
  - daily / weekly / monthly / every Monday-style phrasing.
- Stores original raw capture and parser reasoning in task description for auditability.

### Validation completed
- `npm run build` passed (type-check + production build successful).
- Endpoint smoke tests passed:
  - `POST /api/inbox/capture` creates tasks from NL input.
  - fallback note path creates notification entries.
- Route checks passed:
  - `/inbox` renders,
  - nav includes Inbox route,
  - dashboard includes Quick Capture card.

### Notes
- Existing `:3456` instance is still serving an older build snapshot; validation was performed on a fresh local server instance after build.
- No betting/gambling/Racer functionality added.

---

## Overnight Sprint Progress Update — 2026-03-19 04:00 (Europe/London)

### ✅ Shipped in this sprint
- Implemented a new **Garden Weather** feature optimized for fast mobile decision-making.
- Added new page: **`/weather`** (mobile-first weather summary + gardening recommendation).
- Added new API endpoint: **`GET /api/weather/current`**.
- Added shared weather utility: **`lib/weather.ts`** using Open-Meteo with 15-minute revalidation.
- Integrated weather discovery into portal navigation and home dashboard:
  - New **Weather** item in top/mobile nav.
  - New **Garden Weather** app card on dashboard (`/`).

### Why this was selected
- Tim actively uses the gardening workflows and needed practical, immediate context for what outdoor work is sensible **right now**.
- Weather directly improves decisions across existing tasks/plantings without adding complexity.
- It is high-value during early-morning checks and overnight sprint output review.

### Mobile-first behavior delivered
- Compact hero card surfaces key weather at a glance (temp/feels-like/condition).
- 12-hour precipitation + wind readout tuned for quick thumb-scanning.
- Recommendation badge and summary designed for single-screen consumption on small devices.
- Navigation access works through the existing responsive menu flow.

### Weather logic delivered
- Pulls current conditions + hourly forecast from Open-Meteo.
- Computes:
  - current temperature and feels-like,
  - wind speed now,
  - total precipitation next 12 hours,
  - max wind next 12 hours.
- Produces practical recommendation tiers:
  - **good** (sowing/transplanting suitable),
  - **ok** (routine checks, avoid fragile moves),
  - **poor** (focus covered tasks).

### Validation completed
- `npm run build` passed (type-check + production build successful).
- Runtime smoke checks passed on production server (`npm run start -p 3481`):
  - `/weather`
  - `/api/weather/current`
  - dashboard includes **Garden Weather** card
  - nav includes **Weather** route + active state
- Confirmed API JSON shape and recommendation fields via `curl + jq`.

### Notes
- Browser automation remained unavailable due OpenClaw gateway/Chrome CDP failures; testing was completed via build + runtime HTTP validation.
- Existing `:3456` service was checked and confirmed reachable, but serving an older build (`/brief` and `/weather` returned 404 there).
- No betting/gambling/Racer functionality added.

---

## Overnight Sprint Progress Update — 2026-03-19 06:00 (Europe/London)

### ✅ Shipped in this sprint
- Implemented a full **Agent Monitor** surface focused on Tim’s multi-agent operations.
- Added page: **`/agents`** with live status dashboard + attention-first list.
- Added API endpoint: **`GET /api/agents/status`** for realtime health snapshots.
- Added client component: **`components/agents/AgentMonitorClient.tsx`** with auto-refresh + manual refresh.
- Integrated monitor into core navigation and dashboard:
  - New **Agents** item in top/mobile nav
  - New **Agent Monitor** app card on home screen
  - New quick action CTA from dashboard to monitor
- Upgraded home dashboard metric to surface **Agents Offline** at a glance.

### Why this was selected
- Tim runs a real multi-agent setup (`main`, `clark`, `scout`, `marketing`, `dev`, `ops`, `reviewer`, `workspace`, `terminal`) and needs immediate visibility from mobile.
- This is the highest practical overnight improvement: it cuts triage time and highlights where intervention is needed first.

### Mobile-first behavior delivered
- Status UI is card-first and readable on small screens.
- Critical/non-active agents are shown in an attention-priority list.
- Manual refresh is touch-friendly and always visible.
- Auto-refresh every 45 seconds keeps the page useful as a live monitor.

### Status logic delivered
- **Active**: last event ≤ 20 minutes
- **Idle**: 20 minutes to 3 hours
- **Offline**: > 3 hours or no recent events
- Last-seen and last-message preview are included per agent.

### Validation completed
- `npm run build` passed (type-check + production build successful).
- Runtime smoke checks passed:
  - `/agents`
  - `/api/agents/status`
  - dashboard and nav include Agents links
- Verified JSON shape and route rendering via HTTP checks.

### Notes
- Browser automation remained unavailable in this environment, so validation used build + runtime HTTP smoke tests.
- No betting/gambling/Racer functionality added.

---

## Overnight Sprint Progress Update — 2026-03-19 07:00 (Europe/London)

### ✅ Shipped in this sprint
- Implemented a new **Today command center** for Tim’s morning mobile triage.
- Added new page: **`/today`** with priority queue, one-tap actions, weather check, and Telegram-ready snapshot.
- Added new API endpoint: **`GET /api/today/summary`**.
- Added shared server utility: **`lib/today.ts`** to aggregate tasks, agent health, notifications, weather, and brief context.
- Added client component: **`components/today/TelegramDraftCard.tsx`** for one-tap copy + Telegram open flow.
- Integrated discovery into existing navigation and dashboard:
  - New **Today** route in top/mobile nav.
  - New **Today** app card on dashboard (`/`).
  - New **Open Today View** quick action on dashboard.

### Why this was selected
- Most useful next improvement for Tim was a **single phone-first screen** for immediate morning decisions.
- Tim’s workflow spans Telegram, gardening tasks, and multi-agent operations; this feature reduces context switching and speeds first-10-minute triage.

### Mobile-first behavior delivered
- Priority-first card layout with compact, thumb-friendly action rows.
- Critical indicators surfaced at top (overdue, due today, offline agents, unread alerts).
- One-tap copy for Telegram-ready morning snapshot.
- Single-column responsive actions on small screens.

### Validation completed
- `npm run build` passed (type-check + production build successful).
- Runtime checks passed on fresh production server (`npm run start -p 3490`):
  - `/today`
  - `/api/today/summary`
  - home nav/card/quick-action links route to `/today`
  - existing key routes (`/brief`, `/agents`, `/weather`, `/inbox`, `/gardening/tasks`) remain healthy
- API payload contract checks passed (counts, priorities, telegramDraft structure).

### Notes
- Browser automation tool remained unavailable due gateway timeout, so validation used build + runtime HTTP/API checks.
- No betting/gambling/Racer functionality added.

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
