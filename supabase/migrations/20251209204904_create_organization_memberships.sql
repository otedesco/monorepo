-- Migration: Create organization_memberships table
-- Created: 2025-12-09
-- Description: Creates the organization_memberships table to link users to organizations
--              with specific roles, including RLS policies for access control.
-- Purpose: Enables user-organization relationships with role-based access control.
--          Admins can manage all memberships in their organizations, while users
--          can view their own memberships and insert memberships for themselves.
-- Affected tables: organization_memberships (new table)
-- Dependencies: 
--   - public.organizations table (from migration 20251209200354)
--   - public.organization_roles table (from migration 20251209204857)
--   - auth.users (Supabase auth schema)
--   - public.set_updated_at() function (from migration 20251209105645)

-- ============================================
-- UP MIGRATION
-- ============================================

-- 3.2 Ensure set_updated_at Helper Exists
-- If public.set_updated_at() was defined in a previous migration, we can safely
-- re-declare it using create or replace. This keeps migrations idempotent and consistent.
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- 3.3 Implement organization_memberships Table
-- Links users to organizations with a specific role
-- Unique constraint ensures one role per user per organization in MVP
create table if not exists public.organization_memberships (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role_id int not null references public.organization_roles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint organization_memberships_unique_member unique (organization_id, user_id)
);

-- Add table comment for documentation
comment on table public.organization_memberships is 
  'Links users to organizations with specific roles. Each user can have one role per organization. Admins can manage all memberships in their organizations.';

-- 3.4 Add updated_at Trigger
-- Automatically updates the updated_at column whenever a row is updated
drop trigger if exists organization_memberships_set_updated_at on public.organization_memberships;

create trigger organization_memberships_set_updated_at
before update on public.organization_memberships
for each row
execute procedure public.set_updated_at();

-- 3.5 Indexes
-- Add indexes on user_id, organization_id, and role_id to support common access patterns
-- (e.g., listing members by org, or orgs by user)
create index if not exists idx_organization_memberships_user_id
  on public.organization_memberships (user_id);

create index if not exists idx_organization_memberships_organization_id
  on public.organization_memberships (organization_id);

create index if not exists idx_organization_memberships_role_id
  on public.organization_memberships (role_id);

-- 3.6 Enable RLS on organization_memberships
alter table public.organization_memberships enable row level security;

-- 3.7 RLS Policies for organization_memberships

-- 3.7.1 Users Can See Their Own Memberships
drop policy if exists "Users can view their own memberships" on public.organization_memberships;

create policy "Users can view their own memberships"
on public.organization_memberships
for select
using (user_id = auth.uid());

-- 3.7.2 Admins Can See All Memberships in Their Org
-- Admins should see all memberships for the organizations where they are admins.
drop policy if exists "Admins can view org memberships" on public.organization_memberships;

create policy "Admins can view org memberships"
on public.organization_memberships
for select
using (
  exists (
    select 1
    from public.organization_memberships om
    join public.organization_roles r on r.id = om.role_id
    where om.organization_id = organization_memberships.organization_id
      and om.user_id = auth.uid()
      and r.code = 'admin'
  )
);

-- 3.7.3 Admins Can Manage (Update/Delete) Memberships in Their Org
-- Admins can update or delete memberships only within their own organization.
drop policy if exists "Admins can manage org memberships" on public.organization_memberships;

create policy "Admins can manage org memberships"
on public.organization_memberships
for update using (
  exists (
    select 1
    from public.organization_memberships om
    join public.organization_roles r on r.id = om.role_id
    where om.organization_id = organization_memberships.organization_id
      and om.user_id = auth.uid()
      and r.code = 'admin'
  )
)
with check (
  exists (
    select 1
    from public.organization_memberships om
    join public.organization_roles r on r.id = om.role_id
    where om.organization_id = organization_memberships.organization_id
      and om.user_id = auth.uid()
      and r.code = 'admin'
  )
);

-- 3.7.4 Dedicated Delete Policy for Admins
-- Admins can delete memberships only in organizations where they are admins.
drop policy if exists "Admins can delete org memberships" on public.organization_memberships;

create policy "Admins can delete org memberships"
on public.organization_memberships
for delete using (
  exists (
    select 1
    from public.organization_memberships om
    join public.organization_roles r on r.id = om.role_id
    where om.organization_id = organization_memberships.organization_id
      and om.user_id = auth.uid()
      and r.code = 'admin'
  )
);

-- 3.7.5 Users Can Insert Memberships for Themselves
-- Users may insert a membership for themselves (e.g., when accepting an invite or
-- when an org is created and the insertion is performed with a client session).
-- We constrain it so that user_id = auth.uid().
-- The organization-level permission for which org they can join may be handled
-- in app logic or by a separate invitation table in future projects; in this MVP
-- we enforce only the identity constraint at the DB level.
drop policy if exists "Users can insert memberships for themselves" on public.organization_memberships;

create policy "Users can insert memberships for themselves"
on public.organization_memberships
for insert
with check (user_id = auth.uid());

-- Note: For server-side flows that use a service role key, RLS may be bypassed,
-- allowing backend code to insert memberships as needed (e.g., on org creation).

-- ============================================
-- DOWN MIGRATION (for rollback)
-- ============================================

-- Uncomment and use if you need to rollback this migration:
-- 
-- -- Drop RLS policies
-- drop policy if exists "Users can insert memberships for themselves" on public.organization_memberships;
-- drop policy if exists "Admins can delete org memberships" on public.organization_memberships;
-- drop policy if exists "Admins can manage org memberships" on public.organization_memberships;
-- drop policy if exists "Admins can view org memberships" on public.organization_memberships;
-- drop policy if exists "Users can view their own memberships" on public.organization_memberships;
-- 
-- -- Disable RLS
-- alter table public.organization_memberships disable row level security;
-- 
-- -- Drop indexes
-- drop index if exists idx_organization_memberships_role_id;
-- drop index if exists idx_organization_memberships_organization_id;
-- drop index if exists idx_organization_memberships_user_id;
-- 
-- -- Drop trigger
-- drop trigger if exists organization_memberships_set_updated_at on public.organization_memberships;
-- 
-- -- Drop table
-- drop table if exists public.organization_memberships;
-- 
-- -- Note: We don't drop set_updated_at() function as it is created in a separate migration
-- -- and may be used by other tables

