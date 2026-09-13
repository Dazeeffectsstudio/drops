import type { Metadata } from "next";
import { BrowseIndex } from "@/components/browse-index";
import { offersByStore, platforms } from "@/lib/catalog";

export const metadata: Metadata = { title: "Plateformes — DROPS" };

export default function PlatformsIndexPage() {
  const entries = platforms.map((platform) => ({
    href: `/platforms/${platform.slug}`,
    label: platform.label,
    description: platform.description,
    count: offersByStore(platform.store).length,
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
