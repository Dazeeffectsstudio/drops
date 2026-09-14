import { buildOffer } from "@/lib/offer-builder";
import { stableFutureDate } from "./dates";
import type { OfferProvider } from "./types";

// Données simulées en attendant une vraie intégration avec le PlayStation
// Store (jeux du mois PS Plus, essais, etc.).
async function fetchOffers() {
  return [
    buildOffer({
      id: "sync-playstation-item-1",
      title: "Skin Titane Poli",
      description: "Un habillage exclusif offert gratuitement sur le PlayStation Store.",
      platform: "PLAYSTATION",
      store: "PlayStation",
      category: "ITEMS",
      image: "/images/carbon-skin.svg",
      originalPrice: 12.99,
      expiresAt: stableFutureDate(12),
      url: "#sync-playstation-item-1",
      accent: "blue",
    }),
    buildOffer({
      id: "sync-playstation-weekend-1",
      title: "Marée Silencieuse",
      description: "Découvre ce jeu d'exploration sous-marine gratuitement pendant le week-end sur PlayStation.",
      platform: "PLAYSTATION",
      store: "PlayStation",
      category: "WEEK-END GRATUIT",
      image: "/images/echoes-of-nova.svg",
      originalPrice: 19.99,
      expiresAt: stableFutureDate(4),
      url: "#sync-playstation-weekend-1",
      accent: "lime",
      trending: true,
    }),
  ];
}

export const playstationProvider: OfferProvider = { key: "playstation", label: "PlayStation", store: "PlayStation", fetchOffers };
