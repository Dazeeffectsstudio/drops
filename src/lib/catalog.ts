import type { OfferCategory, OfferStore, Platform } from "@/types/offer";

export type AccentColor = "lime" | "violet" | "blue" | "orange";

export type PlatformEntry = { store: OfferStore; platform: Platform; slug: string; label: string; description: string; logo: string; color: AccentColor };
export type CategoryEntry = { category: OfferCategory; slug: string; label: string; description: string; eyebrow: string; kind: string };

// Toutes les plateformes prévues au projet, même sans offre active pour l'instant.
// `platform` est la classification technique (PC/console/autres) associée
// automatiquement à chaque distributeur — voir src/lib/offers-repository.ts.
export const platforms: PlatformEntry[] = [
  { store: "Epic Games", platform: "PC", slug: "epic-games", label: "Epic Games", description: "Jeux complets offerts chaque semaine sur l'Epic Games Store.", logo: "E", color: "lime" },
  { store: "Steam", platform: "PC", slug: "steam", label: "Steam", description: "DLC, week-ends gratuits et jeux à garder dans ta bibliothèque Steam.", logo: "S", color: "orange" },
  { store: "PlayStation", platform: "PLAYSTATION", slug: "playstation", label: "PlayStation", description: "Items, essais et récompenses gratuites pour PS4 et PS5.", logo: "PS", color: "blue" },
  { store: "Xbox", platform: "XBOX", slug: "xbox", label: "Xbox", description: "Accès gratuits et récompenses pour la console et le PC Xbox.", logo: "X", color: "orange" },
  { store: "Twitch", platform: "AUTRES", slug: "twitch", label: "Twitch Drops", description: "Récompenses à débloquer en regardant les streams partenaires.", logo: "T", color: "violet" },
  { store: "Roblox", platform: "AUTRES", slug: "roblox", label: "Roblox", description: "Accessoires et objets de collection offerts par la communauté.", logo: "R", color: "blue" },
  { store: "Prime Gaming", platform: "PC", slug: "prime-gaming", label: "Prime Gaming", description: "Jeux, contenus et skins inclus avec un abonnement Amazon Prime.", logo: "PG", color: "lime" },
];

// Toutes les catégories prévues au projet, même sans offre active pour l'instant.
// `eyebrow`/`kind` servent de texte d'affichage par défaut pour les offres
// de cette catégorie (voir src/lib/offers-repository.ts).
export const categories: CategoryEntry[] = [
  { category: "JEUX", slug: "games", label: "Jeux", description: "Des jeux complets, temporairement ou définitivement gratuits.", eyebrow: "JEU GRATUIT", kind: "Jeu gratuit à récupérer" },
  { category: "ITEMS", slug: "skins", label: "Skins", description: "Habillages et objets cosmétiques à récupérer gratuitement.", eyebrow: "ITEM GRATUIT", kind: "Objet cosmétique à récupérer" },
  { category: "TWITCH DROPS", slug: "twitch-drops", label: "Twitch Drops", description: "Récompenses liées au visionnage de streams partenaires.", eyebrow: "TWITCH DROP", kind: "Récompense de stream" },
  { category: "DLC", slug: "dlc", label: "DLC gratuits", description: "Extensions et contenus additionnels offerts pour une durée limitée.", eyebrow: "DLC GRATUIT", kind: "Extension à récupérer" },
  { category: "PRIME GAMING", slug: "prime-gaming", label: "Prime Gaming", description: "Le contenu gratuit inclus avec l'abonnement Amazon Prime.", eyebrow: "PRIME GAMING", kind: "Contenu inclus avec Prime" },
  { category: "WEEK-END GRATUIT", slug: "free-weekend", label: "Week-ends gratuits", description: "Des jeux accessibles gratuitement le temps d'un week-end.", eyebrow: "WEEK-END GRATUIT", kind: "Accès gratuit temporaire" },
];

export function findPlatformBySlug(slug: string): PlatformEntry | undefined {
  return platforms.find((entry) => entry.slug === slug);
}

export function findPlatformByStore(store: OfferStore): PlatformEntry | undefined {
  return platforms.find((entry) => entry.store === store);
}

export function findCategoryBySlug(slug: string): CategoryEntry | undefined {
  return categories.find((entry) => entry.slug === slug);
}

export function findCategoryEntry(category: OfferCategory): CategoryEntry | undefined {
  return categories.find((entry) => entry.category === category);
}
