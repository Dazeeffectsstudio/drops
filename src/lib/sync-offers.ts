import { createOffer, getAllOffers, updateOffer, type OfferFormInput } from "@/lib/offers-repository";
import { providers, SYNC_ID_PREFIX, type OfferProvider } from "@/lib/providers";
import { insertSyncLog } from "@/lib/sync-logs-repository";
import type { Offer } from "@/types/offer";

export type ProviderSyncResult = {
  provider: string;
  label: string;
  status: "success" | "error";
  offersFound: number;
  offersCreated: number;
  offersUpdated: number;
  offersExpired: number;
  message: string | null;
};

export type SyncSummary = {
  startedAt: string;
  finishedAt: string;
  offersFound: number;
  offersCreated: number;
  offersUpdated: number;
  offersExpired: number;
  providers: ProviderSyncResult[];
};

function offerToInput(offer: Offer): OfferFormInput {
  return {
    id: offer.id,
    title: offer.title,
    description: offer.description,
    platform: offer.platform,
    store: offer.store,
    category: offer.category,
    image: offer.image,
    originalPrice: offer.originalPrice,
    currentPrice: offer.currentPrice,
    startsAt: offer.startsAt ?? null,
    expiresAt: offer.expiresAt,
    url: offer.url,
    featured: offer.featured,
    trending: offer.trending,
    isNew: offer.isNew,
  };
}

// Compare deux dates par leur instant réel, pas par leur représentation
// textuelle : Supabase renvoie les timestamptz au format "...+00:00"
// tandis qu'un `new Date().toISOString()` fraîchement calculé produit
// "...000Z" — même instant, chaînes différentes.
function sameInstant(a: string | undefined, b: string | undefined): boolean {
  if (a === b) return true;
  if (!a || !b) return false;
  return new Date(a).getTime() === new Date(b).getTime();
}

// Une offre a "changé" si un des champs qui compte pour l'utilisateur a
// bougé depuis la dernière synchronisation. On ne compare pas featured/
// trending/isNew : ce sont des choix éditoriaux, pas des données de
// catalogue, un provider ne doit pas les écraser après coup.
function hasChanged(existing: Offer, incoming: Offer): boolean {
  return (
    existing.originalPrice !== incoming.originalPrice ||
    existing.currentPrice !== incoming.currentPrice ||
    !sameInstant(existing.expiresAt, incoming.expiresAt) ||
    !sameInstant(existing.startsAt, incoming.startsAt) ||
    existing.image !== incoming.image ||
    existing.description !== incoming.description
  );
}

function isAlreadyExpired(offer: Offer): boolean {
  return new Date(offer.expiresAt).getTime() <= Date.now();
}

async function syncProvider(provider: OfferProvider, existingOffers: Offer[]): Promise<ProviderSyncResult> {
  const existingForStore = existingOffers.filter((offer) => offer.store === provider.store);
  const existingById = new Map(existingForStore.map((offer) => [offer.id, offer]));

  let offers: Offer[];
  try {
    offers = await provider.fetchOffers();
  } catch (error) {
    return {
      provider: provider.key,
      label: provider.label,
      status: "error",
      offersFound: 0,
      offersCreated: 0,
      offersUpdated: 0,
      offersExpired: 0,
      message: error instanceof Error ? error.message : String(error),
    };
  }

  let created = 0;
  let updated = 0;
  let expired = 0;

  for (const incoming of offers) {
    const existing = existingById.get(incoming.id);
    if (!existing) {
      const result = await createOffer(offerToInput(incoming));
      if (!result.error) created += 1;
    } else if (hasChanged(existing, incoming)) {
      const result = await updateOffer(incoming.id, offerToInput(incoming));
      if (!result.error) updated += 1;
    }
  }

  // Les offres gérées par ce provider (préfixe sync-) qui n'apparaissent
  // plus dans la récupération fraîche sont considérées terminées : on les
  // marque expirées en ramenant leur date d'expiration à maintenant,
  // plutôt que de les supprimer (on garde l'historique).
  const fetchedIds = new Set(offers.map((offer) => offer.id));
  for (const existing of existingForStore) {
    if (!existing.id.startsWith(SYNC_ID_PREFIX)) continue;
    if (fetchedIds.has(existing.id)) continue;
    if (isAlreadyExpired(existing)) continue;
    const result = await updateOffer(existing.id, { ...offerToInput(existing), expiresAt: new Date().toISOString() });
    if (!result.error) expired += 1;
  }

  return {
    provider: provider.key,
    label: provider.label,
    status: "success",
    offersFound: offers.length,
    offersCreated: created,
    offersUpdated: updated,
    offersExpired: expired,
    message: null,
  };
}

export async function syncAllOffers(): Promise<SyncSummary> {
  const startedAt = new Date().toISOString();
  const existingOffers = await getAllOffers();

  // Chaque provider est indépendant : un échec ne bloque jamais les
  // autres (syncProvider capture déjà ses propres erreurs et ne rejette
  // jamais), donc Promise.all suffit ici sans risquer un rejet global.
  const results = await Promise.all(providers.map((provider) => syncProvider(provider, existingOffers)));

  // Horodaté au début de la synchronisation (pas à la fin) : ainsi
  // lastSyncAt (utilisé par le dashboard pour détecter les offres
  // "Nouvelle offre" / "Mise à jour") est toujours antérieur aux offres
  // que cette synchronisation vient de créer ou modifier.
  await Promise.all(results.map((result) => insertSyncLog({
    provider: result.provider,
    offers_found: result.offersFound,
    offers_created: result.offersCreated,
    offers_updated: result.offersUpdated,
    offers_expired: result.offersExpired,
    status: result.status,
    message: result.message,
    created_at: startedAt,
  })));

  const finishedAt = new Date().toISOString();

  return {
    startedAt,
    finishedAt,
    offersFound: results.reduce((sum, r) => sum + r.offersFound, 0),
    offersCreated: results.reduce((sum, r) => sum + r.offersCreated, 0),
    offersUpdated: results.reduce((sum, r) => sum + r.offersUpdated, 0),
    offersExpired: results.reduce((sum, r) => sum + r.offersExpired, 0),
    providers: results,
  };
}
