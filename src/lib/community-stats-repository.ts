import { supabaseAdmin } from "@/lib/supabase/admin-client";

export type LeaderboardEntry = { label: string; value: number };
export type CommunityStats = {
  topSavers: LeaderboardEntry[];
  topStreaks: LeaderboardEntry[];
  topCollectors: LeaderboardEntry[];
  popularPlatforms: LeaderboardEntry[];
};

const empty: CommunityStats = { topSavers: [], topStreaks: [], topCollectors: [], popularPlatforms: [] };

// Anonymise systématiquement : jamais d'email ni de pseudo réel affiché
// ici, uniquement un identifiant court dérivé de l'id du compte — voir
// /community. Passe par le client service_role car ce sont des agrégats
// tous comptes confondus, impossibles à lire avec les policies RLS "select own".
function anonymize(userId: string): string {
  return `Joueur #${userId.slice(0, 4).toUpperCase()}`;
}

export async function getCommunityStats(): Promise<CommunityStats> {
  if (!supabaseAdmin) return empty;

  const [{ data: favs }, { data: streaks }] = await Promise.all([
    supabaseAdmin.from("favorites").select("user_id, offers(original_price, store)"),
    supabaseAdmin.from("user_streaks").select("user_id, longest_streak").order("longest_streak", { ascending: false }).limit(10),
  ]);

  const savedByUser = new Map<string, number>();
  const countByUser = new Map<string, number>();
  const platformCounts = new Map<string, number>();

  for (const row of favs ?? []) {
    const offer = row.offers as unknown as { original_price: number | null; store: string } | null;
    countByUser.set(row.user_id, (countByUser.get(row.user_id) ?? 0) + 1);
    if (offer?.original_price) savedByUser.set(row.user_id, (savedByUser.get(row.user_id) ?? 0) + offer.original_price);
    if (offer?.store) platformCounts.set(offer.store, (platformCounts.get(offer.store) ?? 0) + 1);
  }

  const topSavers = [...savedByUser.entries()].sort((a, b) => b[1] - a[1]).slice(0, 10).map(([userId, value]) => ({ label: anonymize(userId), value: Math.round(value * 100) / 100 }));
  const topCollectors = [...countByUser.entries()].sort((a, b) => b[1] - a[1]).slice(0, 10).map(([userId, value]) => ({ label: anonymize(userId), value }));
  const topStreaks = (streaks ?? []).filter((row) => row.longest_streak > 0).map((row) => ({ label: anonymize(row.user_id), value: row.longest_streak }));
  const popularPlatforms = [...platformCounts.entries()].sort((a, b) => b[1] - a[1]).map(([store, value]) => ({ label: store, value }));

  return { topSavers, topStreaks, topCollectors, popularPlatforms };
}
