import { checkAndAwardBadges } from "@/lib/badges";
import { mapRowToOffer } from "@/lib/offers-repository";
import { createSupabaseServerClient } from "@/lib/supabase/server-client";
import { supabaseAdmin } from "@/lib/supabase/admin-client";
import type { OfferRow } from "@/types/database";
import type { Offer } from "@/types/offer";

export type MyNotificationSubscription = {
  id: string;
  offerId: string;
  createdAt: string;
  notifiedAt: string | null;
  readAt: string | null;
  offer: Offer | null;
};

// Enregistre un abonnement "Me prévenir" pour l'utilisateur connecté.
// `alreadySubscribed` permet d'empêcher les doublons côté UI sans traiter
// ça comme une erreur.
export async function subscribeToOffer(offerId: string): Promise<{ error?: string; alreadySubscribed?: boolean }> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return { error: "Supabase n'est pas configuré." };
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Connecte-toi pour activer ce rappel." };

  const { data: existing } = await supabase.from("notification_subscriptions").select("id").eq("user_id", user.id).eq("offer_id", offerId).maybeSingle();
  if (existing) return { alreadySubscribed: true };

  const { error } = await supabase.from("notification_subscriptions").insert({ user_id: user.id, offer_id: offerId });
  if (!error) await checkAndAwardBadges(user.id);
  return { error: error?.message };
}

export async function getMySubscribedOfferIds(): Promise<string[]> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return [];
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];
  const { data, error } = await supabase.from("notification_subscriptions").select("offer_id").eq("user_id", user.id);
  if (error || !data) return [];
  return data.map((row) => row.offer_id);
}

export async function getMySubscriptions(): Promise<MyNotificationSubscription[]> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return [];
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from("notification_subscriptions")
    .select("id, offer_id, created_at, notified_at, read_at, offers(*)")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });
  if (error || !data) return [];

  return data.map((row) => ({
    id: row.id,
    offerId: row.offer_id,
    createdAt: row.created_at,
    notifiedAt: row.notified_at,
    readAt: row.read_at,
    offer: row.offers ? mapRowToOffer(row.offers as unknown as OfferRow) : null,
  }));
}

export async function markAllNotificationsRead(): Promise<{ error?: string }> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return {};
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return {};
  const { error } = await supabase
    .from("notification_subscriptions")
    .update({ read_at: new Date().toISOString() })
    .eq("user_id", user.id)
    .not("notified_at", "is", null)
    .is("read_at", null);
  return { error: error?.message };
}

export type NotificationAdminStats = {
  totalSubscriptions: number;
  mostFollowedPlatforms: Array<{ store: string; count: number }>;
};

// Réservé au dashboard admin : passe par le client service_role car il doit
// voir les abonnements de tous les comptes, pas seulement les siens (les
// policies RLS de notification_subscriptions ne l'autoriseraient pas sinon).
export async function getNotificationSubscriptionStats(): Promise<NotificationAdminStats> {
  if (!supabaseAdmin) return { totalSubscriptions: 0, mostFollowedPlatforms: [] };
  const { data, error } = await supabaseAdmin.from("notification_subscriptions").select("offer_id, offers(store)");
  if (error || !data) return { totalSubscriptions: 0, mostFollowedPlatforms: [] };

  const counts = new Map<string, number>();
  for (const row of data) {
    const store = (row.offers as unknown as { store: string } | null)?.store;
    if (!store) continue;
    counts.set(store, (counts.get(store) ?? 0) + 1);
  }
  const mostFollowedPlatforms = Array.from(counts.entries())
    .map(([store, count]) => ({ store, count }))
    .sort((a, b) => b.count - a.count);

  return { totalSubscriptions: data.length, mostFollowedPlatforms };
}
