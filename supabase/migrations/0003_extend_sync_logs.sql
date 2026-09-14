-- DROPS — colonnes supplementaires pour sync_logs (V6)
-- A executer apres 0002_create_sync_logs.sql.

alter table public.sync_logs add column if not exists duration_ms integer;
alter table public.sync_logs add column if not exists offers_skipped integer not null default 0;
