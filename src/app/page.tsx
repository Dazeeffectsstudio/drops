import { DropsHome } from "@/components/drops-home";
import { getCurrentUser } from "@/lib/auth";
import { getCurrentFavoritesState } from "@/lib/favorites-repository";
import { getMySubscribedOfferIds } from "@/lib/notification-subscriptions-repository";
import { getAllOffers } from "@/lib/offers-repository";

export default async function Home() {
  const [offers, user, { favorites }, subscribedOfferIds] = await Promise.all([
    getAllOffers(),
    getCurrentUser(),
    getCurrentFavoritesState(),
    getMySubscribedOfferIds(),
  ]);
  return <DropsHome offers={offers} user={user} initialFavorites={favorites} subscribedOfferIds={subscribedOfferIds} />;
}
