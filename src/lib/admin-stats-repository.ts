import { isOfferActive } from "@/lib/offers";
import { mapRowToOffer } from "@/lib/offers-repository";
import { supabaseAdmin } from "@/lib/supabase/admin-client";
import type { OfferRow } from "@/types/database";

export type AdminStats = {
  activeOffersCount: number;
  totalOffersValue: number;
  mostPopularPlatform: string | null;
  usersWithFavoritesCount: number;
  totalFavoritesCount: number;
  activeNotificationsCount: number;
  favoritesByDay7: number[];
  favoritesByDay30: number[];
};

const empty: AdminStats = {
  activeOffersCount: 0,
  totalOffersValue: 0,
  mostPopularPlatform: null,
  usersWithFavoritesCount: 0,
  totalFavoritesCount: 0,
  activeNotificationsCount: 0,
  favoritesByDay7: new Array(7).fill(0),
  favoritesByDay30: new Array(30).fill(0),
};

function bucketByDay(dates: string[], days: number): number[] {
  const buckets = new Array(days).fill(0);
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  for (const iso of dates) {
    const diffDays = Math.floor((todayStart.getTime() - new Date(iso).setHours(0, 0, 0, 0)) / 86_400_000);
    const index = days - 1 - diffDays;
    if (index >= 0 && index < days) buckets[index] += 1;
  }
  return buckets;
}

// Réservé à /admin/stats — nécessite le client service_role car il agrège
// les favoris/notifications de TOUT LE MONDE (RLS limite chacun aux
// siennes). "Utilisateurs ayant récupéré une offre" est calculé à partir
// des favoris (le seul signal réellement stocké en base — voir la note
// équivalente dans account-stats-repository.ts, aucun clic "RÉCUPÉRER"
// n'est journalisé côté serveur).
export async function getAdminStats(): Promise<AdminStats> {
  if (!supabaseAdmin) return empty;

  const [{ data: offerRows }, { data: favoriteRows }, { count: activeNotificationsCount }] = await Promise.all([
    supabaseAdmin.from("offers").select("*"),
    supabaseAdmin.from("favorites").select("user_id, created_at, offers(store)"),
    supabaseAdmin.from("notification_subscriptions").select("id", { count: "exact", head: true }),
  ]);

  const offers = (offerRows ?? []).map((row) => mapRowToOffer(row as OfferRow));
  const now = Date.now();
  const activeOffers = offers.filter((offer) => isOfferActive(offer, now));
  const totalOffersValue = activeOffers.reduce((sum, offer) => sum + (offer.originalPrice ?? 0), 0);

  const favorites = favoriteRows ?? [];
  const platformCounts = new Map<string, number>();
  const uniqueUsers = new Set<string>();
  for (const row of favorites) {
    uniqueUsers.add(row.user_id);
    const offer = row.offers as unknown as { store: string } | null;
    if (offer) platformCounts.set(offer.store, (platformCounts.get(offer.store) ?? 0) + 1);
  }
  let mostPopularPlatform: string | null = null;
  let topCount = 0;
  for (const [store, count] of platformCounts) if (count > topCount) { mostPopularPlatform = store; topCount = count; }

  const favoriteDates = favorites.map((row) => row.created_at);

  return {
    activeOffersCount: activeOffers.length,
    totalOffersValue,
    mostPopularPlatform,
    usersWithFavoritesCount: uniqueUsers.size,
    totalFavoritesCount: favorites.length,
    activeNotificationsCount: activeNotificationsCount ?? 0,
    favoritesByDay7: bucketByDay(favoriteDates, 7),
    favoritesByDay30: bucketByDay(favoriteDates, 30),
  };
}
