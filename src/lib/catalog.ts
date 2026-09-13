import { offers } from "@/data/offers";
import type { Offer, OfferCategory, OfferStore } from "@/types/offer";

export type PlatformEntry = { store: OfferStore; slug: string; label: string; description: string };
export type CategoryEntry = { category: OfferCategory; slug: string; label: string; description: string };

// Toutes les plateformes prévues au projet, même sans offre active pour l'instant.
export const platforms: PlatformEntry[] = [
  { store: "Epic Games", slug: "epic-games", label: "Epic Games", description: "Jeux complets offerts chaque semaine sur l'Epic Games Store." },
  { store: "Steam", slug: "steam", label: "Steam", description: "DLC, week-ends gratuits et jeux à garder dans ta bibliothèque Steam." },
  { store: "PlayStation", slug: "playstation", label: "PlayStation", description: "Items, essais et récompenses gratuites pour PS4 et PS5." },
  { store: "Xbox", slug: "xbox", label: "Xbox", description: "Accès gratuits et récompenses pour la console et le PC Xbox." },
  { store: "Twitch", slug: "twitch", label: "Twitch Drops", description: "Récompenses à débloquer en regardant les streams partenaires." },
  { store: "Roblox", slug: "roblox", label: "Roblox", description: "Accessoires et objets de collection offerts par la communauté." },
  { store: "Prime Gaming", slug: "prime-gaming", label: "Prime Gaming", description: "Jeux, contenus et skins inclus avec un abonnement Amazon Prime." },
];

// Toutes les catégories prévues au projet, même sans offre active pour l'instant.
export const categories: CategoryEntry[] = [
  { category: "JEUX", slug: "jeux", label: "Jeux", description: "Des jeux complets, temporairement ou définitivement gratuits." },
  { category: "ITEMS", slug: "skins", label: "Skins", description: "Habillages et objets cosmétiques à récupérer gratuitement." },
  { category: "TWITCH DROPS", slug: "twitch-drops", label: "Twitch Drops", description: "Récompenses liées au visionnage de streams partenaires." },
  { category: "DLC", slug: "dlc", label: "DLC gratuits", description: "Extensions et contenus additionnels offerts pour une durée limitée." },
  { category: "PRIME GAMING", slug: "prime-gaming", label: "Prime Gaming", description: "Le contenu gratuit inclus avec l'abonnement Amazon Prime." },
  { category: "WEEK-END GRATUIT", slug: "week-end-gratuit", label: "Week-ends gratuits", description: "Des jeux accessibles gratuitement le temps d'un week-end." },
];

export function findPlatformBySlug(slug: string): PlatformEntry | undefined {
  return platforms.find((entry) => entry.slug === slug);
}

export function findCategoryBySlug(slug: string): CategoryEntry | undefined {
  return categories.find((entry) => entry.slug === slug);
}

export function offersByStore(store: OfferStore): Offer[] {
  return offers.filter((offer) => offer.store === store);
}

export function offersByCategory(category: OfferCategory): Offer[] {
  return offers.filter((offer) => offer.category === category);
}
