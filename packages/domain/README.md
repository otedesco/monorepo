# Domain Package

Pure business logic layer following Domain-Driven Design (DDD) principles.

## Overview

This package contains:
- **Entities** - Core business objects with behavior
- **Value Objects** - Immutable objects representing domain concepts
- **Use Cases** - Business operations orchestrated by entities
- **Repository Interfaces** - Abstractions for data persistence

**Key principle**: This package has **zero framework dependencies**. No React, no Supabase, no Next.js. Pure TypeScript.

## Structure

```
src/
├── expenses/
│   ├── entities/
│   │   └── Expense.ts          # Expense entity
│   ├── valueObjects/
│   │   └── Money.ts            # Money value object
│   ├── enums/
│   │   └── ExpenseStatus.ts    # Status enum
│   ├── repositories/
│   │   └── ExpenseRepository.ts # Repository interface
│   └── usecases/
│       ├── ListExpenses.ts     # List expenses use case
│       └── SubmitExpense.ts    # Submit expense use case
├── tenants/
│   └── entities/
│       └── Tenant.ts           # Tenant entity (stub)
└── properties/
    └── entities/
        └── Property.ts         # Property entity (stub)
```

## Creating a New Entity

### 1. Define Entity Class

```typescript
// src/my-feature/entities/MyEntity.ts
export interface MyEntityProps {
  id: string;
  name: string;
  // ... other properties
}

export class MyEntity {
  private constructor(private readonly props: MyEntityProps) {}

  static create(props: MyEntityProps): MyEntity {
    // Validation
    if (!props.id) {
      throw new Error("ID is required");
    }
    if (!props.name) {
      throw new Error("Name is required");
    }

    return new MyEntity(props);
  }

  // Getters
  get id(): string {
    return this.props.id;
  }

  get name(): string {
    return this.props.name;
  }

  // Business logic methods
  updateName(newName: string): MyEntity {
    if (!newName) {
      throw new Error("Name cannot be empty");
    }
    return new MyEntity({ ...this.props, name: newName });
  }
}
```

### 2. Export from Index

```typescript
// src/index.ts
export * from "./my-feature/entities/MyEntity";
```

## Creating a Value Object

```typescript
// src/my-feature/valueObjects/Email.ts
export class Email {
  private constructor(private readonly value: string) {}

  static create(value: string): Email {
    // Validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) {
      throw new Error("Invalid email address");
    }
    return new Email(value);
  }

  toString(): string {
    return this.value;
  }

  equals(other: Email): boolean {
    return this.value === other.value;
  }
}
```

## Creating a Use Case

```typescript
// src/my-feature/usecases/CreateMyEntity.ts
import type { MyEntity } from "../entities/MyEntity";
import type { MyEntityRepository } from "../repositories/MyEntityRepository";

export interface CreateMyEntityInput {
  name: string;
}

export interface CreateMyEntityDependencies {
  repository: MyEntityRepository;
  generateId: () => string;
}

export async function createMyEntity(
  input: CreateMyEntityInput,
  deps: CreateMyEntityDependencies
): Promise<MyEntity> {
  // Validation
  if (!input.name) {
    throw new Error("Name is required");
  }

  // Create entity
  const entity = MyEntity.create({
    id: deps.generateId(),
    name: input.name,
  });

  // Persist via repository
  return deps.repository.create(entity);
}
```

## Creating a Repository Interface

```typescript
// src/my-feature/repositories/MyEntityRepository.ts
import type { MyEntity } from "../entities/MyEntity";

export interface MyEntityRepository {
  create(entity: MyEntity): Promise<MyEntity>;
  findById(id: string): Promise<MyEntity | null>;
  list(): Promise<MyEntity[]>;
  update(entity: MyEntity): Promise<MyEntity>;
  delete(id: string): Promise<void>;
}
```

## Rules & Guidelines

### ✅ DO

- Keep entities focused on business logic
- Use value objects for domain concepts (Money, Email, etc.)
- Validate business rules in entities
- Keep use cases pure and testable
- Use repository interfaces (not implementations)

### ❌ DON'T

- Import React, Next.js, or any framework
- Import Supabase or database clients
- Import UI components
- Add HTTP-specific concerns
- Add infrastructure concerns

### Example: Good vs Bad

```typescript
// ✅ Good - Pure domain logic
export class Expense {
  approve(approvedAt: Date): Expense {
    if (this.status !== "submitted") {
      throw new Error("Only submitted expenses can be approved");
    }
    return new Expense({ ...this.props, status: "approved", approvedAt });
  }
}

// ❌ Bad - Infrastructure concern
export class Expense {
  async saveToDatabase(): Promise<void> {
    // Don't do this - use repository instead
  }
}
```

## Testing

### Unit Tests

```bash
pnpm test
```

Example test:

```typescript
import { Expense } from "./entities/Expense";
import { Money } from "./valueObjects/Money";

test("creates expense with valid data", () => {
  const expense = Expense.create({
    id: "123",
    tenantId: "tenant-1",
    propertyId: "prop-1",
    amount: Money.create(100, "USD"),
    status: "submitted",
    category: "maintenance",
    submittedAt: new Date(),
  });

  expect(expense.id).toBe("123");
});

test("throws error for invalid data", () => {
  expect(() => {
    Expense.create({
      id: "",
      // ... invalid data
    });
  }).toThrow("Expense ID is required");
});
```

## Type Checking

```bash
pnpm typecheck
```

## Linting

```bash
pnpm lint
```

Uses `@domie/eslint-config` with stricter rules for domain layer.

## Integration with Other Layers

### API Client

The `@domie/api-client` package implements repository interfaces:

```typescript
// In api-client
import type { ExpenseRepository } from "@domie/domain";
import { SupabaseExpenseRepository } from "./SupabaseExpenseRepository";

// SupabaseExpenseRepository implements ExpenseRepository
```

### Use Cases

Use cases are called from the API client:

```typescript
// In api-client
import { listExpenses } from "@domie/domain";
import { SupabaseExpenseRepository } from "./SupabaseExpenseRepository";

const repository = new SupabaseExpenseRepository(supabase);
const expenses = await listExpenses({ tenantId: "123" }, { expenseRepository: repository });
```

## Best Practices

1. **Keep it pure** - No side effects, no I/O
2. **Validate early** - Validate in entity constructors and use cases
3. **Use value objects** - For domain concepts (Money, Email, Address, etc.)
4. **Encapsulate behavior** - Business logic belongs in entities, not services
5. **Test thoroughly** - Domain logic should have high test coverage

