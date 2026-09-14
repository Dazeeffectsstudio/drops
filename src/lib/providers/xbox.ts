import { buildOffer } from "@/lib/offer-builder";
import { stableFutureDate } from "./dates";
import type { OfferProvider } from "./types";

// Données simulées en attendant une vraie intégration avec le Xbox Store
// (Games with Gold, essais gratuits, etc.).
async function fetchOffers() {
  return [
    buildOffer({
      id: "sync-xbox-weekend-1",
      title: "Convoi Fantôme",
      description: "Un jeu de tactique en convoi accessible gratuitement jusqu'à la fin du week-end sur Xbox.",
      platform: "XBOX",
      store: "Xbox",
      category: "WEEK-END GRATUIT",
      image: "/images/rift-runner.svg",
      originalPrice: 21.99,
      expiresAt: stableFutureDate(3),
      url: "#sync-xbox-weekend-1",
      accent: "orange",
    }),
    buildOffer({
      id: "sync-xbox-upcoming-1",
      title: "Météore Écarlate",
      description: "Un jeu de tir spatial qui deviendra gratuit prochainement sur Xbox — à surveiller.",
      platform: "XBOX",
      store: "Xbox",
      category: "JEUX",
      image: "/images/rift-runner.svg",
      originalPrice: 16.99,
      startsAt: stableFutureDate(6),
      expiresAt: stableFutureDate(13),
      url: "#sync-xbox-upcoming-1",
      accent: "orange",
    }),
  ];
}

export const xboxProvider: OfferProvider = { key: "xbox", label: "Xbox", store: "Xbox", fetchOffers };
