create table if not exists public.referrals (
  id uuid primary key default gen_random_uuid(),
  referrer_id uuid not null references auth.users(id) on delete cascade,
  referred_id uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  signed_up_at timestamptz,
  unique (referred_id)
);

create index if not exists referrals_referrer_id_idx on public.referrals(referrer_id);

alter table public.referrals enable row level security;

create policy referrals_select_own on public.referrals for select using (auth.uid() = referrer_id);
