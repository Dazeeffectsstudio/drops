import { DropsHome } from "@/components/drops-home";
import { getCurrentUser } from "@/lib/auth";
import { getCurrentFavoritesState } from "@/lib/favorites-repository";
import { getMyUnreadNotificationCount } from "@/lib/notification-logs-repository";
import { getMySubscribedOfferIds } from "@/lib/notification-subscriptions-repository";
import { getAllOffers } from "@/lib/offers-repository";

export default async function Home() {
  const [offers, user, { favorites }, subscribedOfferIds, unreadCount] = await Promise.all([
    getAllOffers(),
    getCurrentUser(),
    getCurrentFavoritesState(),
    getMySubscribedOfferIds(),
    getMyUnreadNotificationCount(),
  ]);
  return <DropsHome offers={offers} user={user} initialFavorites={favorites} subscribedOfferIds={subscribedOfferIds} unreadCount={unreadCount} />;
}
