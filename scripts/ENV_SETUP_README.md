# Environment Setup Scripts

## Overview

The environment setup system provides a safe, idempotent way to configure local development environment variables for Supabase and Next.js.

## Scripts

### Supabase Lifecycle

- `pnpm supabase:start` - Start local Supabase instance (Docker required)
- `pnpm supabase:stop` - Stop local Supabase instance
- `pnpm supabase:status` - Check Supabase status and connection details

### Supabase Development Utilities

- `pnpm supabase:functions:serve` - Serve Edge Functions locally for development
- `pnpm supabase:gen:types` - Generate TypeScript types from local Supabase schema
  - **Output Location:** `packages/api-client/src/types/supabase.ts`
  - **Rationale:** Types are placed in `api-client` package since that's where Supabase client code lives. This keeps types close to where they're used and makes them available to other packages that import from `@domie/api-client`.

### Environment Setup

- `pnpm env:setup` - Complete setup flow (orchestrates all steps)
- `pnpm env:setup:create` - Create `.env` from `env.example` (fails if `.env` exists)
- `pnpm env:add:supabase` - Append Supabase credentials to `.env` (requires Supabase running)
- `pnpm env:sync:next` - Sync required vars to `apps/web/.env.local`
- `pnpm env:setup:complete` - Log completion message (used internally)

## Setup Flow

The `env:setup` command runs these steps in sequence:

1. **env:setup:create** - Copies `env.example` → `.env` (fails if `.env` exists to prevent overwrites)
2. **env:add:supabase** - Appends Supabase credentials using `supabase status --output env`
3. **env:sync:next** - Extracts `SUPABASE_URL` and `SUPABASE_ANON_KEY` and writes to `apps/web/.env.local` with `NEXT_PUBLIC_` prefix
4. **env:setup:complete** - Logs success message with next steps

## Environment Files

### Root `.env`
Contains all environment variables including:
- `SUPABASE_URL` - Local Supabase API URL
- `SUPABASE_ANON_KEY` - Anonymous key for client access
- `SUPABASE_SERVICE_ROLE_KEY` - Service role key (if available)
- Any custom variables from `env.example`

### `apps/web/.env.local`
Contains only Next.js public variables:
- `NEXT_PUBLIC_SUPABASE_URL` - Synced from `SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Synced from `SUPABASE_ANON_KEY`

**Why separate files?**
- Root `.env` is the source of truth for all variables
- `apps/web/.env.local` contains only what Next.js needs (public vars)
- Separation prevents accidentally exposing server-only vars to the browser
- Next.js automatically loads `.env.local` (git-ignored)

## Usage

### First-Time Setup

```bash
# 1. Install dependencies
pnpm install

# 2. Start Supabase (requires Docker)
pnpm supabase:start

# 3. Setup environment variables
pnpm env:setup

# 4. Start development server
pnpm dev
```

### Updating Environment Variables

**After changing `.env`:**
```bash
pnpm env:sync:next  # Refresh apps/web/.env.local
```

**After restarting Supabase:**
```bash
pnpm env:add:supabase  # Append new Supabase credentials
pnpm env:sync:next     # Sync to Next.js
```

## Error Handling

All scripts provide explicit error messages:

- **`.env` exists:** Prevents accidental overwrites, suggests manual deletion
- **Supabase not running:** Clear instructions to start Supabase first
- **Missing variables:** Explains which variable is missing and how to fix
- **Missing directories:** Validates required paths exist before proceeding

## Safety Features

1. **No Silent Overwrites:** `env:setup:create` fails if `.env` exists
2. **Explicit Errors:** All failures include actionable error messages
3. **Validation:** Checks Supabase is running before fetching credentials
4. **Idempotent:** Can run `env:add:supabase` and `env:sync:next` multiple times safely

## Implementation Details

### Script Location
- **File:** `scripts/env-setup.ts`
- **Runtime:** TypeScript via `ts-node` (already in devDependencies)
- **Why TypeScript?** Type safety, better error handling, consistent with codebase

### Variable Parsing
- Handles quoted and unquoted values
- Skips comments and empty lines
- Extracts only required variables (`SUPABASE_URL`, `SUPABASE_ANON_KEY`)

### Path Handling
- Uses Node.js `path.join()` for cross-platform compatibility
- Resolves paths relative to script location (`__dirname`)

## CI/CD Compatibility

These scripts are designed for local development only. CI workflows should:
- Use environment variables from GitHub Secrets
- Not run `env:setup` (assumes `.env` doesn't exist in CI)
- Use `DATABASE_URL` directly for database operations

The scripts check for Supabase running, which won't be available in CI unless explicitly configured.
