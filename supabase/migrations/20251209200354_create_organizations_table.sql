-- Migration: Create organizations table with RLS policies
-- Created: 2025-12-09
-- Description: Creates an organizations table to represent real estate agencies
--              or single-owner entities, with basic RLS policies.
-- Purpose: Store organization information (name, slug, type). RLS policies
--          based on memberships and roles will be added in a future migration
--          once organization_memberships and organization_roles tables exist.
-- Affected tables: organizations (new table)
-- Dependencies: Requires set_updated_at() function from migration 20251209105645

-- ============================================
-- UP MIGRATION
-- ============================================

-- Note: This migration depends on the set_updated_at() function
-- created in migration: 20251209105645_create_set_updated_at_function.sql

-- 1. Create organization_type enum
-- Defines the two types of organizations: agency (real estate agencies/companies)
-- and owner (single-owner entities)
create type public.organization_type as enum ('agency', 'owner');

-- Add comment for documentation
comment on type public.organization_type is 
  'Enum type representing the type of organization. Values: agency (real estate agencies/companies) or owner (single-owner entities).';

-- 2. Create organizations table
-- Stores organization information with a unique slug for URL-friendly identifiers
-- Each organization is created by a user (created_by references auth.users)
create table if not exists public.organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique,
  type public.organization_type not null,
  created_by uuid not null references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Add table comment describing its purpose
comment on table public.organizations is 
  'Organizations represent real estate agencies/companies or single-owner entities. Each organization has a unique slug for URL-friendly identification. Users will be linked to organizations through organization_memberships (to be created in a future migration).';

-- 3. Add indexes for common queries
-- Index on type for filtering organizations by type (agency vs owner)
create index if not exists idx_organizations_type
  on public.organizations (type);

-- Index on created_by for finding organizations created by a specific user
create index if not exists idx_organizations_created_by
  on public.organizations (created_by);

-- 4. Add updated_at trigger
-- Automatically updates the updated_at column whenever a row is updated
-- Drops existing trigger if it exists (idempotent)
drop trigger if exists organizations_set_updated_at on public.organizations;

create trigger organizations_set_updated_at
  before update on public.organizations
  for each row
  execute procedure public.set_updated_at();

-- 5. Enable Row Level Security
-- RLS is enabled to enforce access control
alter table public.organizations enable row level security;

-- 6. RLS Policies
-- Note: These are temporary basic policies. More sophisticated policies based on
--       organization_memberships and organization_roles will be added in a future
--       migration once those tables are created.

-- Policy: Authenticated users can create organizations
-- Rationale: Any authenticated user should be able to create a new organization
--            where they are the creator (created_by = auth.uid())
create policy "Authenticated users can create organizations"
  on public.organizations
  for insert
  with check (
    auth.role() = 'authenticated'
    and created_by = auth.uid()
  );

-- Policy: Users can view organizations they created
-- Rationale: Temporary policy allowing users to see organizations they created.
--            This will be replaced with a membership-based policy once
--            organization_memberships table is created.
create policy "Users can view organizations they created"
  on public.organizations
  for select
  using (created_by = auth.uid());

-- Policy: Users can update organizations they created
-- Rationale: Temporary policy allowing users to update organizations they created.
--            This will be replaced with an admin role-based policy once
--            organization_memberships and organization_roles tables are created.
create policy "Users can update organizations they created"
  on public.organizations
  for update
  using (created_by = auth.uid())
  with check (created_by = auth.uid());

-- Note: No DELETE policy is added - organization deletion should be handled
--       through a separate process or admin function to ensure data integrity

-- ============================================
-- DOWN MIGRATION (for rollback)
-- ============================================

-- Uncomment and use if you need to rollback this migration:
-- 
-- -- Drop RLS policies
-- drop policy if exists "Users can update organizations they created" on public.organizations;
-- drop policy if exists "Users can view organizations they created" on public.organizations;
-- drop policy if exists "Authenticated users can create organizations" on public.organizations;
-- 
-- -- Disable RLS
-- alter table public.organizations disable row level security;
-- 
-- -- Drop trigger
-- drop trigger if exists organizations_set_updated_at on public.organizations;
-- 
-- -- Drop indexes
-- drop index if exists idx_organizations_created_by;
-- drop index if exists idx_organizations_type;
-- 
-- -- Drop table
-- drop table if exists public.organizations;
-- 
-- -- Drop enum type
-- drop type if exists public.organization_type;
-- 
-- -- Note: We don't drop set_updated_at() function as it is created in a separate migration
-- -- and may be used by other tables

