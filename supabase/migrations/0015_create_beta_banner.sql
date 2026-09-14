create table if not exists public.beta_banner (
  id text primary key default 'singleton',
  enabled boolean not null default false,
  message text not null default '',
  link_url text,
  link_label text,
  updated_at timestamptz not null default now()
);

insert into public.beta_banner (id, enabled, message) values ('singleton', false, '🚀 DROPS est actuellement en bêta publique.')
  on conflict (id) do nothing;

alter table public.beta_banner enable row level security;

create policy beta_banner_select_all on public.beta_banner for select using (true);
