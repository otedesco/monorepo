# UI Package

Shared design system with Tailwind CSS, CSS variables, and shadcn-style components.

## Overview

This package provides:
- **Design tokens** - CSS variables for colors, spacing, borders
- **React components** - Reusable UI components (Button, etc.)
- **Tailwind configuration** - Shared Tailwind setup with design tokens
- **TypeScript types** - Component prop types

## Structure

```
src/
├── components/
│   ├── button.tsx        # Button component
│   ├── button.test.tsx   # Component tests
│   └── button.stories.tsx # Storybook stories
├── styles/
│   ├── tokens.css        # CSS variable definitions
│   └── globals.css       # Tailwind directives
└── index.ts              # Public exports
```

## Design Tokens

### CSS Variables

Defined in `src/styles/tokens.css`:

- **Brand colors**: `--brand-primary`, `--brand-primary-foreground`, `--brand-muted`, etc.
- **Surface colors**: `--surface`, `--surface-foreground`
- **Border colors**: `--border-subtle`, `--border-strong`
- **Radius**: `--radius`

### Usage in Components

```tsx
// Use Tailwind classes with design tokens
<button className="bg-brand-primary text-brand-primary-foreground">
  Button
</button>
```

### Dark Mode

Tokens automatically switch in dark mode via `.dark` class:

```css
:root {
  --brand-primary: /* light mode value */;
}

.dark {
  --brand-primary: /* dark mode value */;
}
```

## Adding a New Component

### 1. Create Component File

```typescript
// src/components/input.tsx
import * as React from "react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  variant?: "default" | "error";
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, variant = "default", ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={twMerge(
          clsx(
            "px-4 py-2 border rounded-md",
            "bg-surface text-surface-foreground",
            "border-border-subtle",
            variant === "error" && "border-red-500",
            className
          )
        )}
        {...props}
      />
    );
  }
);

Input.displayName = "Input";
```

### 2. Export from Index

```typescript
// src/index.ts
export { Input, type InputProps } from "./components/input";
```

### 3. Add Tests

```typescript
// src/components/input.test.tsx
import { render, screen } from "@testing-library/react";
import { Input } from "./input";

test("renders input", () => {
  render(<Input placeholder="Enter text" />);
  expect(screen.getByPlaceholderText("Enter text")).toBeInTheDocument();
});
```

### 4. Add Storybook Story

```typescript
// src/components/input.stories.tsx
import type { Meta, StoryObj } from "@storybook/react";
import { Input } from "./input";

const meta: Meta<typeof Input> = {
  title: "Components/Input",
  component: Input,
};

export default meta;
type Story = StoryObj<typeof Input>;

export const Default: Story = {
  args: {
    placeholder: "Enter text",
  },
};
```

### 5. Run Tests

```bash
pnpm test
```

## Using Components

### In Apps

```typescript
import { Button } from "@domie/ui";
import "@domie/ui/styles"; // Import styles

<Button variant="default" size="md">Click me</Button>
```

### Styling

Always use design tokens:

```tsx
// ✅ Good
<div className="bg-surface text-surface-foreground border border-border-subtle">

// ❌ Bad
<div className="bg-white text-black border border-gray-200">
```

## Tailwind Configuration

The package exports a Tailwind config that apps can extend:

```typescript
// apps/web/tailwind.config.ts
import uiConfig from "@domie/ui/tailwind.config";

export default {
  ...uiConfig,
  content: [
    "./src/**/*.{ts,tsx}",
    "../../packages/ui/src/**/*.{ts,tsx}",
  ],
};
```

## Testing

### Unit Tests

```bash
pnpm test
```

Uses Vitest + React Testing Library.

### Visual Tests

Stories are tested in Storybook. See [apps/storybook-host/README.md](../../apps/storybook-host/README.md).

## Best Practices

1. **Use design tokens** - Never hardcode colors, spacing, or other design values
2. **Compose with clsx + tailwind-merge** - For conditional classes
3. **Forward refs** - For components that need refs
4. **Export types** - Export both component and prop types
5. **Write tests** - Test component behavior and accessibility
6. **Document with stories** - Show all variants and states

## Adding New Design Tokens

1. Add CSS variable to `src/styles/tokens.css`:

```css
:root {
  --new-token: value;
}

.dark {
  --new-token: dark-value;
}
```

2. Add to Tailwind config if needed:

```typescript
// tailwind.config.ts
theme: {
  extend: {
    colors: {
      newColor: "hsl(var(--new-token) / <alpha-value>)",
    },
  },
}
```

3. Update documentation and stories

## TypeScript

The package uses strict TypeScript. All components should:
- Have explicit prop types
- Use `React.forwardRef` when refs are needed
- Export prop types for consumers

## Linting

```bash
pnpm lint
```

Uses `@domie/eslint-config` with React rules.

