import type { OfferStore } from "@/types/offer";

// Vrais logos officiels par plateforme (récupérés depuis Wikimedia
// Commons, qui héberge les fichiers de marque officiels de chaque
// entreprise) — utilisés ici à titre informatif pour identifier la
// source d'une offre. DROPS n'est affilié à aucune de ces plateformes.
export const platformLogos: Record<OfferStore, string> = {
  "Epic Games": "/images/logos/epic-games.svg",
  Steam: "/images/logos/steam.svg",
  PlayStation: "/images/logos/playstation.svg",
  Xbox: "/images/logos/xbox.svg",
  Twitch: "/images/logos/twitch.svg",
  Roblox: "/images/logos/roblox.svg",
  "Prime Gaming": "/images/logos/prime-gaming.svg",
};
