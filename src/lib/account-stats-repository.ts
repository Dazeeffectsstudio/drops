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

export type SavingsStats = {
  totalValue: number;
  gamesCount: number;
  dlcCount: number;
  twitchDropsCount: number;
  monthly: Array<{ label: string; value: number }>;
};

const emptySavings: SavingsStats = { totalValue: 0, gamesCount: 0, dlcCount: 0, twitchDropsCount: 0, monthly: [] };

// "Tes économies" sur /account — calculée à partir des favoris réels (avec
// leur date d'ajout), pas d'un compteur de clics "récupérer" qui n'existe
// pas côté base (voir la note honnête équivalente dans /admin/growth) : la
// valeur représente ce que l'utilisateur a suivi/mis de côté sur DROPS.
export async function getMySavingsStats(): Promise<SavingsStats> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return emptySavings;
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return emptySavings;

  const { data } = await supabase.from("favorites").select("created_at, offers(original_price, category)").eq("user_id", user.id);
  const rows = data ?? [];

  let totalValue = 0;
  let gamesCount = 0;
  let dlcCount = 0;
  let twitchDropsCount = 0;
  const monthTotals = new Map<string, number>();

  for (const row of rows) {
    const offer = row.offers as unknown as { original_price: number | string | null; category: string } | null;
    if (!offer) continue;
    const value = offer.original_price === null ? 0 : Number(offer.original_price);
    totalValue += value;
    if (offer.category === "JEUX") gamesCount += 1;
    if (offer.category === "DLC") dlcCount += 1;
    if (offer.category === "TWITCH DROPS") twitchDropsCount += 1;

    const monthKey = row.created_at.slice(0, 7); // "2026-09"
    monthTotals.set(monthKey, (monthTotals.get(monthKey) ?? 0) + value);
  }

  const now = new Date();
  const monthly: Array<{ label: string; value: number }> = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    monthly.push({ label: new Intl.DateTimeFormat("fr-BE", { month: "short" }).format(d), value: monthTotals.get(key) ?? 0 });
  }

  return { totalValue, gamesCount, dlcCount, twitchDropsCount, monthly };
}
