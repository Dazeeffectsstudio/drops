import { notFound } from "next/navigation";
import { OfferDetail } from "@/components/offer-detail";
import { getCurrentUser } from "@/lib/auth";
import { getCurrentFavoritesState } from "@/lib/favorites-repository";
import { getOfferById } from "@/lib/offers-repository";

export default async function OfferPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [offer, user, { favorites }] = await Promise.all([getOfferById(id), getCurrentUser(), getCurrentFavoritesState()]);
  if (!offer) notFound();
  return <OfferDetail offer={offer} user={user} initialFavorites={favorites} />;
}
