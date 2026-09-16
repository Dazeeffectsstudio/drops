import { buildOffer } from "@/lib/offer-builder";
import { stableFutureDate } from "./dates";
import type { OfferProvider } from "./types";

// Données simulées en attendant une vraie intégration avec le catalogue
// Prime Gaming (Amazon).
async function fetchOffers() {
  return [
    buildOffer({
      id: "sync-prime-gaming-1",
      title: "Coffre du Mois — Prime Gaming",
      description: "Le contenu du mois inclus gratuitement avec un abonnement Amazon Prime.",
      platform: "PC",
      store: "Prime Gaming",
      category: "PRIME GAMING",
      image: "/images/prime-crate.svg",
      originalPrice: 9.99,
      expiresAt: stableFutureDate(30),
      url: "#sync-prime-gaming-1",
      accent: "skyblue",
      featured: true,
    }),
    buildOffer({
      id: "sync-prime-gaming-2",
      title: "Pack Vétéran — Prime Gaming",
      description: "Un second lot de contenus inclus ce mois-ci avec Prime Gaming.",
      platform: "PC",
      store: "Prime Gaming",
      category: "PRIME GAMING",
      image: "/images/prime-crate.svg",
      originalPrice: 4.99,
      expiresAt: stableFutureDate(30),
      url: "#sync-prime-gaming-2",
      accent: "skyblue",
    }),
  ];
}

export const primeGamingProvider: OfferProvider = {
  key: "prime-gaming",
  label: "Prime Gaming",
  store: "Prime Gaming",
  mode: "simulated",
  unavailableReason: "Amazon ne publie pas d'API pour le catalogue Prime Gaming.",
  fetchOffers,
};
