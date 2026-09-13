import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CatalogPage } from "@/components/catalog-page";
import { categories, findCategoryBySlug, offersByCategory } from "@/lib/catalog";

export function generateStaticParams() {
  return categories.map((category) => ({ category: category.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ category: string }> }): Promise<Metadata> {
  const { category: slug } = await params;
  const category = findCategoryBySlug(slug);
  return { title: category ? `${category.label} — DROPS` : "DROPS" };
}

export default async function CategoryPage({ params }: { params: Promise<{ category: string }> }) {
  const { category: slug } = await params;
  const category = findCategoryBySlug(slug);
  if (!category) notFound();

  return <CatalogPage
    eyebrow="CATÉGORIE"
    title={category.label}
    description={category.description}
    offers={offersByCategory(category.category)}
    emptyTitle="Aucune offre disponible ici pour l'instant."
    emptyDescription={`Reviens bientôt pour voir les prochaines offres ${category.label}.`}
  />;
}
