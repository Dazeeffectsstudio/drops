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
  status: "success" | "error";
  message: string | null;
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
    status: row.status,
    message: row.message,
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
// synchronisation de chaque provider.
export async function getRecentSyncLogs(limit = 50): Promise<SyncLogEntry[]> {
  if (!supabasePublic) return [];
  const { data, error } = await supabasePublic
    .from("sync_logs")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) { console.error("[sync-logs-repository] getRecentSyncLogs:", error.message); return []; }
  return (data ?? []).map(mapRow);
}
