import type { Metadata } from "next";
import { BrowseIndex } from "@/components/browse-index";
import { platforms } from "@/lib/catalog";
import { getAllOffers } from "@/lib/offers-repository";

export const metadata: Metadata = { title: "Plateformes — DROPS" };

export default async function PlatformsIndexPage() {
  const offers = await getAllOffers();
  const entries = platforms.map((platform) => ({
    href: `/platforms/${platform.slug}`,
    label: platform.label,
    description: platform.description,
    count: offers.filter((offer) => offer.store === platform.store).length,
    logo: platform.logo,
    color: platform.color,
  }));

  return <BrowseIndex
    eyebrow="EXPLORER"
    title="Plateformes"
    description="Toutes les sources d'offres gratuites couvertes par DROPS, plateforme par plateforme."
    entries={entries}
  />;
}
