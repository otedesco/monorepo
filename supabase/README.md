# Supabase Project

Local Supabase configuration for this turborepo. The setup mirrors the defaults in `README.md` so contributors can run the backend with Docker and the Supabase CLI.

## Prerequisites
- Docker running locally (Supabase services run in containers)
- Supabase CLI installed (`npm install -g supabase` or use the dev dependency via `pnpm supabase:start`)

## Quickstart
```bash
# Install dependencies
pnpm install

# Start Supabase services (Postgres, Auth, Storage, Studio)
pnpm supabase:start

# Generate local environment files (.env and apps/web/.env.local)
pnpm env:setup
```

After `pnpm supabase:start`, Supabase Studio is available at http://localhost:54323 and the API at http://localhost:54321.

## Configuration
- **Config file:** `supabase/config.toml`
- **Ports:** API `54321`, DB `54322`, Studio `54323`, Inbucket `54324`
- **Local URL:** `http://localhost:54321`

Environment variables in `env.example` are aligned with these defaults and are copied into `.env` by `pnpm env:setup`.

## Project Layout
```
supabase/
├── config.toml          # Supabase CLI configuration
├── migrations/          # Database migrations (add new migrations here)
├── functions/           # Edge functions
└── seed/                # Seed data (Snaplet or SQL)
```

Add SQL migrations under `supabase/migrations` and seeds under `supabase/seed`. Both directories currently contain placeholder files to keep them in version control.
