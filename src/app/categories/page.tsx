import type { Metadata } from "next";
import { BrowseIndex } from "@/components/browse-index";
import { categories } from "@/lib/catalog";
import { CalendarIcon, DropletIcon, GamepadIcon, GemIcon, GiftIcon, PuzzlePieceIcon } from "@/components/icons";
import { getAllOffers } from "@/lib/offers-repository";
import type { OfferCategory } from "@/types/offer";

export const metadata: Metadata = {
  title: "Toutes les catégories d'offres gratuites",
  description: "Jeux, skins, Twitch Drops, DLC, week-ends gratuits, Prime Gaming — tous les types de contenu gratuit suivis par DROPS.",
};

const categoryIcons: Record<OfferCategory, React.ReactNode> = {
  "JEUX": <GamepadIcon />,
  "ITEMS": <GemIcon />,
  "TWITCH DROPS": <DropletIcon />,
  "DLC": <PuzzlePieceIcon />,
  "PRIME GAMING": <GiftIcon />,
  "WEEK-END GRATUIT": <CalendarIcon />,
};

export default async function CategoriesIndexPage() {
  const offers = await getAllOffers();
  const entries = categories.map((category) => ({
    href: `/categories/${category.slug}`,
    label: category.label,
    description: category.description,
    count: offers.filter((offer) => offer.category === category.category).length,
    icon: categoryIcons[category.category],
  }));

  return <BrowseIndex
    eyebrow="EXPLORER"
    title="Catégories"
    description="Tous les types de contenu gratuit couverts par DROPS, catégorie par catégorie."
    entries={entries}
  />;
}
