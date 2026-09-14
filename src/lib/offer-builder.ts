import { findCategoryEntry, type AccentColor } from "@/lib/catalog";
import type { Offer, OfferCategory, OfferStore, Platform } from "@/types/offer";

// Construit une Offer complète (avec les champs d'affichage dérivés —
// eyebrow, kind, imageAlt, accent) à partir des champs essentiels.
// Utilisé à la fois par la lecture Supabase (offers-repository.ts) et par
// les providers de synchronisation (src/lib/providers/), pour ne pas
// dupliquer cette logique de dérivation à deux endroits.

export type BuildOfferInput = {
  id: string;
  title: string;
  description: string;
  platform: Platform;
  store: OfferStore;
  category: OfferCategory;
  image: string;
  originalPrice: number | null;
  currentPrice?: number;
  startsAt?: string | null;
  expiresAt: string;
  url: string;
  accent?: AccentColor;
  featured?: boolean;
  trending?: boolean;
  isNew?: boolean;
};

export function buildOffer(input: BuildOfferInput): Offer {
  const defaults = findCategoryEntry(input.category);
  return {
    id: input.id,
    title: input.title,
    eyebrow: defaults?.eyebrow ?? "OFFRE GRATUITE",
    platform: input.platform,
    store: input.store,
    category: input.category,
    kind: defaults?.kind ?? "Offre gratuite à récupérer",
    description: input.description,
    originalPrice: input.originalPrice,
    currentPrice: input.currentPrice ?? 0,
    startsAt: input.startsAt ?? undefined,
    expiresAt: input.expiresAt,
    url: input.url,
    image: input.image,
    imageAlt: input.title,
    accent: input.accent ?? "lime",
    featured: input.featured ?? false,
    trending: input.trending ?? false,
    isNew: input.isNew ?? false,
  };
}
