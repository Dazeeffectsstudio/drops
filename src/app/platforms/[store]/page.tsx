import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CatalogPage } from "@/components/catalog-page";
import { findPlatformBySlug, platforms } from "@/lib/catalog";
import { getCurrentUser } from "@/lib/auth";
import { getCurrentFavoritesState } from "@/lib/favorites-repository";
import { getOffersByStore } from "@/lib/offers-repository";

export function generateStaticParams() {
  return platforms.map((platform) => ({ store: platform.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ store: string }> }): Promise<Metadata> {
  const { store } = await params;
  const platform = findPlatformBySlug(store);
  return { title: platform ? `${platform.label} — DROPS` : "DROPS" };
}

export default async function PlatformPage({ params }: { params: Promise<{ store: string }> }) {
  const { store } = await params;
  const platform = findPlatformBySlug(store);
  if (!platform) notFound();
  const [offers, user, { favorites }] = await Promise.all([getOffersByStore(platform.store), getCurrentUser(), getCurrentFavoritesState()]);

  return <CatalogPage
    eyebrow="PLATEFORME"
    title={platform.label}
    description={platform.description}
    offers={offers}
    emptyTitle="Aucune offre disponible ici pour l'instant."
    emptyDescription={`Reviens bientôt pour voir les prochaines offres ${platform.label}.`}
    logo={platform.logo}
    color={platform.color}
    categoryFilter
    user={user}
    initialFavorites={favorites}
  />;
}
