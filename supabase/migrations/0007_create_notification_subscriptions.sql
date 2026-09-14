create table if not exists public.notification_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  offer_id text not null references public.offers(id) on delete cascade,
  created_at timestamptz not null default now(),
  notified_at timestamptz,
  read_at timestamptz,
  unique (user_id, offer_id)
);

alter table public.notification_subscriptions enable row level security;

create policy notification_subscriptions_select_own on public.notification_subscriptions for select using (auth.uid() = user_id);
create policy notification_subscriptions_insert_own on public.notification_subscriptions for insert with check (auth.uid() = user_id);
create policy notification_subscriptions_update_own on public.notification_subscriptions for update using (auth.uid() = user_id);
create policy notification_subscriptions_delete_own on public.notification_subscriptions for delete using (auth.uid() = user_id);
