-- Migration: Create organization_roles table
-- Created: 2025-12-09
-- Description: Creates a static lookup table for organization roles (admin, agent, owner)
--              with RLS policies allowing authenticated users to read roles.
-- Purpose: Provides a reference table for organization-level roles that users can have
--          within organizations. This table is read-only for regular client sessions.
-- Affected tables: organization_roles (new table)
-- Dependencies: None

-- ============================================
-- UP MIGRATION
-- ============================================

-- 1) Create organization_role_code enum
-- Defines the valid role codes: admin, agent, owner
create type public.organization_role_code as enum ('admin', 'agent', 'owner');

-- Add comment for documentation
comment on type public.organization_role_code is 
  'Enum type representing organization role codes. Values: admin (Organization Admin), agent (Agent), owner (Owner).';

-- 2) Create organization_roles table
create table if not exists public.organization_roles (
  id int primary key,
  code public.organization_role_code unique not null,
  label text not null
);

-- Add table comment for documentation
comment on table public.organization_roles is 
  'Static lookup table for organization-level roles. Values: admin (Organization Admin), agent (Agent), owner (Owner). This table is read-only for regular client sessions.';

-- 3) Enable RLS on organization_roles
alter table public.organization_roles enable row level security;

-- 4) RLS policy: allow authenticated users to read roles
-- This assumes Supabase's default `authenticated` role. Adjust `to authenticated`
-- if your project uses a different role management approach.
drop policy if exists "Organization roles readable by authenticated users" on public.organization_roles;

create policy "Organization roles readable by authenticated users"
on public.organization_roles
for select
to authenticated
using (true);

-- 5) No insert/update/delete policies are defined.
--    Because RLS is enabled and no write policies exist,
--    regular client sessions CANNOT modify this table.
--    All data changes must happen through migrations or via service-role key.

-- 6) Seed initial roles (id, code, label)
insert into public.organization_roles (id, code, label) values
  (1, 'admin', 'Organization Admin'),
  (2, 'agent', 'Agent'),
  (3, 'owner', 'Owner')
on conflict (id) do nothing;

-- ============================================
-- DOWN MIGRATION (for rollback)
-- ============================================

-- Uncomment and use if you need to rollback this migration:
-- 
-- -- Drop RLS policies
-- drop policy if exists "Organization roles readable by authenticated users" on public.organization_roles;
-- 
-- -- Disable RLS
-- alter table public.organization_roles disable row level security;
-- 
-- -- Drop table
-- drop table if exists public.organization_roles;
-- 
-- -- Drop enum type
-- drop type if exists public.organization_role_code;

