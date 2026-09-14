import { checkAndAwardBadges } from "@/lib/badges";
import { createSupabaseServerClient } from "@/lib/supabase/server-client";

// Favoris en base pour les comptes connectés — les visiteurs non connectés
// continuent d'utiliser localStorage (voir src/lib/favorites.ts). Ce
// repository utilise le client "session utilisateur" (pas le client admin) :
// les policies RLS de la table `favorites` garantissent que chaque compte
// ne voit et ne modifie que ses propres favoris.

export async function getCurrentFavoritesState(): Promise<{ userId: string | null; favorites: string[] }> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return { userId: null, favorites: [] };
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { userId: null, favorites: [] };
  const { data, error } = await supabase.from("favorites").select("offer_id").eq("user_id", user.id);
  if (error || !data) return { userId: user.id, favorites: [] };
  return { userId: user.id, favorites: data.map((row) => row.offer_id) };
}

export async function toggleFavorite(offerId: string): Promise<{ error?: string }> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return { error: "Supabase n'est pas configuré." };
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Connecte-toi pour sauvegarder tes favoris." };

  const { data: existing } = await supabase.from("favorites").select("offer_id").eq("user_id", user.id).eq("offer_id", offerId).maybeSingle();
  if (existing) {
    const { error } = await supabase.from("favorites").delete().eq("user_id", user.id).eq("offer_id", offerId);
    return { error: error?.message };
  }
  const { error } = await supabase.from("favorites").insert({ user_id: user.id, offer_id: offerId });
  if (!error) await checkAndAwardBadges(user.id);
  return { error: error?.message };
}
