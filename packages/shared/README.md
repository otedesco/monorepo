# Shared Package

Cross-cutting utilities and types used across multiple packages.

## Overview

This package provides:
- **Type utilities** - Common TypeScript types (Result, etc.)
- **Environment helpers** - Type-safe environment variable access
- **Error classes** - AppError hierarchy for error handling
- **Shared types** - Types used across domain, API client, and UI

## Structure

```
src/
├── types.ts      # Type utilities (Result, etc.)
├── env.ts        # Environment variable helpers
├── errors.ts     # Error class hierarchy
└── index.ts      # Public exports
```

## What Belongs Here?

### ✅ DO Include

- Types used by multiple packages
- Environment variable helpers
- Error classes
- Utility functions used across layers
- Design token types (if shared)

### ❌ DON'T Include

- Domain-specific logic (goes in `@domie/domain`)
- Infrastructure code (goes in `@domie/api-client`)
- UI components (goes in `@domie/ui`)
- Business rules (goes in `@domie/domain`)

## Type Utilities

### Result Type

```typescript
import type { Result } from "@domie/shared";

type MyResult = Result<string, Error>;

// Success
const success: MyResult = { success: true, data: "value" };

// Error
const error: MyResult = { success: false, error: new Error("Failed") };
```

### Using Result

```typescript
function divide(a: number, b: number): Result<number, Error> {
  if (b === 0) {
    return { success: false, error: new Error("Division by zero") };
  }
  return { success: true, data: a / b };
}
```

## Environment Variables

### Getting Environment Variables

```typescript
import { getEnv } from "@domie/shared";

// Required variable
const apiUrl = getEnv("API_URL");

// Optional with default
const port = getEnv("PORT", { required: false, defaultValue: "3000" });

// Server-only variable
const secret = getEnv("SECRET", { source: "server" });
```

### Type-Safe Numbers

```typescript
import { getEnvNumber } from "@domie/shared";

const port = getEnvNumber("PORT", { defaultValue: 3000 });
```

## Error Classes

### AppError Hierarchy

```typescript
import { AppError, ValidationError, NotFoundError } from "@domie/shared";

// Base error
throw new AppError("Something went wrong");

// Validation error
throw new ValidationError("Invalid input");

// Not found error
throw new NotFoundError("Resource not found");
```

### Custom Errors

```typescript
import { AppError } from "@domie/shared";

export class MyCustomError extends AppError {
  constructor(message: string, public readonly code: string) {
    super(message);
    this.name = "MyCustomError";
  }
}
```

## Design Token Types

If design tokens are shared across packages:

```typescript
// src/types.ts
export type DesignToken = "brand-primary" | "surface" | "border-subtle";
```

## Usage

### In Domain

```typescript
import type { Result } from "@domie/shared";

export function myUseCase(): Result<MyEntity, Error> {
  // ...
}
```

### In API Client

```typescript
import { getEnv, AppError } from "@my-org/shared";

const url = getEnv("API_URL");
if (!url) {
  throw new AppError("API_URL is required");
}
```

### In UI

```typescript
import type { DesignToken } from "@domie/shared";

function getTokenColor(token: DesignToken): string {
  // ...
}
```

## Testing

```bash
pnpm test
```

Test utilities should be pure functions with no side effects.

## Type Checking

```bash
pnpm typecheck
```

## Linting

```bash
pnpm lint
```

## Best Practices

1. **Keep it minimal** - Only add what's truly shared
2. **No dependencies** - Avoid heavy dependencies
3. **Pure functions** - Utilities should be pure and testable
4. **Type everything** - Use TypeScript for all exports
5. **Document well** - Shared code needs clear documentation

## When to Create New Utilities

Before adding something here, ask:

1. **Is it used by 2+ packages?** If no, put it in the package that uses it
2. **Is it domain-specific?** If yes, put it in `@domie/domain`
3. **Is it infrastructure-specific?** If yes, put it in `@domie/api-client`
4. **Is it UI-specific?** If yes, put it in `@domie/ui`

If it's truly cross-cutting and used by multiple layers, then it belongs here.

