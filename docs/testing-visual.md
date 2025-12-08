# Visual Regression Testing with Chromatic

This project uses [Chromatic](https://www.chromatic.com/) for visual regression testing of Storybook components.

## Overview

Chromatic automatically captures screenshots of all Storybook stories and compares them against baseline images to detect visual changes. This helps catch unintended UI changes, styling regressions, and visual bugs.

## Setup

### 1. Install Chromatic

Chromatic is already included as a dev dependency in `apps/storybook-host/package.json`.

### 2. Get Your Project Token

1. Sign up or log in to [Chromatic](https://www.chromatic.com/)
2. Create a new project or select an existing one
3. Copy your project token from the project settings

### 3. Configure GitHub Secret

Add your Chromatic project token as a GitHub secret:

1. Go to your repository on GitHub
2. Navigate to **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**
4. Name: `CHROMATIC_PROJECT_TOKEN`
5. Value: Your Chromatic project token
6. Click **Add secret**

**Note:** Without this secret, Chromatic tests will be skipped in CI.

## Running Chromatic Locally

### Publish Storybook to Chromatic

```bash
# From the repository root
pnpm chromatic

# Or from the storybook-host directory
cd apps/storybook-host
pnpm chromatic
```

This will:
1. Build your Storybook
2. Upload it to Chromatic
3. Capture screenshots of all stories
4. Compare against baseline (or create baseline if first run)

### Environment Variable

You can also set the token as an environment variable:

```bash
export CHROMATIC_PROJECT_TOKEN=your-token-here
pnpm chromatic
```

## CI Integration

Chromatic runs automatically in CI on pull requests:

1. Storybook is built
2. If `CHROMATIC_PROJECT_TOKEN` is configured, Chromatic runs
3. Visual changes are detected and reported as PR comments
4. Reviewers can approve or request changes in the Chromatic UI

## Workflow

1. **First Run**: Chromatic creates baseline screenshots
2. **Subsequent Runs**: Chromatic compares new screenshots against baseline
3. **Visual Changes**: Chromatic flags differences and adds a comment to the PR
4. **Review**: Review changes in the Chromatic UI and approve or request fixes
5. **Approval**: Once approved, the new screenshots become the new baseline

## Troubleshooting

### Chromatic Not Running in CI

- Verify `CHROMATIC_PROJECT_TOKEN` is set in GitHub Secrets
- Check that the secret is available to the workflow (repository secrets are available to all workflows)

### Build Failures

- Ensure Storybook builds successfully: `pnpm storybook:build`
- Check that all dependencies are installed: `pnpm install`

### False Positives

- Review visual changes carefully in the Chromatic UI
- Some changes may be intentional (e.g., design updates)
- Approve changes that are expected

## Resources

- [Chromatic Documentation](https://www.chromatic.com/docs/)
- [Chromatic GitHub Action](https://github.com/chromaui/chromatic-cli)
- [Storybook Documentation](https://storybook.js.org/docs)

