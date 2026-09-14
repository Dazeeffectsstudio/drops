// Utilitaires partagés par tous les providers pour convertir une donnée
// brute (venant d'une vraie API externe) vers le type Offer, et pour
// vérifier qu'une offre est utilisable avant de l'envoyer à Supabase.
// Centraliser cette logique ici évite que chaque provider réinvente sa
// propre façon de nettoyer un prix, une image ou une description.

export const PLACEHOLDER_IMAGE = "/images/placeholder.svg";

// Convertit une valeur de prix potentiellement sale (string, centimes,
// undefined...) en nombre propre, ou null si elle est inutilisable.
export function normalizePrice(value: unknown): number | null {
  if (value === null || value === undefined) return null;
  const num = typeof value === "string" ? Number(value) : value;
  if (typeof num !== "number" || Number.isNaN(num) || num < 0) return null;
  return Math.round(num * 100) / 100;
}

// Vérifie qu'une URL d'image est plausible (http/https). Sinon, renvoie
// l'image de secours. `warn` est appelé quand le secours est utilisé, pour
// que l'appelant puisse le consigner dans sync_logs.
export function normalizeImageUrl(url: string | null | undefined, warn?: (reason: string) => void): string {
  if (!url) { warn?.("image manquante"); return PLACEHOLDER_IMAGE; }
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") throw new Error("protocole invalide");
    return url;
  } catch {
    warn?.(`image invalide (${url})`);
    return PLACEHOLDER_IMAGE;
  }
}

export function clampDescription(text: string | null | undefined, max = 600): string {
  const clean = (text ?? "").trim();
  if (!clean) return "Offre gratuite à récupérer.";
  return clean.length > max ? `${clean.slice(0, max - 1)}…` : clean;
}

export type OfferValidationResult = { valid: true } | { valid: false; reason: string };

// Dernière ligne de défense avant insertion : une offre qui échoue ici est
// ignorée par syncAllOffers() (voir src/lib/sync-offers.ts), pas insérée
// en base.
export function validateOfferDraft(draft: {
  title: string;
  url: string;
  expiresAt: string;
  image: string;
  originalPrice: number | null;
  currentPrice: number;
}): OfferValidationResult {
  if (!draft.title.trim()) return { valid: false, reason: "titre manquant" };
  if (!draft.url.trim()) return { valid: false, reason: "lien manquant" };
  if (!draft.image.trim()) return { valid: false, reason: "image manquante" };
  const expires = new Date(draft.expiresAt).getTime();
  if (Number.isNaN(expires)) return { valid: false, reason: "date d'expiration invalide" };
  if (draft.originalPrice !== null && draft.originalPrice < draft.currentPrice) {
    return { valid: false, reason: "prix incohérent (ancien prix < prix actuel)" };
  }
  return { valid: true };
}
