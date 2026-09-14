import { cache } from "react";
import type { AccentColor } from "@/lib/catalog";
import { buildOffer } from "@/lib/offer-builder";
import { supabaseAdmin } from "@/lib/supabase/admin-client";
import { isSupabaseConfigured, supabasePublic } from "@/lib/supabase/public-client";
import type { OfferInsert, OfferRow } from "@/types/database";
import type { Offer, OfferCategory, OfferStore, Platform } from "@/types/offer";

// Couche unique d'accès aux offres. Remplace l'ancien src/data/offers.ts :
// toutes les pages lisent désormais depuis Supabase via ces fonctions.
// Si les variables d'environnement Supabase sont absentes, ces fonctions
// renvoient une liste vide au lieu de planter — voir le README / le
// rapport de mission pour comment connecter Supabase.

export function mapRowToOffer(row: OfferRow): Offer {
  // PostgREST renvoie les colonnes `numeric` (original_price, current_price)
  // sous forme de chaînes de caractères, pas de nombres — sans cette
  // conversion, toute comparaison de prix (ex. la détection de changement
  // dans src/lib/sync-offers.ts) échouerait systématiquement.
  return buildOffer({
    id: row.id,
    title: row.title,
    description: row.description,
    platform: row.platform as Platform,
    store: row.store as OfferStore,
    category: row.category as OfferCategory,
    image: row.image,
    originalPrice: row.original_price === null ? null : Number(row.original_price),
    currentPrice: Number(row.current_price),
    startsAt: row.starts_at,
    expiresAt: row.expires_at,
    url: row.url,
    accent: row.accent as AccentColor,
    featured: row.featured,
    trending: row.trending,
    isNew: row.is_new,
  });
}

export type OfferFormInput = {
  id?: string;
  title: string;
  description: string;
  platform: Platform;
  store: OfferStore;
  category: OfferCategory;
  image: string;
  originalPrice: number | null;
  currentPrice: number;
  startsAt: string | null;
  expiresAt: string;
  url: string;
  featured: boolean;
  trending: boolean;
  isNew: boolean;
};

function mapInputToRow(id: string, input: OfferFormInput): OfferInsert {
  return {
    id,
    title: input.title,
    description: input.description,
    platform: input.platform,
    store: input.store,
    category: input.category,
    image: input.image,
    original_price: input.originalPrice,
    current_price: input.currentPrice,
    starts_at: input.startsAt,
    expires_at: input.expiresAt,
    url: input.url,
    accent: "lime",
    featured: input.featured,
    trending: input.trending,
    is_new: input.isNew,
  };
}

function warnUnconfigured(action: string) {
  console.warn(`[offers-repository] Supabase n'est pas configuré — ${action} annulé. Voir .env.local.example.`);
}

// `cache()` de React dédoublonne les appels identiques au sein d'UNE MÊME
// requête serveur (ex. plusieurs Server Components qui appellent
// getAllOffers() dans le même arbre de rendu, comme /calendar) — ça ne met
// rien en cache entre deux requêtes différentes (chaque visiteur voit
// toujours les offres à jour), juste un aller-retour Supabase économisé par
// page quand plusieurs composants ont besoin de la même liste.
export const getAllOffers = cache(async (): Promise<Offer[]> => {
  if (!supabasePublic) { warnUnconfigured("lecture des offres"); return []; }
  const { data, error } = await supabasePublic.from("offers").select("*").order("expires_at", { ascending: true });
  if (error) { console.error("[offers-repository] getAllOffers:", error.message); return []; }
  return (data ?? []).map(mapRowToOffer);
});

export type OfferWithTimestamps = Offer & { createdAt: string; updatedAt: string };

// Variante utilisée uniquement par le dashboard admin, pour savoir quelles
// offres ont été créées/modifiées par la dernière synchronisation (voir
// src/components/admin/offers-table.tsx). Le reste du site n'a pas besoin
// de ces dates et continue d'utiliser getAllOffers().
export async function getAllOffersWithTimestamps(): Promise<OfferWithTimestamps[]> {
  if (!supabasePublic) { warnUnconfigured("lecture des offres (admin)"); return []; }
  const { data, error } = await supabasePublic.from("offers").select("*").order("expires_at", { ascending: true });
  if (error) { console.error("[offers-repository] getAllOffersWithTimestamps:", error.message); return []; }
  return (data ?? []).map((row) => ({ ...mapRowToOffer(row), createdAt: row.created_at, updatedAt: row.updated_at }));
}

export async function getOfferById(id: string): Promise<Offer | null> {
  if (!supabasePublic) { warnUnconfigured("lecture d'une offre"); return null; }
  const { data, error } = await supabasePublic.from("offers").select("*").eq("id", id).maybeSingle();
  if (error) { console.error("[offers-repository] getOfferById:", error.message); return null; }
  return data ? mapRowToOffer(data) : null;
}

export async function getOffersByStore(store: OfferStore): Promise<Offer[]> {
  if (!supabasePublic) { warnUnconfigured("lecture des offres par plateforme"); return []; }
  const { data, error } = await supabasePublic.from("offers").select("*").eq("store", store).order("expires_at", { ascending: true });
  if (error) { console.error("[offers-repository] getOffersByStore:", error.message); return []; }
  return (data ?? []).map(mapRowToOffer);
}

export async function getOffersByCategory(category: OfferCategory): Promise<Offer[]> {
  if (!supabasePublic) { warnUnconfigured("lecture des offres par catégorie"); return []; }
  const { data, error } = await supabasePublic.from("offers").select("*").eq("category", category).order("expires_at", { ascending: true });
  if (error) { console.error("[offers-repository] getOffersByCategory:", error.message); return []; }
  return (data ?? []).map(mapRowToOffer);
}

// "Offres similaires" sur la page de détail : même catégorie en priorité,
// complété par la même plateforme si besoin, jamais l'offre elle-même.
export async function getRelatedOffers(offer: Offer, limit = 4): Promise<Offer[]> {
  if (!supabasePublic) { warnUnconfigured("lecture des offres similaires"); return []; }
  const { data, error } = await supabasePublic
    .from("offers")
    .select("*")
    .or(`category.eq.${offer.category},store.eq.${offer.store}`)
    .neq("id", offer.id)
    .order("expires_at", { ascending: true })
    .limit(limit * 3);
  if (error) { console.error("[offers-repository] getRelatedOffers:", error.message); return []; }
  const mapped = (data ?? []).map(mapRowToOffer);
  const sameCategory = mapped.filter((entry) => entry.category === offer.category);
  const sameStore = mapped.filter((entry) => entry.store === offer.store && entry.category !== offer.category);
  return [...sameCategory, ...sameStore].slice(0, limit);
}

function slugify(title: string): string {
  return title
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-+|-+$)/g, "")
    .slice(0, 80);
}

export async function createOffer(input: OfferFormInput): Promise<{ error?: string }> {
  if (!supabaseAdmin) return { error: "Supabase n'est pas configuré côté serveur (SUPABASE_SERVICE_ROLE_KEY manquante)." };
  const id = input.id?.trim() || slugify(input.title);
  if (!id) return { error: "Impossible de générer un identifiant à partir de ce titre." };
  const { error } = await supabaseAdmin.from("offers").insert(mapInputToRow(id, input));
  if (error) {
    if (error.code === "23505") return { error: "Une offre avec cet identifiant existe déjà. Choisis un titre différent." };
    return { error: error.message };
  }
  return {};
}

export async function updateOffer(id: string, input: OfferFormInput): Promise<{ error?: string }> {
  if (!supabaseAdmin) return { error: "Supabase n'est pas configuré côté serveur (SUPABASE_SERVICE_ROLE_KEY manquante)." };
  const { error } = await supabaseAdmin.from("offers").update(mapInputToRow(id, input)).eq("id", id);
  if (error) return { error: error.message };
  return {};
}

export async function deleteOffer(id: string): Promise<{ error?: string }> {
  if (!supabaseAdmin) return { error: "Supabase n'est pas configuré côté serveur (SUPABASE_SERVICE_ROLE_KEY manquante)." };
  const { error } = await supabaseAdmin.from("offers").delete().eq("id", id);
  if (error) return { error: error.message };
  return {};
}

export { isSupabaseConfigured };
