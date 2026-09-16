import type { OfferProvider } from "./types";

// Aucune offre simulée : mieux vaut ne rien afficher pour Roblox que de
// faire croire à de vraies offres qui n'existent pas.
async function fetchOffers() {
  return [];
}

export const robloxProvider: OfferProvider = {
  key: "roblox",
  label: "Roblox",
  store: "Roblox",
  mode: "simulated",
  unavailableReason: "Pas d'API publique listant les items gratuits en promotion sur Roblox. Aucune offre affichée tant que ce n'est pas branché sur une vraie source.",
  fetchOffers,
};
