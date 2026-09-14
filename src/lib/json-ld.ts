import { absoluteUrl, siteConfig } from "@/lib/site-config";
import { getOfferStatus } from "@/lib/offers";
import type { Offer } from "@/types/offer";

// Génère un objet schema.org — toujours sérialisé via
// <script type="application/ld+json"> dans la page correspondante, jamais
// injecté ailleurs (voir chaque page qui importe ces fonctions).

export function offerJsonLd(offer: Offer): Record<string, unknown> {
  const status = getOfferStatus(offer);
  return {
    "@context": "https://schema.org",
    "@type": "VideoGame",
    name: offer.title,
    description: offer.description,
    url: absoluteUrl(`/offres/${offer.id}`),
    image: absoluteUrl(offer.image),
    applicationCategory: "Game",
    gamePlatform: offer.platform,
    publisher: { "@type": "Organization", name: offer.store },
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "EUR",
      priceValidUntil: offer.expiresAt.slice(0, 10),
      availability: status === "active" ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      url: absoluteUrl(`/offres/${offer.id}`),
      seller: { "@type": "Organization", name: offer.store },
      ...(offer.originalPrice !== null ? { priceSpecification: { "@type": "PriceSpecification", price: "0", priceCurrency: "EUR" } } : {}),
    },
  };
}

export function collectionPageJsonLd(name: string, description: string, url: string, itemCount: number): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name,
    description,
    url: absoluteUrl(url),
    isPartOf: { "@type": "WebSite", name: siteConfig.name, url: siteConfig.url },
    mainEntity: { "@type": "ItemList", numberOfItems: itemCount },
  };
}

export function faqJsonLd(entries: Array<{ question: string; answer: string }>): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: entries.map((entry) => ({
      "@type": "Question",
      name: entry.question,
      acceptedAnswer: { "@type": "Answer", text: entry.answer },
    })),
  };
}
