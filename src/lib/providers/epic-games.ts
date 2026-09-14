import { buildOffer } from "@/lib/offer-builder";
import { stableFutureDate } from "./dates";
import type { OfferProvider } from "./types";

// Données simulées en attendant une vraie intégration avec l'API/le flux
// public de l'Epic Games Store. La signature fetchOffers() est déjà celle
// qu'utiliserait un vrai appel réseau : brancher la vraie source plus
// tard ne changera aucun autre fichier du projet.
async function fetchOffers() {
  return [
    buildOffer({
      id: "sync-epic-games-weekly-1",
      title: "Aurora Drift",
      description: "Un jeu de course onirique offert cette semaine sur l'Epic Games Store.",
      platform: "PC",
      store: "Epic Games",
      category: "JEUX",
      image: "/images/echoes-of-nova.svg",
      originalPrice: 24.99,
      expiresAt: stableFutureDate(7),
      url: "#sync-epic-games-weekly-1",
      accent: "lime",
      featured: true,
      trending: true,
      isNew: true,
    }),
    buildOffer({
      id: "sync-epic-games-weekly-2",
      title: "Hollow Circuit",
      description: "Un thriller cyberpunk temporairement gratuit sur l'Epic Games Store.",
      platform: "PC",
      store: "Epic Games",
      category: "JEUX",
      image: "/images/rift-runner.svg",
      originalPrice: 17.99,
      expiresAt: stableFutureDate(7),
      url: "#sync-epic-games-weekly-2",
      accent: "orange",
    }),
  ];
}

export const epicGamesProvider: OfferProvider = { key: "epic-games", label: "Epic Games", store: "Epic Games", fetchOffers };
