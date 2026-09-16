import type { OfferProvider } from "./types";

// Aucune offre simulée : mieux vaut ne rien afficher pour Prime Gaming
// que de faire croire à de vraies offres qui n'existent pas.
async function fetchOffers() {
  return [];
}

export const primeGamingProvider: OfferProvider = {
  key: "prime-gaming",
  label: "Prime Gaming",
  store: "Prime Gaming",
  mode: "simulated",
  unavailableReason: "Amazon ne publie pas d'API pour le catalogue Prime Gaming. Aucune offre affichée tant que ce n'est pas branché sur une vraie source.",
  fetchOffers,
};
