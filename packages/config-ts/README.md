# TypeScript Config Package

Shared TypeScript configurations for the monorepo.

## Overview

This package provides centralized TypeScript configs:
- **base.json** - Base config for packages
- **next-app.json** - Config for Next.js apps
- **deno-edge.json** - Config for Supabase Edge Functions (Deno)

## Structure

```
.
├── base.json          # Base TypeScript config
├── next-app.json      # Next.js app config
├── deno-edge.json     # Deno/Edge Functions config
└── package.json
```

## Usage

### For Packages

```json
// packages/my-package/tsconfig.json
{
  "extends": "@domie/tsconfig/base.json",
  "compilerOptions": {
    "baseUrl": ".",
    "outDir": "./dist",
    "rootDir": "./src"
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

### For Next.js Apps

```json
// apps/web/tsconfig.json
{
  "extends": "@domie/tsconfig/next-app.json",
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@ui/*": ["../../packages/ui/src/*"],
      "@domain/*": ["../../packages/domain/src/*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx"],
  "exclude": ["node_modules"]
}
```

### For Supabase Edge Functions

```json
// supabase/functions/my-function/tsconfig.json
{
  "extends": "@domie/tsconfig/deno-edge.json",
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@shared/*": ["../../../packages/shared/src/*"]
    }
  }
}
```

## Available Configs

### base.json

Base configuration for all packages:
- Strict mode enabled
- ES2020 target
- ESNext modules
- React JSX support
- Path aliases for monorepo packages

### next-app.json

Extends `base.json` with Next.js-specific options:
- JSX preserve mode
- Next.js plugin
- DOM libraries

### deno-edge.json

Configuration for Deno runtime (Supabase Edge Functions):
- ES2022 target
- Deno types
- Deno namespace support

## Path Aliases

The base config doesn't include path aliases - add them in your local `tsconfig.json`:

```json
{
  "compilerOptions": {
    "paths": {
      "@ui/*": ["../../packages/ui/src/*"],
      "@domain/*": ["../../packages/domain/src/*"],
      "@api-client/*": ["../../packages/api-client/src/*"],
      "@shared/*": ["../../packages/shared/src/*"],
      "@i18n/*": ["../../packages/i18n/src/*"]
    }
  }
}
```

## Overriding Options

You can override any option in your local config:

```json
{
  "extends": "@domie/tsconfig/base.json",
  "compilerOptions": {
    "strict": false,  // Override strict mode (not recommended)
    "target": "ES2022"  // Override target
  }
}
```

## Best Practices

1. **Always extend** - Don't copy the entire config
2. **Add local paths** - Include path aliases in your config
3. **Set include/exclude** - Specify what files to include
4. **Don't override strict** - Keep strict mode enabled
5. **Use appropriate config** - Use `next-app.json` for Next.js, `base.json` for packages

## Updating Configs

When updating shared configs:

1. Update the config file in this package
2. Test that all packages still type-check
3. Update this README if options change
4. Consider migration guide if breaking changes

## Type Checking

```bash
# From root
pnpm typecheck

# For specific package
cd packages/my-package
pnpm typecheck
```

