import { findCategoryEntry, type AccentColor } from "@/lib/catalog";
import { supabaseAdmin } from "@/lib/supabase/admin-client";
import { isSupabaseConfigured, supabasePublic } from "@/lib/supabase/public-client";
import type { OfferInsert, OfferRow } from "@/types/database";
import type { Offer, OfferCategory, OfferStore, Platform } from "@/types/offer";

// Couche unique d'accès aux offres. Remplace l'ancien src/data/offers.ts :
// toutes les pages lisent désormais depuis Supabase via ces fonctions.
// Si les variables d'environnement Supabase sont absentes, ces fonctions
// renvoient une liste vide au lieu de planter — voir le README / le
// rapport de mission pour comment connecter Supabase.

function mapRowToOffer(row: OfferRow): Offer {
  const category = row.category as OfferCategory;
  const defaults = findCategoryEntry(category);
  return {
    id: row.id,
    title: row.title,
    eyebrow: defaults?.eyebrow ?? "OFFRE GRATUITE",
    platform: row.platform as Platform,
    store: row.store as OfferStore,
    category,
    kind: defaults?.kind ?? "Offre gratuite à récupérer",
    description: row.description,
    originalPrice: row.original_price,
    currentPrice: row.current_price,
    startsAt: row.starts_at ?? undefined,
    expiresAt: row.expires_at,
    url: row.url,
    image: row.image,
    imageAlt: row.title,
    accent: row.accent as AccentColor,
    featured: row.featured,
    trending: row.trending,
    isNew: row.is_new,
  };
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

export async function getAllOffers(): Promise<Offer[]> {
  if (!supabasePublic) { warnUnconfigured("lecture des offres"); return []; }
  const { data, error } = await supabasePublic.from("offers").select("*").order("expires_at", { ascending: true });
  if (error) { console.error("[offers-repository] getAllOffers:", error.message); return []; }
  return (data ?? []).map(mapRowToOffer);
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
