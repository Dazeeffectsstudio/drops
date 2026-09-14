import type { Metadata } from "next";
import { FavoritesPage } from "@/components/favorites-page";
import { getCurrentUser } from "@/lib/auth";
import { getCurrentFavoritesState } from "@/lib/favorites-repository";
import { getMyUnreadNotificationCount } from "@/lib/notification-logs-repository";
import { getAllOffers } from "@/lib/offers-repository";

export const metadata: Metadata = { title: "Mes favoris", robots: { index: false, follow: false } };

export default async function Favorites() {
  const [offers, user, { favorites }, unreadCount] = await Promise.all([getAllOffers(), getCurrentUser(), getCurrentFavoritesState(), getMyUnreadNotificationCount()]);
  return <FavoritesPage offers={offers} user={user} initialFavorites={favorites} unreadCount={unreadCount} />;
}
