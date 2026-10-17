-- OrbitLink cloud scenarios: run once in the Supabase dashboard → SQL Editor.
-- Safe to re-run. Every user can only see and change their own rows.

create table if not exists public.scenarios (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null default auth.uid() references auth.users (id) on delete cascade,
  name        text not null check (char_length(name) between 1 and 120),
  data        jsonb not null check (pg_column_size(data) <= 5242880),  -- 5 MB per scenario
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index if not exists scenarios_user_updated_idx on public.scenarios (user_id, updated_at desc);

-- Row Level Security: no policy = no access, so anonymous visitors get nothing.
alter table public.scenarios enable row level security;

-- Only signed-in users get table privileges at all; RLS then narrows them to own rows.
revoke all on public.scenarios from anon, authenticated;
grant select, insert, update, delete on public.scenarios to authenticated;

drop policy if exists "scenarios: read own"   on public.scenarios;
drop policy if exists "scenarios: insert own" on public.scenarios;
drop policy if exists "scenarios: update own" on public.scenarios;
drop policy if exists "scenarios: delete own" on public.scenarios;

create policy "scenarios: read own"   on public.scenarios for select to authenticated using ((select auth.uid()) = user_id);
create policy "scenarios: insert own" on public.scenarios for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "scenarios: update own" on public.scenarios for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "scenarios: delete own" on public.scenarios for delete to authenticated using ((select auth.uid()) = user_id);

-- Keep updated_at current on every change.
create or replace function public.scenarios_touch() returns trigger
language plpgsql set search_path = '' as $$
begin
  new.updated_at := now();
  new.user_id := old.user_id;  -- rows can never be moved to another account
  return new;
end $$;

drop trigger if exists scenarios_touch on public.scenarios;
create trigger scenarios_touch before update on public.scenarios
  for each row execute function public.scenarios_touch();

-- ---------------------------------------------------------------------------
-- Accounts (no public sign-up: Authentication → Sign In / Providers → turn OFF
-- "Allow new users to sign up"). Create users in Authentication → Users → Add user
-- with "Auto Confirm User" ticked. A username-only account such as "guest" is
-- created with the e-mail  guest@linkbudget.local  and signs in as just "guest".
--
-- Roles live in app_metadata, which users cannot edit themselves. Example
-- (replace the e-mail addresses, then run):
--
--   update auth.users set raw_app_meta_data = raw_app_meta_data || '{"role":"admin"}'
--    where email = 'you@example.com';
--   update auth.users set raw_app_meta_data = raw_app_meta_data || '{"role":"guest"}'
--    where email = 'guest@linkbudget.local';
--
-- A role change takes effect at the user's next sign-in.
