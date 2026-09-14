create table if not exists public.user_preferences (
  user_id uuid primary key references auth.users(id) on delete cascade,
  platforms text[] not null default '{}',
  categories text[] not null default '{}',
  country text not null default 'BE',
  updated_at timestamptz not null default now()
);

alter table public.user_preferences enable row level security;

create policy user_preferences_select_own on public.user_preferences for select using (auth.uid() = user_id);
create policy user_preferences_insert_own on public.user_preferences for insert with check (auth.uid() = user_id);
create policy user_preferences_update_own on public.user_preferences for update using (auth.uid() = user_id);
