import type { Metadata } from "next";
import { BrowseIndex } from "@/components/browse-index";
import { categories } from "@/lib/catalog";
import { getAllOffers } from "@/lib/offers-repository";

export const metadata: Metadata = { title: "Catégories — DROPS" };

export default async function CategoriesIndexPage() {
  const offers = await getAllOffers();
  const entries = categories.map((category) => ({
    href: `/categories/${category.slug}`,
    label: category.label,
    description: category.description,
    count: offers.filter((offer) => offer.category === category.category).length,
  }));

  return <BrowseIndex
    eyebrow="EXPLORER"
    title="Catégories"
    description="Tous les types de contenu gratuit couverts par DROPS, catégorie par catégorie."
    entries={entries}
  />;
}
