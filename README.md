# Monorepo

A pnpm + Turborepo monorepo containing a Next.js web application, design system, domain layer, and Supabase backend.

## Architecture Overview

This monorepo follows **Domain-Driven Design (DDD)** principles with clear separation of concerns:

- **Apps**: Next.js applications (`apps/web`, `apps/storybook-host`)
- **Packages**: Shared libraries organized by layer:
  - `packages/domain` - Business logic, entities, use cases (framework-agnostic)
  - `packages/api-client` - Infrastructure layer (Supabase repositories, React Query functions)
  - `packages/ui` - Design system with Tailwind + CSS tokens
  - `packages/shared` - Cross-cutting utilities
  - `packages/i18n` - Internationalization (English/Spanish)
  - `packages/config-ts` - Shared TypeScript configurations
  - `packages/config-eslint` - Shared ESLint configurations
- **Supabase**: Database migrations, edge functions, and seed data

## Prerequisites

- Node.js 18+ (LTS recommended)
- pnpm 8+ (`npm install -g pnpm`)
- Docker (for local Supabase)
- Supabase CLI (`npm install -g supabase`)

## Local Development

### Quick Start

```bash
# 1. Install dependencies
pnpm install

# 2. Start Supabase (Docker must be running)
pnpm supabase:start

# 3. Set up environment variables
pnpm env:setup

# 4. Seed the database
pnpm db:seed

# 5. Start the development server
pnpm dev
```

### Step-by-Step Setup

#### 1. Install Dependencies

```bash
pnpm install
```

#### 2. Start Supabase

Make sure Docker is running, then start local Supabase services:

```bash
pnpm supabase:start
```

This command starts PostgreSQL, Auth, Storage, and other Supabase services and prints connection details (API URL, Studio URL, DB URL).

**Local Supabase URLs:**
- **Studio**: http://localhost:54323
- **API**: http://localhost:54321
- **Database**: `postgresql://postgres:postgres@localhost:54322/postgres`

#### 3. Set Up Environment Variables

Run the automated setup:

```bash
pnpm env:setup
```

This command orchestrates the complete environment setup:
1. Creates `.env` from `env.example` (fails if `.env` already exists to prevent overwrites)
2. Appends Supabase credentials from local Supabase instance to `.env`
3. Normalizes variable names (e.g., `API_URL` → `SUPABASE_URL`, `ANON_KEY` → `SUPABASE_ANON_KEY`)
4. Syncs required variables to `apps/web/.env.local` with `NEXT_PUBLIC_` prefix

**Important:** 
- Supabase must be running (`pnpm supabase:start`) before running `env:setup`
- If `.env` already exists, the script will fail to prevent accidental overwrites
- To update Supabase vars after restarting Supabase: `pnpm env:add:supabase && pnpm env:sync:next`

**Environment Files:**
- Root `.env` - Contains all environment variables (source of truth)
- `apps/web/.env.local` - Contains only Next.js public variables (`NEXT_PUBLIC_*`)

#### 4. Run Database Migrations

Migrations are automatically applied when Supabase starts. To manually apply:

```bash
npx supabase db push
```

#### 5. Seed the Database

**After schema changes (recommended):**
```bash
pnpm db:seed:full
```

This runs the complete seeding workflow:
1. Resets the database (`npx supabase db reset`) - applies all migrations from scratch
2. Syncs Snaplet Seed schema (`npx snaplet seed sync`) - updates `.snaplet/dataModel.json` to match current schema
3. Generates TypeScript types (`pnpm supabase:gen:types`) - updates Supabase types
4. Seeds the database (`tsx seed.ts`) - populates with test data

**What gets seeded:**
- 20 users with profiles
- 5 organizations (created by users 0-4)
- 20 organization memberships:
  - 5 owners (users 0-4, one per organization)
  - 5 admins (users 5-9, one per organization)
  - 10 agents (users 10-19, 2 per organization)

**Quick seed (when schema hasn't changed):**
```bash
pnpm db:seed
```

This just runs the seeding script without resetting or syncing. Use this when you only need to refresh data.

**Sync schema and types only (when schema changed but don't need reset):**
```bash
pnpm db:sync
```

This syncs Snaplet Seed schema and generates TypeScript types without resetting or seeding.

#### 6. Start Development Servers

```bash
# Start all apps (Next.js + any other configured apps)
pnpm dev

# Or start specific app
pnpm --filter web dev
```

The web app runs on http://localhost:3000.

### Creating Database Migrations

Create a new migration file:

```bash
pnpm db:migration:new -- "migration_name"
```

This creates a new migration file in `supabase/migrations/` with a timestamp prefix. Edit the generated SQL file to implement your schema changes.

### Generating TypeScript Types

Generate TypeScript types from your local Supabase schema:

```bash
pnpm supabase:gen:types
```

This generates types from your local database schema and outputs them to `packages/api-client/src/types/supabase.ts`. Run this after:
- Creating new migrations
- Changing database schema
- Setting up the project for the first time

The generated types are available throughout the monorepo via the `@domie/api-client` package.

### Serving Edge Functions

To serve Supabase Edge Functions locally:

```bash
pnpm supabase:functions:serve
```

This serves all functions in `supabase/functions/`:
- `hello_world` - Example Edge Function

Test a function with curl:

```bash
curl -i --location --request POST \
  'http://localhost:54321/functions/v1/hello_world' \
  --header 'Authorization: Bearer YOUR_ANON_KEY' \
  --header 'Content-Type: application/json' \
  --data '{"name": "Functions"}'
```

### Stopping and Restarting Supabase

```bash
# Stop Supabase services
pnpm supabase:stop

# Restart Supabase (stop then start)
pnpm supabase:stop && pnpm supabase:start

# Check status
pnpm supabase:status
```

**After restarting Supabase**, update your environment variables:
```bash
pnpm env:add:supabase && pnpm env:sync:next
```

### Database Seeding Workflow

The seeding process uses [Snaplet Seed](https://docs.snaplet.dev/seed) to populate your database with test data. We provide different commands depending on your needs:

| Command | When to Use | What it Does |
|---------|-------------|--------------|
| `pnpm db:seed:full` | **After schema changes** (recommended) | Resets DB → Syncs Snaplet schema → Generates types → Seeds data |
| `pnpm db:seed` | Schema unchanged, just need fresh data | Runs seeding script only |
| `pnpm db:sync` | Schema changed, but don't need reset | Syncs Snaplet schema → Generates types (no reset, no seed) |

**What gets seeded:**
- **20 users** with profiles (full_name, locale, timezone)
- **5 organizations** (created by users 0-4)
  - Alternating types: agency, owner, agency, owner, agency
  - Unique slugs: `org-1`, `org-2`, etc.
- **20 organization memberships**:
  - **5 owners** (users 0-4, one per organization)
  - **5 admins** (users 5-9, one per organization)
  - **10 agents** (users 10-19, 2 per organization)

**Recommended workflow after schema changes:**
```bash
# Complete workflow: reset, sync, types, seed
pnpm db:seed:full
```

**Quick data refresh:**
```bash
# Just seed (assumes schema is already synced)
pnpm db:seed
```

**Schema sync only:**
```bash
# Sync Snaplet schema and types without resetting
pnpm db:sync
```

### Resetting the Database

```bash
# Reset and reapply all migrations (manual)
npx supabase db reset

# Reset, sync, and seed (use db:seed:full instead)
pnpm db:seed:full
```

## Available Scripts

| Script | Description |
|--------|-------------|
| `pnpm dev` | Start all dev servers (via Turborepo) |
| `pnpm build` | Build all apps and packages |
| `pnpm lint` | Lint all packages |
| `pnpm test` | Run all tests |
| `pnpm typecheck` | Type check all packages |
| `pnpm db:seed` | Seed database with Snaplet (quick seed, no reset) |
| `pnpm db:seed:full` | Full seeding workflow: reset → sync → types → seed |
| `pnpm db:sync` | Sync Snaplet schema and generate types (no reset/seed) |
| `pnpm db:migration:new` | Create a new database migration file |
| `pnpm db:reset` | Reset database and reapply all migrations |
| `pnpm storybook` | Start Storybook |
| `pnpm storybook:build` | Build Storybook for deployment |

### Supabase Scripts

| Script | Description |
|--------|-------------|
| `pnpm supabase:start` | Start local Supabase services (requires Docker) |
| `pnpm supabase:stop` | Stop local Supabase services |
| `pnpm supabase:status` | Check Supabase status and connection details |
| `pnpm supabase:functions:serve` | Serve Edge Functions locally for development |
| `pnpm supabase:gen:types` | Generate TypeScript types from local Supabase schema (outputs to `packages/api-client/src/types/supabase.ts`) |
| `pnpm db:migration:new` | Create a new database migration file |

**Note:** `supabase:restart` is not available as a script. Use `supabase:stop` followed by `supabase:start`.

### Environment Setup Scripts

The environment setup system provides safe, idempotent configuration of environment variables:

| Script | Description |
|--------|-------------|
| `pnpm env:setup` | **Complete setup flow** - Orchestrates all steps in sequence |
| `pnpm env:setup:create` | Create `.env` from `env.example` (fails if `.env` exists) |
| `pnpm env:add:supabase` | Append Supabase credentials to `.env` (requires Supabase running) |
| `pnpm env:sync:next` | Sync required vars to `apps/web/.env.local` |
| `pnpm env:setup:complete` | Log completion message (used internally) |

**Environment Setup Flow:**

The `env:setup` command runs these steps:
1. `env:setup:create` - Creates `.env` from `env.example` template
2. `env:add:supabase` - Fetches and appends Supabase credentials from local instance
3. `env:sync:next` - Extracts `SUPABASE_URL` and `SUPABASE_ANON_KEY`, writes to `apps/web/.env.local` with `NEXT_PUBLIC_` prefix
4. `env:setup:complete` - Logs success message with next steps

**Individual Commands:**

You can run individual steps if needed:
- After restarting Supabase: `pnpm env:add:supabase && pnpm env:sync:next`
- To refresh Next.js vars: `pnpm env:sync:next`
- To recreate `.env`: Delete `.env` first, then `pnpm env:setup:create`

See [scripts/ENV_SETUP_README.md](./scripts/ENV_SETUP_README.md) for detailed documentation.

## Project Structure

```text
.
├── apps/
│   ├── web/                # Next.js App Router application
│   └── storybook-host/     # Storybook design system host
├── packages/
│   ├── ui/                 # Design system components
│   ├── domain/             # Domain layer (DDD)
│   ├── api-client/         # Infrastructure/repositories
│   ├── shared/             # Shared utilities
│   ├── i18n/               # Internationalization
│   ├── config-ts/          # TypeScript configs
│   └── config-eslint/      # ESLint configs
├── supabase/
│   ├── migrations/         # Database migrations
│   │   ├── create_profiles_table.sql
│   │   ├── create_organizations_table.sql
│   │   ├── create_organization_roles.sql
│   │   ├── create_organization_memberships.sql
│   │   └── update_organizations_rls_policies.sql
│   ├── functions/          # Edge functions
│   └── seed/               # Seed data (Snaplet)
│       ├── index.ts        # Main seed orchestrator
│       ├── profiles.ts     # Profile seeding
│       └── organizations.ts # Organization & membership seeding
├── scripts/                # Build and setup scripts
│   ├── env-setup.ts        # Environment setup script (TypeScript)
│   └── ENV_SETUP_README.md # Detailed environment setup documentation
├── .github/workflows/      # CI/CD workflows
├── env.example             # Environment template
└── package.json            # Root package.json with scripts
```

## Database Schema

The database includes the following main tables:

### Core Tables
- **profiles** - User profiles linked 1:1 with `auth.users`
- **organizations** - Real estate agencies or single-owner entities
  - Types: `agency` (real estate agencies/companies) or `owner` (single-owner entities)
  - Each organization has a unique slug for URL-friendly identification

### Access Control
- **organization_roles** - Static lookup table for organization-level roles
  - `admin` - Organization Admin (can manage all memberships and update organization)
  - `agent` - Agent (standard member)
  - `owner` - Owner (can update organization, same permissions as admin)
- **organization_memberships** - Links users to organizations with specific roles
  - Each user can have one role per organization
  - Admins and owners can manage memberships in their organizations
  - RLS policies enforce access control based on membership and role

### Row Level Security (RLS)

All tables have RLS enabled with policies that enforce:
- **Organizations**: Users can view organizations they are members of; admins and owners can update
- **Organization Roles**: Read-only for authenticated users (no client-side modifications)
- **Organization Memberships**: Users can view their own memberships; admins can view and manage all memberships in their organizations

## Key Conventions

### DDD Layering

- **Domain** (`packages/domain`): Pure business logic, no framework dependencies
- **API Client** (`packages/api-client`): Infrastructure concerns (Supabase, data mapping)
- **UI** (`packages/ui`): Presentation layer, design system

### Internationalization

All user-facing text must be internationalized:
- Use `useTranslations()` from `@domie/i18n`
- Add keys to both `en/common.json` and `es/common.json`
- Never hardcode user-facing strings

### Design Tokens

- Use CSS variables from `@domie/ui/styles`
- Use Tailwind classes with design tokens (e.g., `bg-surface`, `text-brand-primary`)
- Never use hardcoded colors or arbitrary values

### TypeScript & ESLint

- All packages extend from `@domie/tsconfig` and `@domie/eslint-config`
- See individual package READMEs for configuration details

## Documentation

Each directory has its own README with detailed information:

- [apps/web/README.md](./apps/web/README.md) - Next.js application
- [apps/storybook-host/README.md](./apps/storybook-host/README.md) - Storybook host
- [packages/ui/README.md](./packages/ui/README.md) - Design system
- [packages/domain/README.md](./packages/domain/README.md) - Domain layer
- [packages/api-client/README.md](./packages/api-client/README.md) - API client
- [packages/shared/README.md](./packages/shared/README.md) - Shared utilities
- [packages/i18n/README.md](./packages/i18n/README.md) - Internationalization
- [packages/config-ts/README.md](./packages/config-ts/README.md) - TypeScript configs
- [packages/config-eslint/README.md](./packages/config-eslint/README.md) - ESLint configs
- [scripts/ENV_SETUP_README.md](./scripts/ENV_SETUP_README.md) - Environment setup documentation

## CI/CD

- **CI** (`.github/workflows/ci.yml`): Runs on PRs - lint, typecheck, tests, build, migrations, seed
- **Deploy** (`.github/workflows/deploy.yml`): Runs on main - builds and deploys apps, runs migrations

See [docs/ci-database.md](./docs/ci-database.md) for database configuration details.

## Troubleshooting

### Environment Setup Issues

**".env already exists" error:**
```bash
# The script prevents accidental overwrites. Options:
# Option 1: Delete .env and run setup again
rm .env && pnpm env:setup

# Option 2: Just add Supabase vars to existing .env
pnpm env:add:supabase && pnpm env:sync:next
```

**"Supabase is not running" error:**
```bash
# Start Supabase first (wait 30-60 seconds for services to initialize)
pnpm supabase:start

# Then add Supabase credentials
pnpm env:add:supabase

# Sync to Next.js
pnpm env:sync:next
```

**"SUPABASE_URL not found in .env" error:**
```bash
# This means Supabase vars weren't added. Fix:
# 1. Make sure Supabase is running
pnpm supabase:status

# 2. Add Supabase vars
pnpm env:add:supabase

# 3. Sync to Next.js
pnpm env:sync:next
```

**Need to refresh environment variables:**
```bash
# After restarting Supabase or changing .env:
pnpm env:add:supabase && pnpm env:sync:next

# To recreate .env from scratch:
rm .env && pnpm env:setup
```

### Docker Issues

**Supabase won't start:**
- Ensure Docker Desktop is running
- Check if ports 54321-54326 are available
- Try `docker system prune` if containers are stale

### Database Issues

**Seed fails:**
- Ensure `DATABASE_URL` is set in `.env`
- Ensure migrations are applied: `npx supabase db push`
- Check foreign key constraints in seed files
- If schema changed, use `pnpm db:seed:full` instead of `pnpm db:seed`

**Snaplet schema out of sync:**
- Run `pnpm db:sync` to sync Snaplet schema with current database
- Or run `pnpm db:seed:full` for a complete reset and sync

**TypeScript types out of date:**
- Run `pnpm supabase:gen:types` to regenerate types
- Or run `pnpm db:sync` to sync schema and types together

## Contributing

1. Create a feature branch
2. Make changes following the conventions above
3. Ensure all tests pass: `pnpm test`
4. Ensure linting passes: `pnpm lint`
5. Ensure type checking passes: `pnpm typecheck`
6. Submit a PR
