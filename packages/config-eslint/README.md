# ESLint Config Package

Shared ESLint configurations for the monorepo.

## Overview

This package provides centralized ESLint configs:
- **index.cjs** - Base config for all packages
- **next.cjs** - Config for Next.js apps (extends base + Next.js rules)

## Structure

```
.
├── index.cjs      # Base ESLint config
├── next.cjs       # Next.js ESLint config
└── package.json
```

## Usage

### For Packages

```javascript
// packages/my-package/.eslintrc.cjs
module.exports = {
  root: true,
  extends: ["@domie/eslint-config"],
};
```

### For Next.js Apps

```javascript
// apps/web/.eslintrc.cjs
module.exports = {
  root: true,
  extends: ["@domie/eslint-config/next"],
};
```

### With Additional Rules

```javascript
// packages/ui/.eslintrc.cjs
module.exports = {
  root: true,
  extends: [
    "@my-org/eslint-config",
    "plugin:react/recommended",
    "plugin:react-hooks/recommended",
  ],
  plugins: ["react", "react-hooks"],
  rules: {
    "react/react-in-jsx-scope": "off",
  },
};
```

## Available Configs

### Base Config (`index.cjs`)

Includes:
- TypeScript ESLint parser and plugin
- Import ordering rules
- TypeScript recommended rules
- Test file overrides (relaxed rules)

### Next.js Config (`next.cjs`)

Extends base config and adds:
- Next.js core web vitals rules
- React recommended rules
- React Hooks rules

## Rules

### Import Ordering

Imports are automatically ordered:
1. Built-in modules
2. External packages
3. Internal packages (`@ui`, `@domain`, `@api-client`, `@shared`, `@i18n`)
4. Parent imports
5. Sibling imports
6. Index imports

### TypeScript Rules

- `@typescript-eslint/no-unused-vars` - Error (with `_` prefix ignore)
- `@typescript-eslint/no-explicit-any` - Warning
- `@typescript-eslint/explicit-module-boundary-types` - Off

### Test File Overrides

Test files have relaxed rules:
- `@typescript-eslint/no-explicit-any` - Off
- `@typescript-eslint/no-non-null-assertion` - Off

## Overriding Rules

You can override rules in your local config:

```javascript
module.exports = {
  root: true,
  extends: ["@domie/eslint-config"],
  rules: {
    "@typescript-eslint/no-explicit-any": "error", // Stricter for domain
  },
};
```

## Linting

```bash
# From root
pnpm lint

# For specific package
cd packages/my-package
pnpm lint
```

## Best Practices

1. **Always extend** - Don't copy the entire config
2. **Use root: true** - Prevents searching parent directories
3. **Add package-specific rules** - Override only what you need
4. **Keep consistent** - Use the same base config across packages
5. **Fix auto-fixable** - Use `--fix` flag when possible

## Adding New Rules

When adding rules to the base config:

1. Consider if it applies to all packages
2. Test with all packages
3. Update this README
4. Consider migration if breaking

## Ignore Patterns

Common ignore patterns (set in root `.eslintrc.cjs`):

- `dist/`, `.next/`, `storybook-static/`
- `node_modules/`
- `*.config.js`, `*.config.cjs`, `*.config.mjs`
- `supabase/migrations/*.sql`

## Troubleshooting

### Rules not applying

- Check that `root: true` is set
- Verify extends path is correct
- Ensure ESLint can resolve the config package

### Import ordering issues

- Run `pnpm lint --fix` to auto-fix
- Check that import resolver is configured
- Verify TypeScript paths are correct

### TypeScript errors in ESLint

- Ensure `@typescript-eslint/parser` is installed
- Check that `tsconfig.json` is valid
- Verify parser options in config

