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

This command:
1. Creates/overwrites `.env` from `env.example` (safe to run multiple times)
2. Appends Supabase CLI credentials to `.env` (if Supabase is running)
3. Normalizes key names (e.g., `API_URL` → `SUPABASE_URL`)
4. Syncs `NEXT_PUBLIC_*` variables to `apps/web/.env.local`

**Note:** You can run `pnpm env:setup` multiple times to refresh your environment variables, especially after starting Supabase.

#### 4. Run Database Migrations

Migrations are automatically applied when Supabase starts. To manually apply:

```bash
npx supabase db push
```

#### 5. Seed the Database

```bash
pnpm db:seed
```

This uses [Snaplet](https://docs.snaplet.dev/seed) to populate the database with test data.

#### 6. Start Development Servers

```bash
# Start all apps (Next.js + any other configured apps)
pnpm dev

# Or start specific app
pnpm --filter web dev
```

The web app runs on http://localhost:3000.

### Serving Edge Functions

To serve Supabase Edge Functions locally:

```bash
pnpm supabase:functions:serve
```

This serves all functions in `supabase/functions/`:
- `submit-expense` - Submit expense endpoint

Test a function with curl:

```bash
curl -i --location --request POST \
  'http://localhost:54321/functions/v1/submit-expense' \
  --header 'Authorization: Bearer YOUR_ANON_KEY' \
  --header 'Content-Type: application/json' \
  --data '{"amount": 100, "description": "Test"}'
```

### Stopping and Restarting Supabase

```bash
# Stop Supabase services
pnpm supabase:stop

# Restart Supabase
pnpm supabase:restart

# Check status
pnpm supabase:status
```

### Resetting the Database

```bash
# Reset and reapply all migrations
npx supabase db reset

# Reset and reseed
npx supabase db reset && pnpm db:seed
```

## Available Scripts

| Script | Description |
|--------|-------------|
| `pnpm dev` | Start all dev servers (via Turborepo) |
| `pnpm build` | Build all apps and packages |
| `pnpm lint` | Lint all packages |
| `pnpm test` | Run all tests |
| `pnpm typecheck` | Type check all packages |
| `pnpm db:seed` | Seed database with Snaplet |
| `pnpm storybook` | Start Storybook |
| `pnpm storybook:build` | Build Storybook for deployment |

### Supabase Scripts

| Script | Description |
|--------|-------------|
| `pnpm supabase:start` | Start local Supabase services |
| `pnpm supabase:stop` | Stop local Supabase services |
| `pnpm supabase:restart` | Restart Supabase services |
| `pnpm supabase:status` | Check Supabase status |
| `pnpm supabase:functions:serve` | Serve Edge Functions locally |

### Environment Scripts

| Script | Description |
|--------|-------------|
| `pnpm env:setup` | Full environment setup (creates/updates .env, adds Supabase credentials, syncs to web app) |

## Project Structure

```
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
│   ├── functions/          # Edge functions
│   └── seed/               # Seed data (Snaplet)
├── scripts/                # Build and setup scripts
│   └── env-setup.ts        # Environment setup helper
├── .github/workflows/      # CI/CD workflows
├── env.example             # Environment template
└── package.json            # Root package.json with scripts
```

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
- [supabase/README.md](./supabase/README.md) - Database & backend

## CI/CD

- **CI** (`.github/workflows/ci.yml`): Runs on PRs - lint, typecheck, tests, build, migrations, seed
- **Deploy** (`.github/workflows/deploy.yml`): Runs on main - builds and deploys apps, runs migrations

See [docs/ci-database.md](./docs/ci-database.md) for database configuration details.

## Troubleshooting

### Environment Setup Issues

**"Supabase not running" error:**
```bash
# Start Supabase first
pnpm supabase:start

# Then retry env setup
pnpm env:add-supabase
```

**Need to refresh environment variables:**
```bash
# Just run env:setup again - it will recreate .env from env.example
pnpm env:setup
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

## Contributing

1. Create a feature branch
2. Make changes following the conventions above
3. Ensure all tests pass: `pnpm test`
4. Ensure linting passes: `pnpm lint`
5. Ensure type checking passes: `pnpm typecheck`
6. Submit a PR
