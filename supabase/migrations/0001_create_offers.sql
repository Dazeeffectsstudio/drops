-- DROPS — table des offres (V4)
-- A executer dans le SQL editor de ton projet Supabase, ou via `supabase db push`.

create table if not exists public.offers (
  id text primary key,
  title text not null,
  description text not null,
  platform text not null check (platform in ('PC', 'PLAYSTATION', 'XBOX', 'AUTRES')),
  store text not null check (store in ('Steam', 'Epic Games', 'PlayStation', 'Xbox', 'Twitch', 'Roblox', 'Prime Gaming')),
  category text not null check (category in ('JEUX', 'ITEMS', 'TWITCH DROPS', 'DLC', 'PRIME GAMING', 'WEEK-END GRATUIT')),
  image text not null,
  original_price numeric,
  current_price numeric not null default 0,
  starts_at timestamptz,
  expires_at timestamptz not null,
  url text not null,
  accent text not null default 'lime' check (accent in ('lime', 'violet', 'blue', 'orange')),
  featured boolean not null default false,
  trending boolean not null default false,
  is_new boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists offers_store_idx on public.offers (store);
create index if not exists offers_category_idx on public.offers (category);
create index if not exists offers_expires_at_idx on public.offers (expires_at);

-- Garde updated_at a jour automatiquement.
create or replace function public.offers_set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists offers_set_updated_at on public.offers;
create trigger offers_set_updated_at
  before update on public.offers
  for each row execute function public.offers_set_updated_at();

-- Le catalogue est public en lecture (le site affiche les offres sans compte).
alter table public.offers enable row level security;

drop policy if exists "Offers are readable by everyone" on public.offers;
create policy "Offers are readable by everyone"
  on public.offers for select
  using (true);

-- Volontairement aucune policy d'ecriture (insert/update/delete) n'est
-- exposee ici : le dashboard /admin ecrit via un client serveur utilisant
-- la cle "service role", qui contourne RLS. Voir
-- src/lib/supabase/admin-client.ts. Quand une authentification admin sera
-- branchee (voir src/lib/admin-auth.ts), des policies dediees pourront
-- remplacer ce contournement.
