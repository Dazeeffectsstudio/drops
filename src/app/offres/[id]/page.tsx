import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { OfferDetail } from "@/components/offer-detail";
import { getCurrentUser } from "@/lib/auth";
import { getCurrentFavoritesState } from "@/lib/favorites-repository";
import { offerJsonLd } from "@/lib/json-ld";
import { getMyUnreadNotificationCount } from "@/lib/notification-logs-repository";
import { getOfferById, getRelatedOffers } from "@/lib/offers-repository";
import { absoluteUrl } from "@/lib/site-config";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const offer = await getOfferById(id);
  if (!offer) return { title: "Offre introuvable" };

  return {
    title: `${offer.title} gratuit sur ${offer.store}`,
    description: offer.description,
    alternates: { canonical: absoluteUrl(`/offres/${offer.id}`) },
    openGraph: { title: `${offer.title} — gratuit sur ${offer.store}`, description: offer.description, type: "website", url: absoluteUrl(`/offres/${offer.id}`) },
    twitter: { card: "summary_large_image", title: `${offer.title} — gratuit sur ${offer.store}`, description: offer.description },
  };
}

export default async function OfferPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [offer, user, { favorites }, unreadCount] = await Promise.all([getOfferById(id), getCurrentUser(), getCurrentFavoritesState(), getMyUnreadNotificationCount()]);
  if (!offer) notFound();

  const relatedOffers = await getRelatedOffers(offer);

  return <>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(offerJsonLd(offer)) }} />
    <OfferDetail offer={offer} user={user} initialFavorites={favorites} unreadCount={unreadCount} relatedOffers={relatedOffers} />
  </>;
}
