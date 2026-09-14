-- DROPS — historique des prix des offres (V6)
-- A executer apres 0003_add_sync_duration.sql.

create table if not exists public.offer_price_history (
  id uuid primary key default gen_random_uuid(),
  offer_id text not null references public.offers (id) on delete cascade,
  original_price numeric,
  current_price numeric not null,
  captured_at timestamptz not null default now()
);

create index if not exists offer_price_history_offer_id_idx on public.offer_price_history (offer_id);
create index if not exists offer_price_history_captured_at_idx on public.offer_price_history (captured_at desc);

alter table public.offer_price_history enable row level security;

drop policy if exists offer_price_history_public_read on public.offer_price_history;
create policy offer_price_history_public_read
  on public.offer_price_history for select
  using (true);

-- Comme pour offers/sync_logs : seul le client serveur (cle service_role)
-- peut inserer, depuis src/lib/price-history-repository.ts.
