import { notFound } from "next/navigation";
import { OfferDetail } from "@/components/offer-detail";
import { getCurrentUser } from "@/lib/auth";
import { getCurrentFavoritesState } from "@/lib/favorites-repository";
import { getMyUnreadNotificationCount } from "@/lib/notification-logs-repository";
import { getOfferById } from "@/lib/offers-repository";

export default async function OfferPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [offer, user, { favorites }, unreadCount] = await Promise.all([getOfferById(id), getCurrentUser(), getCurrentFavoritesState(), getMyUnreadNotificationCount()]);
  if (!offer) notFound();
  return <OfferDetail offer={offer} user={user} initialFavorites={favorites} unreadCount={unreadCount} />;
}
