import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CatalogPage } from "@/components/catalog-page";
import { categories, findCategoryBySlug } from "@/lib/catalog";
import { getCurrentUser } from "@/lib/auth";
import { getCurrentFavoritesState } from "@/lib/favorites-repository";
import { collectionPageJsonLd, faqJsonLd } from "@/lib/json-ld";
import { getMyUnreadNotificationCount } from "@/lib/notification-logs-repository";
import { getOffersByCategory } from "@/lib/offers-repository";
import { categoryFaq, categoryIntro } from "@/lib/seo-content";
import { absoluteUrl } from "@/lib/site-config";

export function generateStaticParams() {
  return categories.map((category) => ({ category: category.slug }));
}

// Filet de sécurité en plus de revalidatePath (déclenché à chaque
// création/modification d'offre et après chaque synchronisation) : au pire,
// une page catégorie ne reste jamais périmée plus d'une heure.
export const revalidate = 3600;

export async function generateMetadata({ params }: { params: Promise<{ category: string }> }): Promise<Metadata> {
  const { category: slug } = await params;
  const category = findCategoryBySlug(slug);
  if (!category) return { title: "Catégorie introuvable" };
  const title = `${category.label} gratuits`;
  return {
    title,
    description: category.description,
    alternates: { canonical: absoluteUrl(`/categories/${category.slug}`) },
    openGraph: { title, description: category.description, type: "website", url: absoluteUrl(`/categories/${category.slug}`) },
    twitter: { card: "summary_large_image", title, description: category.description },
  };
}

export default async function CategoryPage({ params }: { params: Promise<{ category: string }> }) {
  const { category: slug } = await params;
  const category = findCategoryBySlug(slug);
  if (!category) notFound();
  const [offers, user, { favorites }, unreadCount] = await Promise.all([getOffersByCategory(category.category), getCurrentUser(), getCurrentFavoritesState(), getMyUnreadNotificationCount()]);
  const faq = categoryFaq(category.label);

  return <>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionPageJsonLd(category.label, category.description, `/categories/${category.slug}`, offers.length)) }} />
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd(faq)) }} />
    <CatalogPage
      eyebrow="CATÉGORIE"
      title={category.label}
      description={category.description}
      offers={offers}
      emptyTitle="Aucune offre disponible ici pour l'instant."
      emptyDescription={`Reviens bientôt pour voir les prochaines offres ${category.label}.`}
      user={user}
      initialFavorites={favorites}
      unreadCount={unreadCount}
      intro={categoryIntro(category.label, category.description)}
      faq={faq}
    />
  </>;
}
