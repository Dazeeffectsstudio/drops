import { buildOffer } from "@/lib/offer-builder";
import { stableFutureDate } from "./dates";
import type { OfferProvider } from "./types";

// Données simulées en attendant une vraie intégration avec le catalogue
// d'items gratuits Roblox.
async function fetchOffers() {
  return [
    buildOffer({
      id: "sync-roblox-item-1",
      title: "Couronne du Créateur",
      description: "Un accessoire de collection gratuit créé pour la communauté Roblox.",
      platform: "AUTRES",
      store: "Roblox",
      category: "ITEMS",
      image: "/images/carbon-skin.svg",
      originalPrice: 5.99,
      expiresAt: stableFutureDate(10),
      url: "#sync-roblox-item-1",
      accent: "blue",
      isNew: true,
    }),
    buildOffer({
      id: "sync-roblox-item-2",
      title: "Cape Spectrale",
      description: "Un accessoire cosmétique offert pendant l'événement en cours sur Roblox.",
      platform: "AUTRES",
      store: "Roblox",
      category: "ITEMS",
      image: "/images/carbon-skin.svg",
      originalPrice: 3.99,
      expiresAt: stableFutureDate(10),
      url: "#sync-roblox-item-2",
      accent: "blue",
    }),
  ];
}

export const robloxProvider: OfferProvider = { key: "roblox", label: "Roblox", store: "Roblox", fetchOffers };
