import { buildOffer } from "@/lib/offer-builder";
import { stableFutureDate } from "./dates";
import type { OfferProvider } from "./types";

// Données simulées en attendant une vraie intégration avec l'API Steam
// (ex. la liste des jeux gratuits / promotions à 100%).
async function fetchOffers() {
  return [
    buildOffer({
      id: "sync-steam-freeweekend-1",
      title: "Ironclad Vanguard",
      description: "Un jeu de stratégie militaire accessible gratuitement le temps d'un week-end sur Steam.",
      platform: "PC",
      store: "Steam",
      category: "WEEK-END GRATUIT",
      image: "/images/rift-runner.svg",
      originalPrice: 29.99,
      expiresAt: stableFutureDate(3),
      url: "#sync-steam-freeweekend-1",
      accent: "orange",
      trending: true,
    }),
    buildOffer({
      id: "sync-steam-dlc-1",
      title: "Ironclad Vanguard — Extension Frontline",
      description: "Une extension narrative gratuite à conserver dans ta bibliothèque Steam.",
      platform: "PC",
      store: "Steam",
      category: "DLC",
      image: "/images/stream-signal.svg",
      originalPrice: 6.99,
      expiresAt: stableFutureDate(14),
      url: "#sync-steam-dlc-1",
      accent: "violet",
      isNew: true,
    }),
  ];
}

export const steamProvider: OfferProvider = {
  key: "steam",
  label: "Steam",
  store: "Steam",
  mode: "simulated",
  unavailableReason: "Steam n'a pas d'API publique dédiée aux jeux gratuits/week-ends gratuits (le flag n'existe pas dans son API officielle).",
  fetchOffers,
};
