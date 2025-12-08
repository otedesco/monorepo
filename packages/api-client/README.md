# API Client Package

Infrastructure layer that implements domain repositories and provides client functions for React Query.

## Overview

This package:
- **Implements repository interfaces** from `@domie/domain`
- **Maps between database and domain** - Converts Supabase rows to domain entities
- **Exposes client functions** - Functions that can be used in React Query hooks
- **Manages query keys** - Centralized, type-safe query key factory

## Structure

```
src/
├── expenses/
│   ├── SupabaseExpenseRepository.ts  # Repository implementation
│   └── ExpenseMapper.ts              # DB ↔ Domain mapping
├── queryKeys.ts                      # React Query key factory
├── expenses.ts                       # Client functions
├── supabaseClient.ts                 # Supabase client factory
└── index.ts                          # Public exports
```

## Creating a New Repository

### 1. Implement Repository Interface

```typescript
// src/my-feature/SupabaseMyEntityRepository.ts
import type { SupabaseClient } from "@supabase/supabase-js";
import type { MyEntity, MyEntityRepository } from "@domie/domain";
import { mapRowToEntity, mapEntityToRow } from "./MyEntityMapper";

export class SupabaseMyEntityRepository implements MyEntityRepository {
  constructor(private supabase: SupabaseClient) {}

  async create(entity: MyEntity): Promise<MyEntity> {
    const row = mapEntityToRow(entity);
    const { data, error } = await this.supabase
      .from("my_entities")
      .insert(row)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create entity: ${error.message}`);
    }

    return mapRowToEntity(data);
  }

  async findById(id: string): Promise<MyEntity | null> {
    const { data, error } = await this.supabase
      .from("my_entities")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      if (error.code === "PGRST116") return null; // Not found
      throw new Error(`Failed to find entity: ${error.message}`);
    }

    return mapRowToEntity(data);
  }

  // ... other methods
}
```

### 2. Create Mapper

```typescript
// src/my-feature/MyEntityMapper.ts
import type { MyEntity } from "@domie/domain";

export interface MyEntityRow {
  id: string;
  name: string;
  created_at: string;
  // ... database columns
}

export function mapRowToEntity(row: MyEntityRow): MyEntity {
  return MyEntity.create({
    id: row.id,
    name: row.name,
    // Map database fields to domain
  });
}

export function mapEntityToRow(entity: MyEntity): Omit<MyEntityRow, "created_at"> {
  return {
    id: entity.id,
    name: entity.name,
    // Map domain to database fields
  };
}
```

### 3. Export

```typescript
// src/index.ts
export * from "./my-feature/SupabaseMyEntityRepository";
export * from "./my-feature/MyEntityMapper";
```

## Creating Client Functions

### 1. Add Query Keys

```typescript
// src/queryKeys.ts
export const queryKeys = {
  // ... existing keys
  myFeature: {
    all: ["myFeature"] as const,
    lists: () => [...queryKeys.myFeature.all, "list"] as const,
    list: (filters?: { tenantId?: string }) =>
      [...queryKeys.myFeature.lists(), filters] as const,
    details: () => [...queryKeys.myFeature.all, "detail"] as const,
    detail: (id: string) => [...queryKeys.myFeature.details(), id] as const,
  },
};
```

### 2. Create Client Functions

```typescript
// src/my-feature.ts
import type { MyEntity } from "@domie/domain";
import { createSupabaseClientFromEnv } from "./supabaseClient";
import { SupabaseMyEntityRepository } from "./my-feature/SupabaseMyEntityRepository";
import { listMyEntities } from "@domain/my-feature/usecases/ListMyEntities";

export interface FetchMyEntitiesParams {
  tenantId?: string;
}

export async function fetchMyEntities(params: FetchMyEntitiesParams): Promise<MyEntity[]> {
  const supabase = createSupabaseClientFromEnv();
  const repository = new SupabaseMyEntityRepository(supabase);

  return listMyEntities(params, {
    repository,
  });
}

export interface CreateMyEntityInput {
  name: string;
  tenantId: string;
}

export async function createMyEntity(input: CreateMyEntityInput): Promise<MyEntity> {
  const supabase = createSupabaseClientFromEnv();
  const repository = new SupabaseMyEntityRepository(supabase);

  const result = await createMyEntityUseCase(
    { name: input.name },
    {
      repository,
      generateId: () => crypto.randomUUID(),
    }
  );

  if (!result.success) {
    throw new Error(result.error);
  }

  return result.entity;
}
```

### 3. Export

```typescript
// src/index.ts
export * from "./my-feature";
```

## Using in React Query Hooks

See [apps/web/README.md](../../apps/web/README.md) for creating hooks, but the pattern is:

```typescript
// In apps/web
import { useQuery } from "@tanstack/react-query";
import { fetchMyEntities, queryKeys } from "@api-client";

export function useMyEntitiesQuery(tenantId?: string) {
  return useQuery({
    queryKey: queryKeys.myFeature.list({ tenantId }),
    queryFn: () => fetchMyEntities({ tenantId }),
  });
}
```

## Supabase Client

### Creating Clients

```typescript
import { createSupabaseClientFromEnv } from "@api-client";

// Automatically reads from environment:
// NEXT_PUBLIC_SUPABASE_URL or SUPABASE_URL
// NEXT_PUBLIC_SUPABASE_ANON_KEY or SUPABASE_ANON_KEY
const supabase = createSupabaseClientFromEnv();
```

### Custom Configuration

```typescript
import { createSupabaseClientWithConfig } from "@api-client";

const supabase = createSupabaseClientWithConfig({
  url: "https://...",
  anonKey: "...",
  options: {
    auth: {
      persistSession: true,
    },
  },
});
```

## Query Keys

### Structure

Query keys follow a hierarchical structure:

```typescript
queryKeys.expenses.all              // ["expenses"]
queryKeys.expenses.lists()          // ["expenses", "list"]
queryKeys.expenses.list({ ... })    // ["expenses", "list", { ... }]
queryKeys.expenses.details()        // ["expenses", "detail"]
queryKeys.expenses.detail("123")    // ["expenses", "detail", "123"]
```

### Benefits

- **Type-safe** - TypeScript knows all available keys
- **Centralized** - Single source of truth
- **Cacheable** - React Query can efficiently cache and invalidate

### Invalidating Queries

```typescript
import { useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@api-client";

const queryClient = useQueryClient();

// Invalidate all expense lists
queryClient.invalidateQueries({ queryKey: queryKeys.expenses.lists() });

// Invalidate specific expense
queryClient.invalidateQueries({ queryKey: queryKeys.expenses.detail("123") });
```

## Testing

### Unit Tests

Test repository implementations and mappers:

```typescript
import { SupabaseMyEntityRepository } from "./SupabaseMyEntityRepository";
import { createMockSupabaseClient } from "./test-utils";

test("creates entity", async () => {
  const mockSupabase = createMockSupabaseClient();
  const repository = new SupabaseMyEntityRepository(mockSupabase);

  const entity = await repository.create(/* ... */);
  expect(entity).toBeDefined();
});
```

### Integration Tests

Test with real Supabase (local or test instance):

```typescript
import { createSupabaseClientFromEnv } from "./supabaseClient";

test("fetches entities from database", async () => {
  const supabase = createSupabaseClientFromEnv();
  const repository = new SupabaseMyEntityRepository(supabase);

  const entities = await repository.list();
  expect(entities).toBeInstanceOf(Array);
});
```

## Type Checking

```bash
pnpm typecheck
```

## Best Practices

1. **Use domain use cases** - Don't bypass domain logic
2. **Map properly** - Keep database and domain separate
3. **Handle errors** - Convert Supabase errors to domain errors
4. **Type everything** - Use TypeScript for database rows and domain entities
5. **Test mappers** - Ensure correct mapping in both directions

## Error Handling

Convert Supabase errors to meaningful domain errors:

```typescript
if (error) {
  if (error.code === "PGRST116") {
    return null; // Not found
  }
  if (error.code === "23505") {
    throw new Error("Entity already exists");
  }
  throw new Error(`Database error: ${error.message}`);
}
```

