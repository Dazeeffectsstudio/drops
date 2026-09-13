import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CatalogPage } from "@/components/catalog-page";
import { findPlatformBySlug, offersByStore, platforms } from "@/lib/catalog";

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

  return <CatalogPage
    eyebrow="PLATEFORME"
    title={platform.label}
    description={platform.description}
    offers={offersByStore(platform.store)}
    emptyTitle="Aucune offre disponible ici pour l'instant."
    emptyDescription={`Reviens bientôt pour voir les prochaines offres ${platform.label}.`}
    logo={platform.logo}
    color={platform.color}
    categoryFilter
  />;
}
