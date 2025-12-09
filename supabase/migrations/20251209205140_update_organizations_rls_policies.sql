-- Migration: Update organizations RLS policies to use membership-based access control
-- Created: 2025-12-09
-- Description: Replaces temporary RLS policies on organizations table with
--              membership-based policies that use organization_memberships and
--              organization_roles tables.
-- Purpose: Enables proper access control where users can only view organizations
--          they are members of, and only admins and owners can update organizations.
-- Affected tables: organizations (RLS policies updated)
-- Dependencies: 
--   - public.organization_memberships table (from migration 20251209204904)
--   - public.organization_roles table (from migration 20251209204857)

-- ============================================
-- UP MIGRATION
-- ============================================

-- Drop old temporary policies that were based on created_by
-- These will be replaced with membership-based policies
drop policy if exists "Users can view organizations they created" on public.organizations;
drop policy if exists "Users can update organizations they created" on public.organizations;

-- Keep the insert policy as is - users can still create organizations
-- (The application logic should handle creating the initial membership)

-- New Policy: Users can view organizations where they are members
-- Rationale: Users should be able to see organizations where they have a membership,
--            regardless of their role (admin, agent, or owner).
create policy "Users can view organizations they are members of"
  on public.organizations
  for select
  using (
    exists (
      select 1
      from public.organization_memberships om
      where om.organization_id = organizations.id
        and om.user_id = auth.uid()
    )
  );

-- New Policy: Admins and owners can update organizations
-- Rationale: Only users with the 'admin' or 'owner' role in an organization should be able
--            to update that organization's details.
create policy "Admins and owners can update organizations"
  on public.organizations
  for update
  using (
    exists (
      select 1
      from public.organization_memberships om
      join public.organization_roles r on r.id = om.role_id
      where om.organization_id = organizations.id
        and om.user_id = auth.uid()
        and (r.code = 'admin' or r.code = 'owner')
    )
  )
  with check (
    exists (
      select 1
      from public.organization_memberships om
      join public.organization_roles r on r.id = om.role_id
      where om.organization_id = organizations.id
        and om.user_id = auth.uid()
        and (r.code = 'admin' or r.code = 'owner')
    )
  );

-- Note: No DELETE policy is added - organization deletion should be handled
--       through a separate process or admin function to ensure data integrity

-- ============================================
-- DOWN MIGRATION (for rollback)
-- ============================================

-- Uncomment and use if you need to rollback this migration:
-- 
-- -- Drop new membership-based policies
-- drop policy if exists "Admins and owners can update organizations" on public.organizations;
-- drop policy if exists "Users can view organizations they are members of" on public.organizations;
-- 
-- -- Restore old temporary policies
-- create policy "Users can view organizations they created"
--   on public.organizations
--   for select
--   using (created_by = auth.uid());
-- 
-- create policy "Users can update organizations they created"
--   on public.organizations
--   for update
--   using (created_by = auth.uid())
--   with check (created_by = auth.uid());

