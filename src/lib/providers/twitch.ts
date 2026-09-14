import { buildOffer } from "@/lib/offer-builder";
import { stableFutureDate } from "./dates";
import type { OfferProvider } from "./types";

// Données simulées en attendant une vraie intégration avec l'API Twitch
// Drops (nécessite un accès développeur Twitch approuvé par jeu suivi).
async function fetchOffers() {
  return [
    buildOffer({
      id: "sync-twitch-drop-1",
      title: "Signal Nocturne — Pack Twitch Drop",
      description: "Regarde les streams partenaires pour débloquer ce pack cosmétique exclusif.",
      platform: "AUTRES",
      store: "Twitch",
      category: "TWITCH DROPS",
      image: "/images/stream-signal.svg",
      originalPrice: null,
      expiresAt: stableFutureDate(5),
      url: "#sync-twitch-drop-1",
      accent: "violet",
      isNew: true,
    }),
    buildOffer({
      id: "sync-twitch-drop-2",
      title: "Arène Numérique — Pack Twitch Drop",
      description: "Un deuxième drop de la campagne, à débloquer en regardant les créateurs partenaires.",
      platform: "AUTRES",
      store: "Twitch",
      category: "TWITCH DROPS",
      image: "/images/stream-signal.svg",
      originalPrice: null,
      expiresAt: stableFutureDate(5),
      url: "#sync-twitch-drop-2",
      accent: "violet",
    }),
  ];
}

export const twitchProvider: OfferProvider = { key: "twitch", label: "Twitch", store: "Twitch", fetchOffers };
