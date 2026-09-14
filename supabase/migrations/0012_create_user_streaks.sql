create table if not exists public.user_streaks (
  user_id uuid primary key references auth.users(id) on delete cascade,
  current_streak integer not null default 0,
  longest_streak integer not null default 0,
  last_visit_date date,
  updated_at timestamptz not null default now()
);

alter table public.user_streaks enable row level security;

create policy user_streaks_select_own on public.user_streaks for select using (auth.uid() = user_id);
