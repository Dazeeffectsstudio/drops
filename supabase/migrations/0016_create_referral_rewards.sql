create table if not exists public.referral_rewards (
  id uuid primary key default gen_random_uuid(),
  referrer_id uuid not null references auth.users(id) on delete cascade,
  reward_key text not null,
  unlocked_at timestamptz not null default now(),
  unique (referrer_id, reward_key)
);

create index if not exists referral_rewards_referrer_id_idx on public.referral_rewards(referrer_id);

alter table public.referral_rewards enable row level security;

create policy referral_rewards_select_own on public.referral_rewards for select using (auth.uid() = referrer_id);
