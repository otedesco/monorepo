# Web App

Next.js 14+ App Router application with React Query, i18n, and Supabase integration.

## Overview

This is the main web application built with:
- **Next.js App Router** - Server and client components
- **TanStack React Query** - Server state management
- **next-intl** - Internationalization (English/Spanish)
- **Supabase** - Backend via `@domie/api-client`
- **Design System** - Components from `@domie/ui`

## Structure

```
src/
├── app/
│   ├── [locale]/          # Locale-aware routes (en, es)
│   │   ├── layout.tsx     # Locale layout with i18n provider
│   │   ├── page.tsx       # Home page
│   │   └── expenses/      # Feature routes
│   ├── layout.tsx         # Root layout (redirects to locale)
│   ├── page.tsx           # Root page (redirects to locale)
│   ├── providers.tsx      # React Query provider
│   └── globals.css        # Global styles
├── features/              # Feature modules
│   └── expenses/
│       └── hooks/         # React Query hooks
├── i18n/
│   └── request.ts         # next-intl configuration
└── middleware.ts          # Locale routing middleware
```

## Getting Started

### Prerequisites

Before starting the web app, ensure you have:

1. **Root dependencies installed**: `pnpm install` (from repo root)
2. **Supabase running**: `pnpm supabase:start` (from repo root)
3. **Environment variables set up**: `pnpm env:setup` (from repo root)

### Development

```bash
# From repo root (recommended)
pnpm dev

# Or directly from this directory
pnpm --filter web dev
```

The app runs on http://localhost:3000 and automatically redirects to `/en` (default locale).

### Environment Variables

This app requires the following environment variables in `.env.local`:

| Variable | Description | Required |
|----------|-------------|----------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL | Yes |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous key | Yes |

#### Automatic Setup (Recommended)

Environment variables are automatically synced from the root `.env` file when you run:

```bash
# From repo root
pnpm env:setup
```

This creates/updates `apps/web/.env.local` with the necessary `NEXT_PUBLIC_*` variables.

#### Manual Setup

If you prefer manual setup:

1. Copy the example:
   ```bash
   cp .env.example .env.local
   ```

2. Fill in the values from your Supabase project or from the root `.env`:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   ```

#### Environment File Priority

Next.js loads environment files in this order:
1. `.env.local` (highest priority, git-ignored)
2. `.env.development.local`
3. `.env.development`
4. `.env` (lowest priority)

For local development, `.env.local` is recommended and is automatically created by `pnpm env:setup`.

## Supabase Integration

### How It Works

The web app connects to Supabase through the `@domie/api-client` package:

```
apps/web → @domie/api-client → Supabase
              ↓
        @domie/domain (business logic)
```

1. **UI Layer** (`apps/web`): React components use React Query hooks
2. **API Client** (`packages/api-client`): Provides React Query functions and Supabase client
3. **Domain** (`packages/domain`): Pure business logic, entities, use cases

### Example: Fetching Expenses

```typescript
// src/features/expenses/hooks/useExpensesQuery.ts
import { useQuery } from "@tanstack/react-query";
import { fetchExpenses, queryKeys } from "@api-client";

export function useExpensesQuery(tenantId: string) {
  return useQuery({
    queryKey: queryKeys.expenses.list({ tenantId }),
    queryFn: () => fetchExpenses(tenantId),
  });
}
```

### Supabase Client

The Supabase client is created in `@domie/api-client` and reads environment variables:

```typescript
import { createClient } from "@supabase/supabase-js";

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);
```

## Adding a New Feature

Follow the DDD approach when adding new features.

### 1. Create Feature Module

```bash
mkdir -p src/features/my-feature/hooks
```

### 2. Add Domain Logic (if needed)

See [packages/domain/README.md](../../packages/domain/README.md) for creating entities and use cases.

### 3. Add API Client Functions

See [packages/api-client/README.md](../../packages/api-client/README.md) for creating client functions.

### 4. Create React Query Hooks

```typescript
// src/features/my-feature/hooks/useMyFeatureQuery.ts
import { useQuery } from "@tanstack/react-query";
import { fetchMyFeature, queryKeys } from "@api-client";

export function useMyFeatureQuery(id: string) {
  return useQuery({
    queryKey: queryKeys.myFeature.detail(id),
    queryFn: () => fetchMyFeature(id),
  });
}
```

### 5. Create Page with i18n

```typescript
// src/app/[locale]/my-feature/page.tsx
"use client";

import { useTranslations } from "@i18n";
import { useMyFeatureQuery } from "../../../features/my-feature/hooks/useMyFeatureQuery";

export default function MyFeaturePage() {
  const t = useTranslations("common");
  const { data, isLoading } = useMyFeatureQuery("123");

  if (isLoading) return <p>{t("myFeature.loading")}</p>;

  return <div>{/* Your UI */}</div>;
}
```

### 6. Add Translations

Add keys to both locale files:
- `packages/i18n/src/locales/en/common.json`
- `packages/i18n/src/locales/es/common.json`

```json
{
  "myFeature": {
    "title": "My Feature",
    "loading": "Loading...",
    "error": "Error loading feature"
  }
}
```

## Package Dependencies

This app depends on these workspace packages:

| Package | Purpose |
|---------|---------|
| `@domie/ui` | Design system components, styles, tokens |
| `@domie/i18n` | Internationalization, translations |
| `@domie/api-client` | Supabase client, React Query functions |
| `@domie/domain` | Business logic, entities (via api-client) |
| `@domie/tsconfig` | TypeScript configuration |

### Importing from Packages

```typescript
// UI components
import { Button } from "@domie/ui";
import "@domie/ui/styles"; // In globals.css

// Translations
import { useTranslations, useLocale } from "@domie/i18n";

// API client (via feature hooks)
import { queryKeys } from "@api-client";
```

## Testing

### Unit Tests

```bash
# Run all tests
pnpm test

# Run with UI
pnpm test:ui

# Run specific test
pnpm test src/__tests__/home.test.tsx
```

Tests use Vitest + React Testing Library. Example:

```typescript
// src/__tests__/my-feature.test.tsx
import { render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import MyFeaturePage from "../app/[locale]/my-feature/page";

test("renders feature", () => {
  const queryClient = new QueryClient();
  render(
    <QueryClientProvider client={queryClient}>
      <MyFeaturePage />
    </QueryClientProvider>
  );
  // assertions
});
```

### Type Checking

```bash
pnpm typecheck
```

### Linting

```bash
pnpm lint
```

## Routing

### Locale Routes

All routes are under `[locale]`:
- `/en` - English
- `/es` - Spanish
- `/en/expenses` - Expenses page (English)
- `/es/expenses` - Expenses page (Spanish)

### Server vs Client Components

- **Server Components** (default): Use for data fetching, SEO, performance
- **Client Components** (`"use client"`): Use for interactivity, hooks, browser APIs

## React Query Integration

### Query Client Setup

The `QueryClient` is configured in `src/app/providers.tsx` and wrapped around the app in the locale layout.

### Query Keys

Use centralized query keys from `@api-client/queryKeys`:

```typescript
import { queryKeys } from "@api-client";

// List query
queryKeys.expenses.list({ tenantId: "123" })

// Detail query
queryKeys.expenses.detail("expense-id")
```

### Mutations

Mutations automatically invalidate related queries:

```typescript
const mutation = useCreateExpenseMutation();
mutation.mutate({ /* data */ });
// Automatically invalidates expenses.list queries
```

## Internationalization

### Using Translations

```typescript
import { useTranslations } from "@i18n";

const t = useTranslations("common");
const title = t("expenses.title");
```

### Formatting

Use locale-aware formatting:

```typescript
import { useLocale } from "@i18n";

const locale = useLocale();
const formatted = new Intl.NumberFormat(locale, {
  style: "currency",
  currency: "USD",
}).format(amount);
```

## Styling

### Design Tokens

Use tokens from `@domie/ui`:

```tsx
<div className="bg-surface text-surface-foreground border border-border-subtle">
  <Button variant="default">Action</Button>
</div>
```

### Import Styles

```typescript
import "@domie/ui/styles"; // In globals.css or layout
```

## Deployment

### Build

```bash
pnpm build
```

### Environment Variables

Set in your hosting platform:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `DATABASE_URL` (if needed for server-side operations)

### Deployment Platforms

The app can be deployed to:
- Vercel (recommended for Next.js)
- Railway
- Fly.io
- Any Node.js hosting platform

See `.github/workflows/deploy.yml` for CI/CD configuration.

## Troubleshooting

### "NEXT_PUBLIC_SUPABASE_URL is not defined"

Ensure environment variables are set:
```bash
# From repo root
pnpm env:setup
```

### API calls fail with 401/403

- Check that Supabase is running: `pnpm supabase:status`
- Verify the anon key is correct in `.env.local`
- Check RLS policies in Supabase Studio

### Styles not loading

Ensure you've imported the design system styles:
```css
/* In globals.css */
@import "@domie/ui/styles";
```
