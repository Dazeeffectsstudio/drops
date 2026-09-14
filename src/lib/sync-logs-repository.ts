import { supabaseAdmin } from "@/lib/supabase/admin-client";
import { supabasePublic } from "@/lib/supabase/public-client";
import type { SyncLogInsert, SyncLogRow } from "@/types/database";

export type SyncLogEntry = {
  id: string;
  provider: string;
  offersFound: number;
  offersCreated: number;
  offersUpdated: number;
  offersExpired: number;
  offersSkipped: number;
  status: "success" | "error";
  message: string | null;
  durationMs: number | null;
  createdAt: string;
};

function mapRow(row: SyncLogRow): SyncLogEntry {
  return {
    id: row.id,
    provider: row.provider,
    offersFound: row.offers_found,
    offersCreated: row.offers_created,
    offersUpdated: row.offers_updated,
    offersExpired: row.offers_expired,
    offersSkipped: row.offers_skipped,
    status: row.status,
    message: row.message,
    durationMs: row.duration_ms,
    createdAt: row.created_at,
  };
}

export async function insertSyncLog(entry: SyncLogInsert): Promise<void> {
  if (!supabaseAdmin) return;
  const { error } = await supabaseAdmin.from("sync_logs").insert(entry);
  if (error) console.error("[sync-logs-repository] insertSyncLog:", error.message);
}

// Renvoie les journaux les plus récents (tous providers confondus), triés
// du plus récent au plus ancien. Le dashboard en déduit la dernière
// synchronisation de chaque provider, et l'historique complet de
// /admin/sync.
export async function getLastSyncForProvider(providerKey: string): Promise<SyncLogEntry | null> {
  if (!supabasePublic) return null;
  const { data, error } = await supabasePublic
    .from("sync_logs")
    .select("*")
    .eq("provider", providerKey)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error || !data) return null;
  return mapRow(data);
}

export async function getRecentSyncLogs(limit = 100): Promise<SyncLogEntry[]> {
  if (!supabasePublic) return [];
  const { data, error } = await supabasePublic
    .from("sync_logs")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) { console.error("[sync-logs-repository] getRecentSyncLogs:", error.message); return []; }
  return (data ?? []).map(mapRow);
}
