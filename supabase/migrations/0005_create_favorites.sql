create table if not exists public.favorites (
  user_id uuid not null references auth.users(id) on delete cascade,
  offer_id text not null references public.offers(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, offer_id)
);

alter table public.favorites enable row level security;

create policy favorites_select_own on public.favorites for select using (auth.uid() = user_id);
create policy favorites_insert_own on public.favorites for insert with check (auth.uid() = user_id);
create policy favorites_delete_own on public.favorites for delete using (auth.uid() = user_id);
