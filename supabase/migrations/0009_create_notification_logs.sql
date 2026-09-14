create table if not exists public.notification_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  offer_id text references public.offers(id) on delete set null,
  type text not null,
  provider text not null,
  status text not null,
  sent_at timestamptz not null default now(),
  read_at timestamptz,
  error_message text
);

create index if not exists notification_logs_user_id_idx on public.notification_logs(user_id);
create index if not exists notification_logs_sent_at_idx on public.notification_logs(sent_at desc);

alter table public.notification_logs enable row level security;

create policy notification_logs_select_own on public.notification_logs for select using (auth.uid() = user_id);
create policy notification_logs_update_own on public.notification_logs for update using (auth.uid() = user_id);
