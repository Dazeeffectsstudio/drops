import { createSupabaseServerClient } from "@/lib/supabase/server-client";
import { supabaseAdmin } from "@/lib/supabase/admin-client";
import { mapRowToOffer } from "@/lib/offers-repository";
import type { NotificationLogRow, OfferRow } from "@/types/database";
import type { Offer } from "@/types/offer";

export type NotificationType = "new_offer" | "offer_started" | "offer_ending_soon_24h" | "offer_ending_soon_2h" | "test" | "referral_signup" | "referral_confirmed" | "referral_reward";
export type NotificationProvider = "email" | "push" | "in_app";
export type NotificationStatus = "sent" | "skipped" | "error";

export type NotificationLogEntry = {
  id: string;
  userId: string;
  offerId: string | null;
  type: NotificationType;
  provider: NotificationProvider;
  status: NotificationStatus;
  sentAt: string;
  readAt: string | null;
  errorMessage: string | null;
};

function mapLog(row: NotificationLogRow): NotificationLogEntry {
  return {
    id: row.id,
    userId: row.user_id,
    offerId: row.offer_id,
    type: row.type as NotificationType,
    provider: row.provider as NotificationProvider,
    status: row.status as NotificationStatus,
    sentAt: row.sent_at,
    readAt: row.read_at,
    errorMessage: row.error_message,
  };
}

// Empêche de renvoyer deux fois la même notification (même utilisateur,
// même offre, même type, même canal) — appelé avant chaque envoi par
// src/lib/notification-dispatch.ts.
export async function hasNotificationBeenSent(userId: string, offerId: string, type: NotificationType, provider: NotificationProvider): Promise<boolean> {
  if (!supabaseAdmin) return false;
  const { data } = await supabaseAdmin
    .from("notification_logs")
    .select("id")
    .eq("user_id", userId)
    .eq("offer_id", offerId)
    .eq("type", type)
    .eq("provider", provider)
    .eq("status", "sent")
    .maybeSingle();
  return Boolean(data);
}

export async function insertNotificationLog(entry: {
  userId: string;
  offerId: string | null;
  type: NotificationType;
  provider: NotificationProvider;
  status: NotificationStatus;
  errorMessage?: string | null;
}): Promise<void> {
  if (!supabaseAdmin) return;
  await supabaseAdmin.from("notification_logs").insert({
    user_id: entry.userId,
    offer_id: entry.offerId,
    type: entry.type,
    provider: entry.provider,
    status: entry.status,
    error_message: entry.errorMessage ?? null,
  });
}

export type MyNotificationLogEntry = NotificationLogEntry & { offer: Offer | null };

export async function getMyNotificationLogs(): Promise<MyNotificationLogEntry[]> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return [];
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from("notification_logs")
    .select("*, offers(*)")
    .eq("user_id", user.id)
    .eq("status", "sent")
    .order("sent_at", { ascending: false })
    .limit(100);
  if (error || !data) return [];

  return data.map((row) => ({
    ...mapLog(row as unknown as NotificationLogRow),
    offer: row.offers ? mapRowToOffer(row.offers as unknown as OfferRow) : null,
  }));
}

export async function markNotificationLogRead(id: string): Promise<void> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return;
  await supabase.from("notification_logs").update({ read_at: new Date().toISOString() }).eq("id", id);
}

export async function markAllNotificationLogsRead(): Promise<void> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return;
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;
  await supabase.from("notification_logs").update({ read_at: new Date().toISOString() }).eq("user_id", user.id).is("read_at", null);
}

export async function getMyUnreadNotificationCount(): Promise<number> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return 0;
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return 0;
  const { count } = await supabase
    .from("notification_logs")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id)
    .eq("status", "sent")
    .is("read_at", null);
  return count ?? 0;
}

export type NotificationLogStats = {
  emailsSentToday: number;
  pushSentToday: number;
  successRate: number;
  failureRate: number;
  recent: NotificationLogEntry[];
  recentErrors: NotificationLogEntry[];
};

// Réservé au dashboard admin (/admin/notifications) : statistiques toutes
// plateformes confondues, nécessite le client service_role.
export async function getNotificationLogStats(): Promise<NotificationLogStats> {
  const empty: NotificationLogStats = { emailsSentToday: 0, pushSentToday: 0, successRate: 0, failureRate: 0, recent: [], recentErrors: [] };
  if (!supabaseAdmin) return empty;

  const since = new Date();
  since.setHours(0, 0, 0, 0);
  const { data, error } = await supabaseAdmin
    .from("notification_logs")
    .select("*")
    .gte("sent_at", since.toISOString())
    .order("sent_at", { ascending: false })
    .limit(500);
  if (error || !data) return empty;

  const rows = data.map((row) => mapLog(row));
  const emailsSentToday = rows.filter((r) => r.provider === "email" && r.status === "sent").length;
  const pushSentToday = rows.filter((r) => r.provider === "push" && r.status === "sent").length;
  const attempted = rows.filter((r) => r.status === "sent" || r.status === "error");
  const successRate = attempted.length > 0 ? Math.round((attempted.filter((r) => r.status === "sent").length / attempted.length) * 100) : 100;

  return {
    emailsSentToday,
    pushSentToday,
    successRate,
    failureRate: 100 - successRate,
    recent: rows.slice(0, 20),
    recentErrors: rows.filter((r) => r.status === "error").slice(0, 20),
  };
}
