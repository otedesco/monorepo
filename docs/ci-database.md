# CI Database Configuration

This document explains how to configure database access for CI/CD pipelines.

## Overview

The CI workflow supports two modes for database testing:

1. **Local Supabase** (default): Uses a local Supabase instance spun up during CI
2. **Remote Test Database**: Uses a dedicated remote test database via `CI_DATABASE_URL` secret

## Default Behavior (Local Supabase)

By default, the CI workflow:
- Starts a local Supabase instance using Docker
- Runs migrations via `supabase db push`
- Seeds the database using Snaplet
- Runs tests against the local database
- Stops the local instance after tests complete

This requires no additional configuration and works out of the box.

## Using a Remote Test Database

For more realistic testing or to avoid Docker overhead, you can configure CI to use a remote test database.

### ⚠️ CRITICAL WARNING

**NEVER point `CI_DATABASE_URL` to a production database.**

Always use a dedicated test database that:
- Is isolated from production data
- Can be safely wiped and reseeded
- Has appropriate access controls
- Is regularly backed up (if needed)

### Setup Steps

1. **Provision a Test Database**

   You can use:
   - A separate Supabase project (recommended)
   - A managed PostgreSQL instance (AWS RDS, Google Cloud SQL, etc.)
   - A containerized PostgreSQL instance

   Ensure the database:
   - Has network access from GitHub Actions IPs
   - Has a user with appropriate permissions (CREATE, DROP, INSERT, UPDATE, DELETE, SELECT)
   - Is configured for test workloads

2. **Get the Connection String**

   Format: `postgresql://user:password@host:port/database`

   Example:
   ```
   postgresql://test_user:secure_password@db.example.com:5432/test_db
   ```

3. **Add GitHub Secret**

   - Go to your repository on GitHub
   - Navigate to **Settings** → **Secrets and variables** → **Actions**
   - Click **New repository secret**
   - Name: `CI_DATABASE_URL`
   - Value: Your PostgreSQL connection string
   - Click **Add secret**

4. **Verify Configuration**

   After adding the secret, the next CI run will:
   - Skip starting local Supabase
   - Use your remote database for migrations, seeding, and tests
   - Log "Using remote CI database from CI_DATABASE_URL secret"

### Database Migrations with Remote Database

When using `CI_DATABASE_URL`, the workflow does **not** automatically run migrations via `supabase db push` (since there's no local Supabase instance).

You have two options:

1. **Pre-migrated Database**: Ensure your test database schema is up-to-date before CI runs
2. **Manual Migration Step**: Add a custom step to run migrations using your preferred tool

Example migration step (add to workflow):
```yaml
- name: Run database migrations
  if: ${{ secrets.CI_DATABASE_URL != '' }}
  run: |
    # Use your migration tool here
    # Example: psql ${{ secrets.CI_DATABASE_URL }} -f migrations.sql
  env:
    DATABASE_URL: ${{ secrets.CI_DATABASE_URL }}
```

## Environment Variables

### Required Secrets

| Secret | Description | Required |
|--------|-------------|----------|
| `CI_DATABASE_URL` | PostgreSQL connection string for remote test database | No (uses local if not set) |

### Environment Variables Used

| Variable | Source | Description |
|----------|--------|-------------|
| `DATABASE_URL` | Set from `CI_DATABASE_URL` secret or local Supabase | Used by Snaplet seed and all tests |
| `SUPABASE_DB_PASSWORD` | Hardcoded (`postgres`) | Only used for local Supabase instance |

## Snaplet Seed Configuration

Snaplet seed reads `DATABASE_URL` from the environment. The workflow ensures this is set correctly:

- If `CI_DATABASE_URL` is provided: Uses that connection string
- Otherwise: Uses local Supabase connection string

The seed script (`pnpm db:seed`) will automatically use the correct database.

## Troubleshooting

### CI Fails with "Connection Refused"

- **Local mode**: Ensure Docker is available in the CI environment
- **Remote mode**: Check that `CI_DATABASE_URL` is correct and the database is accessible from GitHub Actions IPs

### Migrations Not Applied

- **Local mode**: Migrations run automatically via `supabase db push`
- **Remote mode**: You must ensure migrations are applied manually or add a migration step

### Seed Fails

- Verify `DATABASE_URL` is set correctly
- Check database permissions (user needs INSERT, UPDATE, DELETE)
- Ensure foreign key constraints are satisfied (seed order matters)

### Tests Fail with Database Errors

- Verify the database schema matches expected migrations
- Check that seed data was created successfully
- Review test logs for specific database errors

## Best Practices

1. **Isolation**: Use a separate database for CI, never production
2. **Clean State**: Consider wiping/reseeding the database between runs for consistency
3. **Monitoring**: Monitor test database usage and costs
4. **Security**: Rotate database credentials regularly
5. **Documentation**: Keep this document updated as database setup changes

## Related Documentation

- [Supabase Local Development](https://supabase.com/docs/guides/cli/local-development)
- [Snaplet Seed Documentation](https://docs.snaplet.dev/seed)
- [GitHub Actions Secrets](https://docs.github.com/en/actions/security-guides/encrypted-secrets)

