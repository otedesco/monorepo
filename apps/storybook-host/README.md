# Storybook Host

Isolated Storybook application for developing and documenting the design system.

## Overview

This app hosts Storybook stories for:
- Components from `@domie/ui`
- Feature components from `apps/web` (optional)
- Design tokens and theming

It uses the same Tailwind configuration and design tokens as the main app, ensuring visual consistency.

## Getting Started

### Development

```bash
# From root
pnpm storybook

# Or directly
cd apps/storybook-host
pnpm storybook
```

Storybook runs on `http://localhost:6006`.

### Build

```bash
pnpm storybook:build
```

Outputs to `storybook-static/` directory.

## Structure

```
.
├── .storybook/
│   ├── main.ts          # Storybook configuration
│   └── preview.ts       # Global decorators, a11y config
├── src/
│   ├── stories/         # Example stories
│   └── styles/
│       └── storybook.css # Storybook-specific styles
└── tailwind.config.ts   # Extends @domie/ui config
```

## Adding Stories

### From `@domie/ui`

Stories in `packages/ui/src/components/*.stories.tsx` are automatically discovered.

### Local Stories

Create stories in `src/stories/`:

```typescript
// src/stories/MyComponent.stories.tsx
import type { Meta, StoryObj } from "@storybook/react";
import { MyComponent } from "@ui/components/my-component";

const meta: Meta<typeof MyComponent> = {
  title: "Components/MyComponent",
  component: MyComponent,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof MyComponent>;

export const Default: Story = {
  args: {
    variant: "default",
    children: "Button",
  },
};
```

## Configuration

### Main Config (`.storybook/main.ts`)

- Stories from `packages/ui/src/**/*.stories.@(ts|tsx)`
- Addons: essentials, interactions, a11y
- Vite framework
- Path aliases configured

### Preview Config (`.storybook/preview.ts`)

- Dark mode decorator
- Design tokens imported
- Accessibility checks enabled

## Accessibility Testing

The `@storybook/addon-a11y` addon is configured. To use:

1. Open any story
2. Click the "Accessibility" tab
3. Review violations and recommendations

### Configuring a11y Rules

Edit `.storybook/preview.ts`:

```typescript
a11y: {
  config: {
    rules: [
      { id: 'color-contrast', enabled: true },
      // Customize rules
    ],
  },
}
```

## Visual Testing

### Chromatic

Visual regression testing is configured:

```bash
pnpm chromatic
```

Requires `CHROMATIC_PROJECT_TOKEN` environment variable.

### Manual Testing

1. Build Storybook: `pnpm storybook:build`
2. Review stories in the built output
3. Compare visually across browsers/devices

## Design Tokens

Storybook uses the same design tokens as the main app:

- CSS variables from `@domie/ui/styles`
- Tailwind classes with design tokens
- Dark mode support

The preview decorator applies dark mode by default. Toggle via the backgrounds addon.

## Deployment

### GitHub Pages

Automatically deployed via `.github/workflows/deploy.yml` on push to main.

### Manual Deployment

1. Build: `pnpm storybook:build`
2. Deploy `storybook-static/` to your hosting platform

### Other Platforms

See `.github/workflows/deploy.yml` for examples:
- Vercel
- Netlify
- AWS S3 + CloudFront

## Best Practices

1. **Write stories for all components** - Ensures components are documented and testable
2. **Use design tokens** - Never hardcode colors or spacing
3. **Test accessibility** - Use the a11y addon for every component
4. **Document variants** - Show all component variants and states
5. **Use interactions** - Test user interactions with the interactions addon

## Troubleshooting

### Stories not appearing

- Check file naming: `*.stories.tsx` or `*.stories.ts`
- Verify path in `.storybook/main.ts` stories array
- Check for TypeScript errors

### Design tokens not working

- Ensure `@domie/ui/styles` is imported in preview
- Verify Tailwind config extends UI config
- Check that CSS variables are defined

### Build fails

- Run `pnpm install` from root
- Check for TypeScript errors: `pnpm typecheck`
- Verify all dependencies are installed

