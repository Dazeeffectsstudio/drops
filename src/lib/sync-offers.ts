import { createOffer, getAllOffers, updateOffer, type OfferFormInput } from "@/lib/offers-repository";
import { PLACEHOLDER_IMAGE, validateOfferDraft } from "@/lib/providers/normalize";
import { providers, SYNC_ID_PREFIX, type OfferProvider } from "@/lib/providers";
import { recordPriceChange } from "@/lib/price-history-repository";
import { runNotificationDispatch } from "@/lib/notification-dispatch";
import { insertSyncLog } from "@/lib/sync-logs-repository";
import type { Offer } from "@/types/offer";

export type ProviderSyncResult = {
  provider: string;
  label: string;
  mode: "real" | "simulated";
  status: "success" | "error";
  offersFound: number;
  offersCreated: number;
  offersUpdated: number;
  offersExpired: number;
  offersSkipped: number;
  durationMs: number;
  message: string | null;
  createdOffers: Offer[];
};

export type SyncSummary = {
  startedAt: string;
  finishedAt: string;
  offersFound: number;
  offersCreated: number;
  offersUpdated: number;
  offersExpired: number;
  offersSkipped: number;
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

// Renvoie la liste des champs qui ont changé entre la version en base et
// la version fraîchement récupérée — sert à la fois à décider s'il faut
// mettre à jour et à produire un résumé lisible (repris dans sync_logs).
// On ne compare pas featured/trending/isNew : ce sont des choix
// éditoriaux, pas des données de catalogue, un provider ne doit pas les
// écraser après coup.
function detectChanges(existing: Offer, incoming: Offer): string[] {
  const changes: string[] = [];
  if (existing.originalPrice !== incoming.originalPrice || existing.currentPrice !== incoming.currentPrice) changes.push("prix");
  if (!sameInstant(existing.expiresAt, incoming.expiresAt)) changes.push("date d'expiration");
  if (!sameInstant(existing.startsAt, incoming.startsAt)) changes.push("date de début");
  if (existing.image !== incoming.image) changes.push("image");
  if (existing.description !== incoming.description) changes.push("description");
  return changes;
}

function isAlreadyExpired(offer: Offer): boolean {
  return new Date(offer.expiresAt).getTime() <= Date.now();
}

async function syncProvider(provider: OfferProvider, existingOffers: Offer[]): Promise<ProviderSyncResult> {
  const startedAt = Date.now();
  const existingForStore = existingOffers.filter((offer) => offer.store === provider.store);
  const existingById = new Map(existingForStore.map((offer) => [offer.id, offer]));

  let offers: Offer[];
  try {
    offers = await provider.fetchOffers();
  } catch (error) {
    return {
      provider: provider.key,
      label: provider.label,
      mode: provider.mode,
      status: "error",
      offersFound: 0,
      offersCreated: 0,
      offersUpdated: 0,
      offersExpired: 0,
      offersSkipped: 0,
      durationMs: Date.now() - startedAt,
      message: error instanceof Error ? error.message : String(error),
      createdOffers: [],
    };
  }

  let created = 0;
  let updated = 0;
  let expired = 0;
  let skipped = 0;
  let imagesFallenBack = 0;
  const changeNotes: string[] = [];
  const skipNotes: string[] = [];
  const createdOffers: Offer[] = [];

  for (const incoming of offers) {
    if (incoming.image === PLACEHOLDER_IMAGE) imagesFallenBack += 1;

    const validation = validateOfferDraft({
      title: incoming.title,
      url: incoming.url,
      expiresAt: incoming.expiresAt,
      image: incoming.image,
      originalPrice: incoming.originalPrice,
      currentPrice: incoming.currentPrice,
    });
    if (!validation.valid) {
      skipped += 1;
      skipNotes.push(`"${incoming.title}" ignorée (${validation.reason})`);
      continue;
    }

    const existing = existingById.get(incoming.id);
    if (!existing) {
      const result = await createOffer(offerToInput(incoming));
      if (!result.error) {
        created += 1;
        createdOffers.push(incoming);
        await recordPriceChange(incoming.id, incoming.originalPrice, incoming.currentPrice);
      }
    } else {
      const changes = detectChanges(existing, incoming);
      if (changes.length > 0) {
        const result = await updateOffer(incoming.id, offerToInput(incoming));
        if (!result.error) {
          updated += 1;
          changeNotes.push(`"${incoming.title}" : ${changes.join(", ")}`);
          if (changes.includes("prix")) await recordPriceChange(incoming.id, incoming.originalPrice, incoming.currentPrice);
        }
      }
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

  const notes: string[] = [];
  if (imagesFallenBack > 0) notes.push(`${imagesFallenBack} image(s) de remplacement utilisée(s)`);
  if (skipNotes.length > 0) notes.push(...skipNotes);
  if (changeNotes.length > 0) notes.push(...changeNotes);

  return {
    provider: provider.key,
    label: provider.label,
    mode: provider.mode,
    status: "success",
    offersFound: offers.length,
    offersCreated: created,
    offersUpdated: updated,
    offersExpired: expired,
    offersSkipped: skipped,
    durationMs: Date.now() - startedAt,
    message: notes.length > 0 ? notes.join(" · ") : null,
    createdOffers,
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
    offers_skipped: result.offersSkipped,
    status: result.status,
    message: result.message,
    duration_ms: result.durationMs,
    created_at: startedAt,
  })));

  // Notifications (V8) : email + push pour les nouvelles offres, les
  // offres suivies qui démarrent, et celles qui expirent bientôt. Ne
  // bloque jamais la synchronisation elle-même (voir runNotificationDispatch).
  const newlyCreatedOffers = results.flatMap((result) => result.createdOffers);
  await runNotificationDispatch(newlyCreatedOffers);

  const finishedAt = new Date().toISOString();

  return {
    startedAt,
    finishedAt,
    offersFound: results.reduce((sum, r) => sum + r.offersFound, 0),
    offersCreated: results.reduce((sum, r) => sum + r.offersCreated, 0),
    offersUpdated: results.reduce((sum, r) => sum + r.offersUpdated, 0),
    offersExpired: results.reduce((sum, r) => sum + r.offersExpired, 0),
    offersSkipped: results.reduce((sum, r) => sum + r.offersSkipped, 0),
    providers: results,
  };
}
