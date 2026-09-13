import type { Metadata } from "next";
import { BrowseIndex } from "@/components/browse-index";
import { categories, offersByCategory } from "@/lib/catalog";

export const metadata: Metadata = { title: "Catégories — DROPS" };

export default function CategoriesIndexPage() {
  const entries = categories.map((category) => ({
    href: `/categories/${category.slug}`,
    label: category.label,
    description: category.description,
    count: offersByCategory(category.category).length,
  }));

  return <BrowseIndex
    eyebrow="EXPLORER"
    title="Catégories"
    description="Tous les types de contenu gratuit couverts par DROPS, catégorie par catégorie."
    entries={entries}
  />;
}
