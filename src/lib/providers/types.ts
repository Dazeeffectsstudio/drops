import type { Offer, OfferStore } from "@/types/offer";

// Contrat commun à tous les providers de synchronisation. Chaque
// plateforme (Epic Games, Steam, ...) expose un objet conforme à ce type
// dans son propre fichier sous src/lib/providers/. Le service de
// synchronisation (src/lib/sync-offers.ts) ne connaît que ce contrat —
// il n'a jamais besoin de savoir COMMENT un provider récupère ses offres.
export type OfferProvider = {
  // Identifiant court et stable, utilisé dans sync_logs et dans les
  // identifiants d'offres générés (préfixe "sync-<key>-...").
  key: string;
  // Nom affiché dans le dashboard admin.
  label: string;
  store: OfferStore;
  fetchOffers(): Promise<Offer[]>;
};

// Préfixe utilisé par tous les identifiants d'offres créées par un
// provider. Le service de synchronisation ne touche jamais une offre dont
// l'identifiant ne commence pas par ce préfixe — cela protège les offres
// de démonstration et celles ajoutées manuellement depuis /admin, qui ne
// seront jamais modifiées ni marquées expirées automatiquement.
export const SYNC_ID_PREFIX = "sync-";
