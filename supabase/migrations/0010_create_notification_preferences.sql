create table if not exists public.notification_preferences (
  user_id uuid primary key references auth.users(id) on delete cascade,
  notify_new_offers boolean not null default true,
  notify_epic_games boolean not null default true,
  notify_steam boolean not null default true,
  notify_expiring_soon boolean not null default true,
  notify_twitch_drops boolean not null default true,
  notify_prime_gaming boolean not null default true,
  updated_at timestamptz not null default now()
);

alter table public.notification_preferences enable row level security;

create policy notification_preferences_select_own on public.notification_preferences for select using (auth.uid() = user_id);
create policy notification_preferences_insert_own on public.notification_preferences for insert with check (auth.uid() = user_id);
create policy notification_preferences_update_own on public.notification_preferences for update using (auth.uid() = user_id);
