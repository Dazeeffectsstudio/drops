create table if not exists public.feedback (
  id uuid primary key default gen_random_uuid(),
  type text not null,
  message text not null,
  user_id uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  status text not null default 'new'
);

alter table public.feedback enable row level security;

create policy feedback_insert_anyone on public.feedback for insert with check (user_id is null or auth.uid() = user_id);
