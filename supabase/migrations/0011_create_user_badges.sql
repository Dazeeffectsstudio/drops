create table if not exists public.user_badges (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  badge_key text not null,
  earned_at timestamptz not null default now(),
  unique (user_id, badge_key)
);

alter table public.user_badges enable row level security;

create policy user_badges_select_own on public.user_badges for select using (auth.uid() = user_id);
