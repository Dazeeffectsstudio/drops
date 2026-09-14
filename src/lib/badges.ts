import { createSupabaseServerClient } from "@/lib/supabase/server-client";
import { supabaseAdmin } from "@/lib/supabase/admin-client";

export type BadgeKey = "first_favorite" | "first_notification" | "epic_hunter" | "collector" | "loyal";

export type BadgeDefinition = { key: BadgeKey; label: string; description: string; icon: string };

export const BADGES: BadgeDefinition[] = [
  { key: "first_favorite", label: "Premier favori", description: "Tu as ajouté ta première offre en favori.", icon: "⭐" },
  { key: "first_notification", label: "Première alerte", description: "Tu as activé ta première notification « Me prévenir ».", icon: "🔔" },
  { key: "epic_hunter", label: "Chasseur Epic", description: "10 offres Epic Games ajoutées en favori.", icon: "🎯" },
  { key: "collector", label: "Collectionneur", description: "50 offres ajoutées en favori.", icon: "🏆" },
  { key: "loyal", label: "Fidèle", description: "30 jours consécutifs sur DROPS.", icon: "🔥" },
];

// Appelée après chaque action pertinente (favori, abonnement, visite) —
// vérifie les seuils et attribue les nouveaux badges mérités. Passe par le
// client service_role car elle a besoin de compter sur plusieurs tables
// sans être limitée par les policies RLS "select own" de chacune.
// `unique(user_id, badge_key)` empêche tout doublon même en cas d'appels
// concurrents.
export async function checkAndAwardBadges(userId: string): Promise<BadgeKey[]> {
  if (!supabaseAdmin) return [];

  const [{ count: totalFavorites }, { data: epicFavorites }, { count: notifCount }, { data: streakRow }, { data: existingBadges }] = await Promise.all([
    supabaseAdmin.from("favorites").select("offer_id", { count: "exact", head: true }).eq("user_id", userId),
    supabaseAdmin.from("favorites").select("offer_id, offers(store)").eq("user_id", userId),
    supabaseAdmin.from("notification_subscriptions").select("id", { count: "exact", head: true }).eq("user_id", userId),
    supabaseAdmin.from("user_streaks").select("longest_streak").eq("user_id", userId).maybeSingle(),
    supabaseAdmin.from("user_badges").select("badge_key").eq("user_id", userId),
  ]);

  const already = new Set((existingBadges ?? []).map((row) => row.badge_key));
  const epicCount = (epicFavorites ?? []).filter((row) => (row.offers as unknown as { store: string } | null)?.store === "Epic Games").length;
  const longestStreak = streakRow?.longest_streak ?? 0;

  const toAward: BadgeKey[] = [];
  if ((totalFavorites ?? 0) >= 1 && !already.has("first_favorite")) toAward.push("first_favorite");
  if ((notifCount ?? 0) >= 1 && !already.has("first_notification")) toAward.push("first_notification");
  if (epicCount >= 10 && !already.has("epic_hunter")) toAward.push("epic_hunter");
  if ((totalFavorites ?? 0) >= 50 && !already.has("collector")) toAward.push("collector");
  if (longestStreak >= 30 && !already.has("loyal")) toAward.push("loyal");

  if (toAward.length > 0) {
    await supabaseAdmin.from("user_badges").insert(toAward.map((key) => ({ user_id: userId, badge_key: key })));
  }
  return toAward;
}

export async function getMyBadges(): Promise<BadgeKey[]> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return [];
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];
  const { data } = await supabase.from("user_badges").select("badge_key").eq("user_id", user.id);
  return (data ?? []).map((row) => row.badge_key as BadgeKey);
}
