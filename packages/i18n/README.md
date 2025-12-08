# i18n Package

Internationalization package for English (default) and Spanish support.

## Overview

This package provides:
- **Locale configuration** - Supported locales and default locale
- **Translation files** - JSON files for English and Spanish
- **next-intl integration** - Re-exports next-intl utilities
- **Type-safe translations** - TypeScript support for translation keys

## Structure

```
src/
├── config.ts              # Locale configuration
├── index.ts               # Public exports
└── locales/
    ├── en/
    │   └── common.json    # English translations
    └── es/
        └── common.json    # Spanish translations
```

## Configuration

### Supported Locales

```typescript
import { locales, defaultLocale } from "@domie/i18n";

console.log(locales); // ["en", "es"]
console.log(defaultLocale); // "en"
```

### Type Safety

```typescript
import type { Locale } from "@domie/i18n";

function setLocale(locale: Locale) {
  // TypeScript ensures only "en" or "es"
}
```

## Adding Translations

### 1. Add Keys to English

```json
// src/locales/en/common.json
{
  "myFeature": {
    "title": "My Feature",
    "description": "This is my feature",
    "actions": {
      "save": "Save",
      "cancel": "Cancel"
    }
  }
}
```

### 2. Add Keys to Spanish

```json
// src/locales/es/common.json
{
  "myFeature": {
    "title": "Mi Característica",
    "description": "Esta es mi característica",
    "actions": {
      "save": "Guardar",
      "cancel": "Cancelar"
    }
  }
}
```

### 3. Use in Components

```typescript
import { useTranslations } from "@i18n";

export function MyComponent() {
  const t = useTranslations("common");
  
  return (
    <div>
      <h1>{t("myFeature.title")}</h1>
      <p>{t("myFeature.description")}</p>
      <button>{t("myFeature.actions.save")}</button>
    </div>
  );
}
```

## Translation Keys Structure

### Naming Convention

- Use **nested objects** for organization
- Use **camelCase** for keys
- Group by **feature** or **page**

### Example Structure

```json
{
  "home": { ... },
  "expenses": {
    "title": "...",
    "table": { ... },
    "form": { ... },
    "status": { ... }
  },
  "buttons": { ... },
  "language": { ... }
}
```

## Using Translations

### Client Components

```typescript
"use client";

import { useTranslations, useLocale } from "@i18n";

export function MyComponent() {
  const t = useTranslations("common");
  const locale = useLocale();

  return <h1>{t("myFeature.title")}</h1>;
}
```

### Server Components

```typescript
import { getTranslations } from "next-intl/server";

export async function MyServerComponent() {
  const t = await getTranslations("common");
  
  return <h1>{t("myFeature.title")}</h1>;
}
```

### Formatting

Use locale-aware formatting:

```typescript
import { useLocale } from "@i18n";

export function PriceDisplay({ amount }: { amount: number }) {
  const locale = useLocale();

  return (
    <span>
      {new Intl.NumberFormat(locale, {
        style: "currency",
        currency: "USD",
      }).format(amount)}
    </span>
  );
}
```

## Locale Routing

### Middleware

The middleware in `apps/web/src/middleware.ts` handles locale routing:

- `/` → redirects to `/en`
- `/en/...` → English routes
- `/es/...` → Spanish routes

### Switching Locales

```typescript
import { useRouter, usePathname } from "next/navigation";
import { useLocale } from "@i18n";

export function LanguageSwitcher() {
  const router = useRouter();
  const pathname = usePathname();
  const locale = useLocale();

  const switchLocale = (newLocale: "en" | "es") => {
    const pathWithoutLocale = pathname.replace(`/${locale}`, "");
    router.push(`/${newLocale}${pathWithoutLocale}`);
  };

  return (
    <button onClick={() => switchLocale("es")}>Español</button>
  );
}
```

## Best Practices

### ✅ DO

- **Always add both languages** - Never add a key to only one locale
- **Use nested keys** - Organize by feature/page
- **Keep keys descriptive** - `expenses.table.description` not `expenses.desc`
- **Use consistent naming** - Follow existing patterns

### ❌ DON'T

- **Hardcode strings** - Always use translations
- **Add keys to one locale only** - Always add to both en and es
- **Use generic keys** - `title` is too generic, use `expenses.title`
- **Nest too deeply** - 3-4 levels max

## Testing

### Unit Tests

Test translation loading:

```typescript
import { locales, defaultLocale } from "@domie/i18n";

test("has correct locales", () => {
  expect(locales).toEqual(["en", "es"]);
  expect(defaultLocale).toBe("en");
});
```

### Integration Tests

Test translations in components:

```typescript
import { render, screen } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import enMessages from "@i18n/locales/en/common.json";

test("renders translated text", () => {
  render(
    <NextIntlClientProvider locale="en" messages={enMessages}>
      <MyComponent />
    </NextIntlClientProvider>
  );
  
  expect(screen.getByText("My Feature")).toBeInTheDocument();
});
```

## Type Checking

```bash
pnpm typecheck
```

## Maintaining Translations

### Checklist

When adding new features:

1. ✅ Add translation keys to `en/common.json`
2. ✅ Add translation keys to `es/common.json`
3. ✅ Use `useTranslations()` in components
4. ✅ Test both locales
5. ✅ Verify no hardcoded strings

### Translation Review

Before merging PRs:

- All user-facing strings are translated
- Both English and Spanish keys exist
- Keys follow naming conventions
- No hardcoded strings in components

## Adding New Locales

1. Add locale to config:

```typescript
// src/config.ts
export const locales = ["en", "es", "fr"] as const;
```

2. Create locale directory:

```bash
mkdir -p src/locales/fr
```

3. Copy `en/common.json` to `fr/common.json` and translate

4. Update middleware in `apps/web` to include new locale

5. Update language switcher components

