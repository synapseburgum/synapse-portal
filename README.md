# Synapse Portal

Personal dashboard and app hub. Mobile-first, Bootstrap UI, PostgreSQL backend.

## Tech Stack

- **Framework:** Next.js 15 (App Router)
- **Database:** PostgreSQL + Prisma ORM
- **UI:** Bootstrap 5 (mobile-first)
- **API:** REST with API key auth for agent access

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL

### Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Set up PostgreSQL database:
   ```bash
   sudo -u postgres psql -c "CREATE USER synapse WITH PASSWORD 'synapse123';"
   sudo -u postgres psql -c "CREATE DATABASE synapse_portal OWNER synapse;"
   sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE synapse_portal TO synapse;"
   ```

3. Run Prisma migrations:
   ```bash
   npm run db:push
   ```

4. Start development server:
   ```bash
   npm run dev
   ```

5. Open http://localhost:3000

## Project Structure

```
synapse-portal/
├── app/
│   ├── page.tsx              # Landing page
│   ├── gardening/            # Gardening app
│   │   └── page.tsx
│   └── api/                  # REST API routes
│       ├── stats/
│       ├── notifications/
│       └── gardening/
│           ├── plants/
│           ├── tasks/
│           └── plantings/
├── lib/
│   ├── db.ts                 # Prisma client
│   └── auth.ts               # API key validation
├── prisma/
│   └── schema.prisma         # Database schema
└── public/
```

## API Usage

### Authentication

Agent access requires API key via:
- `Authorization: Bearer <API_KEY>` header, or
- `X-API-Key: <API_KEY>` header

Default key (change in production): `synapse-internal-key-change-in-production`

### Endpoints

#### Stats
- `GET /api/stats` - Get daily stats
- `POST /api/stats` - Create/update stat (auth required)

#### Notifications
- `GET /api/notifications` - List notifications
- `POST /api/notifications` - Create notification (auth required)
- `PATCH /api/notifications` - Mark as read (auth required)

#### Gardening
- `GET /api/gardening/plants` - List plants
- `POST /api/gardening/plants` - Create plant (auth required)
- `GET /api/gardening/tasks` - List tasks
- `POST /api/gardening/tasks` - Create task (auth required)
- `PATCH /api/gardening/tasks` - Complete task (auth required)
- `GET /api/gardening/plantings` - List plantings
- `POST /api/gardening/plantings` - Create planting (auth required)
- `PATCH /api/gardening/plantings` - Update planting (auth required)

## Future Plans

- [ ] MCP server for agent integration
- [ ] Calendar view for gardening
- [ ] Analytics dashboard
- [ ] Agent activity monitor
- [ ] Public hosting at synapse.co.uk

## License

MIT
