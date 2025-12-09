-- Migration: Create reusable set_updated_at trigger function
-- Created: 2025-12-09
-- Description: Creates a reusable trigger function for automatically updating
--              the updated_at timestamp column on table updates.
--              This function can be used by any table that needs automatic timestamp updates.
-- Purpose: Provides a standardized way to automatically update the updated_at column
--          whenever a row is updated, ensuring data consistency across all tables.

-- ============================================
-- UP MIGRATION
-- ============================================

-- Create reusable set_updated_at trigger function
-- This function can be reused by other tables in the future
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Add comment for documentation
comment on function public.set_updated_at() is 
  'Trigger function that automatically updates the updated_at column to the current timestamp. Use this function with BEFORE UPDATE triggers on tables with an updated_at timestamptz column.';

-- ============================================
-- DOWN MIGRATION (for rollback)
-- ============================================

-- Uncomment and use if you need to rollback this migration:
-- 
-- -- Drop function
-- drop function if exists public.set_updated_at();
-- 
-- Note: Only drop this function if no other tables are using it.
-- Check for dependent triggers first:
-- select tgname, tgrelid::regclass 
-- from pg_trigger 
-- where tgname like '%updated_at%' and tgenabled = 'O';
