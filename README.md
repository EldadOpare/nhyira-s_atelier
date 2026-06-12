# Nhyiras Creative Hub

A portfolio and creative agency platform for Nhyira — built with React, Express, Drizzle ORM, and Supabase PostgreSQL.

## Stack

- **Frontend**: React 19, Vite, TailwindCSS 4, shadcn/ui, Wouter, TanStack Query
- **API**: Express 5, pino logging, express-session
- **DB**: Drizzle ORM → PostgreSQL (Supabase)
- **Validation**: Zod v4, drizzle-zod
- **API codegen**: Orval (OpenAPI → typed React hooks + Zod schemas)
- **Monorepo**: pnpm workspaces, TypeScript 5.9

## Project Structure

```
Nhyiras-Creative-Hub/
├── artifacts/
│   ├── nhyiras-atelier/   # React/Vite frontend (deploys to Vercel)
│   └── api-server/        # Express API server
├── lib/
│   ├── db/                # Drizzle ORM schema & client
│   ├── api-spec/          # OpenAPI YAML spec
│   ├── api-client-react/  # Generated React query hooks
│   └── api-zod/           # Generated Zod request/response schemas
└── scripts/               # Utility scripts
```

## Local Development

### Prerequisites

- Node.js 20+
- pnpm 9+
- A Supabase project (or any PostgreSQL database)

### Setup

```bash
# Install dependencies
pnpm install

# Copy and fill in env vars
cp .env.example .env
# Edit .env with your DATABASE_URL, SESSION_SECRET, ADMIN_PASSWORD

# Push DB schema (dev only)
pnpm --filter @workspace/db run push

# Start the API server (port 3000)
pnpm --filter @workspace/api-server run dev

# Start the frontend (port 5173, in a separate terminal)
pnpm --filter @workspace/nhyiras-atelier run dev
```

### Environment Variables

| Variable | Required | Description |
|---|---|---|
| `DATABASE_URL` | ✅ | Supabase (or Postgres) connection string |
| `SESSION_SECRET` | ✅ | Secret for signing sessions (use a long random string) |
| `ADMIN_PASSWORD` | ✅ | Password for the admin dashboard |
| `VITE_API_URL` | Frontend only | Base URL of the API server (defaults to same origin) |

## Common Commands

```bash
pnpm run typecheck                          # Typecheck all packages
pnpm run build                              # Build all packages

pnpm --filter @workspace/db run push        # Push schema to DB (dev)
pnpm --filter @workspace/db run generate    # Generate Drizzle migration files
pnpm --filter @workspace/db run migrate     # Run migrations

pnpm --filter @workspace/api-spec run codegen  # Regenerate API hooks & Zod schemas from OpenAPI spec
```

## Deploying to Vercel

1. Connect this repo to Vercel
2. Set the environment variables in the Vercel dashboard
3. Vercel will use `vercel.json` at the root to build and route correctly

The frontend builds to `artifacts/nhyiras-atelier/dist/public` and is served as a static SPA.

## Supabase Setup

1. Create a project at [supabase.com](https://supabase.com)
2. Copy the **Connection String** (Transaction mode, port 6543) from Project Settings → Database
3. Set it as `DATABASE_URL` in your `.env`
4. Run `pnpm --filter @workspace/db run push` to create the tables

## Architecture Notes

- Admin auth uses a simple session-based password check (`ADMIN_PASSWORD`). This is intentional for simplicity — migrating to Supabase Auth is a future option.
- The OpenAPI spec (`lib/api-spec/openapi.yaml`) is the source of truth for the API contract. Run codegen after any spec changes.
- The `lib/api-client-react` and `lib/api-zod` packages are **generated** — do not edit them directly.
