-- DROPS — table des journaux de synchronisation (V5)
-- A executer dans le SQL editor de ton projet Supabase, apres
-- 0001_create_offers.sql.

create table if not exists public.sync_logs (
  id uuid primary key default gen_random_uuid(),
  provider text not null,
  offers_found integer not null default 0,
  offers_created integer not null default 0,
  offers_updated integer not null default 0,
  offers_expired integer not null default 0,
  status text not null check (status in ('success', 'error')),
  message text,
  created_at timestamptz not null default now()
);

create index if not exists sync_logs_created_at_idx on public.sync_logs (created_at desc);
create index if not exists sync_logs_provider_idx on public.sync_logs (provider);

alter table public.sync_logs enable row level security;

drop policy if exists sync_logs_public_read on public.sync_logs;
create policy sync_logs_public_read
  on public.sync_logs for select
  using (true);

-- Comme pour `offers`, aucune policy d'ecriture n'est exposee : seul le
-- client serveur (cle service_role, voir src/lib/supabase/admin-client.ts)
-- peut inserer des lignes, depuis src/lib/sync-offers.ts.
