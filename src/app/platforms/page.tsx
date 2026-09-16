import type { Metadata } from "next";
import { BrowseIndex } from "@/components/browse-index";
import { platforms } from "@/lib/catalog";
import { getAllOffers } from "@/lib/offers-repository";
import { platformLogos } from "@/lib/platform-logos";

export const metadata: Metadata = {
  title: "Toutes les plateformes de jeux gratuits",
  description: "Epic Games, Steam, PlayStation, Xbox, Twitch, Roblox, Prime Gaming — toutes les sources d'offres gratuites suivies par DROPS.",
};

export default async function PlatformsIndexPage() {
  const offers = await getAllOffers();
  const entries = platforms.map((platform) => ({
    href: `/platforms/${platform.slug}`,
    label: platform.label,
    description: platform.description,
    count: offers.filter((offer) => offer.store === platform.store).length,
    logoImage: platformLogos[platform.store],
  }));

  return <BrowseIndex
    eyebrow="EXPLORER"
    title="Plateformes"
    description="Toutes les sources d'offres gratuites couvertes par DROPS, plateforme par plateforme."
    entries={entries}
  />;
}
