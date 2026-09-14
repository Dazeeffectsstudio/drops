import { supabaseAdmin } from "@/lib/supabase/admin-client";
import { supabasePublic } from "@/lib/supabase/public-client";

export type PriceHistoryEntry = { id: string; originalPrice: number | null; currentPrice: number; capturedAt: string };

// Enregistre un point d'historique de prix pour une offre. Appelé par
// src/lib/sync-offers.ts à chaque création, et à chaque mise à jour où le
// prix a changé — jamais pour les autres changements (image, description).
export async function recordPriceChange(offerId: string, originalPrice: number | null, currentPrice: number): Promise<void> {
  if (!supabaseAdmin) return;
  const { error } = await supabaseAdmin.from("offer_price_history").insert({
    offer_id: offerId,
    original_price: originalPrice,
    current_price: currentPrice,
  });
  if (error) console.error("[price-history-repository] recordPriceChange:", error.message);
}

// Lecture publique (RLS : offer_price_history_public_read autorise tout le
// monde) — affichée sur la page de détail d'une offre (voir offer-detail.tsx).
export async function getPriceHistoryForOffer(offerId: string): Promise<PriceHistoryEntry[]> {
  if (!supabasePublic) return [];
  const { data, error } = await supabasePublic
    .from("offer_price_history")
    .select("id, original_price, current_price, captured_at")
    .eq("offer_id", offerId)
    .order("captured_at", { ascending: true });
  if (error) { console.error("[price-history-repository] getPriceHistoryForOffer:", error.message); return []; }
  return (data ?? []).map((row) => ({
    id: row.id,
    originalPrice: row.original_price === null ? null : Number(row.original_price),
    currentPrice: Number(row.current_price),
    capturedAt: row.captured_at,
  }));
}
