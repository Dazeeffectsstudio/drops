import type { OfferProvider } from "./types";

// Aucune offre simulée : mieux vaut ne rien afficher pour Twitch que de
// faire croire à de vraies offres qui n'existent pas. `syncAllOffers()`
// interprète un tableau vide comme "plus aucune offre côté ce provider"
// et expire automatiquement celles déjà en base (voir sync-offers.ts).
async function fetchOffers() {
  return [];
}

export const twitchProvider: OfferProvider = {
  key: "twitch",
  label: "Twitch",
  store: "Twitch",
  mode: "simulated",
  unavailableReason: "L'API Twitch Drops nécessite un accès développeur approuvé par jeu suivi — pas d'accès public en lecture seule. Aucune offre affichée tant que ce n'est pas branché sur une vraie source.",
  fetchOffers,
};
