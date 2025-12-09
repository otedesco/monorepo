-- Migration: Create profiles table with RLS policies
-- Created: 2025-12-09
-- Description: Creates a profiles table that links 1:1 with auth.users,
--              with RLS policies ensuring users can only access their own profile.
-- Purpose: Store user profile information (full name, avatar, locale, timezone)
--          that extends the base authentication user data.
-- Affected tables: profiles (new table)
-- Dependencies: Requires set_updated_at() function from migration 20251209105645

-- ============================================
-- UP MIGRATION
-- ============================================

-- Note: This migration depends on the set_updated_at() function
-- created in migration: 20251209105645_create_set_updated_at_function.sql

-- 1. Create profiles table
-- Links 1:1 with auth.users via id (same UUID)
-- Deleting an auth user will cascade delete the profile
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  avatar_url text,
  locale text not null default 'en',
  timezone text not null default 'UTC',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Add table comment describing its purpose
comment on table public.profiles is 
  'User profiles that extend authentication data. Each profile is linked 1:1 with auth.users via id. Stores user preferences and display information such as full name, avatar URL, locale, and timezone.';

-- 2. Add indexes for potential filtering
-- These indexes improve query performance when filtering by locale or timezone
create index if not exists idx_profiles_locale on public.profiles (locale);
create index if not exists idx_profiles_timezone on public.profiles (timezone);

-- 3. Add updated_at trigger
-- Automatically updates the updated_at column whenever a row is updated
-- Drops existing trigger if it exists (idempotent)
drop trigger if exists profiles_set_updated_at on public.profiles;

create trigger profiles_set_updated_at
  before update on public.profiles
  for each row
  execute procedure public.set_updated_at();

-- 4. Enable Row Level Security
-- RLS is required to ensure users can only access their own profile
alter table public.profiles enable row level security;

-- 5. RLS Policies
-- Users can only access their own profile (where id = auth.uid())
-- All policies are scoped to authenticated users only

-- Policy: Authenticated users can view their own profile
-- Rationale: Users need to read their own profile data
create policy "Authenticated users can view their own profile"
  on public.profiles
  for select
  to authenticated
  using ((select auth.uid()) = id);

-- Policy: Authenticated users can insert their own profile
-- Rationale: New users need to create their profile after signup
create policy "Authenticated users can insert their own profile"
  on public.profiles
  for insert
  to authenticated
  with check ((select auth.uid()) = id);

-- Policy: Authenticated users can update their own profile
-- Rationale: Users need to update their profile information (name, avatar, preferences)
create policy "Authenticated users can update their own profile"
  on public.profiles
  for update
  to authenticated
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

-- Note: No DELETE policy is added - users cannot delete their own profile
-- Profile deletion is handled via CASCADE when auth.users is deleted
-- This ensures data integrity and prevents orphaned profile records

-- ============================================
-- DOWN MIGRATION (for rollback)
-- ============================================

-- Uncomment and use if you need to rollback this migration:
-- 
-- -- Drop RLS policies
-- drop policy if exists "Authenticated users can update their own profile" on public.profiles;
-- drop policy if exists "Authenticated users can insert their own profile" on public.profiles;
-- drop policy if exists "Authenticated users can view their own profile" on public.profiles;
-- 
-- -- Disable RLS
-- alter table public.profiles disable row level security;
-- 
-- -- Drop trigger
-- drop trigger if exists profiles_set_updated_at on public.profiles;
-- 
-- -- Drop indexes
-- drop index if exists idx_profiles_timezone;
-- drop index if exists idx_profiles_locale;
-- 
-- -- Drop table
-- drop table if exists public.profiles;
-- 
-- -- Note: We don't drop set_updated_at() function as it is created in a separate migration
-- -- and may be used by other tables
