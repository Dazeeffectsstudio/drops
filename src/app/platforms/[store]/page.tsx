import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CatalogPage } from "@/components/catalog-page";
import { findPlatformBySlug, platforms } from "@/lib/catalog";
import { getCurrentUser } from "@/lib/auth";
import { getCurrentFavoritesState } from "@/lib/favorites-repository";
import { collectionPageJsonLd, faqJsonLd } from "@/lib/json-ld";
import { getMyUnreadNotificationCount } from "@/lib/notification-logs-repository";
import { getOffersByStore } from "@/lib/offers-repository";
import { platformFaq, platformIntro } from "@/lib/seo-content";
import { absoluteUrl } from "@/lib/site-config";

export function generateStaticParams() {
  return platforms.map((platform) => ({ store: platform.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ store: string }> }): Promise<Metadata> {
  const { store } = await params;
  const platform = findPlatformBySlug(store);
  if (!platform) return { title: "Plateforme introuvable" };
  const title = `Jeux gratuits ${platform.label}`;
  return {
    title,
    description: platform.description,
    alternates: { canonical: absoluteUrl(`/platforms/${platform.slug}`) },
    openGraph: { title, description: platform.description, type: "website", url: absoluteUrl(`/platforms/${platform.slug}`) },
    twitter: { card: "summary_large_image", title, description: platform.description },
  };
}

export default async function PlatformPage({ params }: { params: Promise<{ store: string }> }) {
  const { store } = await params;
  const platform = findPlatformBySlug(store);
  if (!platform) notFound();
  const [offers, user, { favorites }, unreadCount] = await Promise.all([getOffersByStore(platform.store), getCurrentUser(), getCurrentFavoritesState(), getMyUnreadNotificationCount()]);
  const faq = platformFaq(platform.label);

  return <>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionPageJsonLd(platform.label, platform.description, `/platforms/${platform.slug}`, offers.length)) }} />
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd(faq)) }} />
    <CatalogPage
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
      unreadCount={unreadCount}
      intro={platformIntro(platform.label, platform.description)}
      faq={faq}
    />
  </>;
}
