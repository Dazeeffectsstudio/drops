import { createSupabaseServerClient } from "@/lib/supabase/server-client";

export type AccountActivity = {
  favoritesCount: number;
  notificationsCount: number;
  topPlatform: string | null;
  topCategory: string | null;
};

function topKey(counts: Map<string, number>): string | null {
  let best: string | null = null;
  let bestCount = 0;
  for (const [key, count] of counts) if (count > bestCount) { best = key; bestCount = count; }
  return best;
}

// "Ton activité DROPS" sur /account — calculée à partir des vraies données
// (favoris + abonnements), pas des préférences déclarées, pour refléter ce
// que l'utilisateur fait réellement.
export async function getMyActivity(): Promise<AccountActivity> {
  const empty: AccountActivity = { favoritesCount: 0, notificationsCount: 0, topPlatform: null, topCategory: null };
  const supabase = await createSupabaseServerClient();
  if (!supabase) return empty;
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return empty;

  const [{ data: favs }, { count: notifCount }] = await Promise.all([
    supabase.from("favorites").select("offer_id, offers(store, category)").eq("user_id", user.id),
    supabase.from("notification_subscriptions").select("id", { count: "exact", head: true }).eq("user_id", user.id),
  ]);

  const platformCounts = new Map<string, number>();
  const categoryCounts = new Map<string, number>();
  for (const row of favs ?? []) {
    const offer = row.offers as unknown as { store: string; category: string } | null;
    if (!offer) continue;
    platformCounts.set(offer.store, (platformCounts.get(offer.store) ?? 0) + 1);
    categoryCounts.set(offer.category, (categoryCounts.get(offer.category) ?? 0) + 1);
  }

  return {
    favoritesCount: (favs ?? []).length,
    notificationsCount: notifCount ?? 0,
    topPlatform: topKey(platformCounts),
    topCategory: topKey(categoryCounts),
  };
}
