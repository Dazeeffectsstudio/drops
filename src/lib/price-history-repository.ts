import { supabaseAdmin } from "@/lib/supabase/admin-client";

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
