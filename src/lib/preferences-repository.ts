import { createSupabaseServerClient } from "@/lib/supabase/server-client";
import type { OfferCategory, OfferStore } from "@/types/offer";

export type UserPreferences = { platforms: OfferStore[]; categories: OfferCategory[]; country: string };

const defaultPreferences: UserPreferences = { platforms: [], categories: [], country: "BE" };

export async function getUserPreferences(): Promise<UserPreferences> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return defaultPreferences;
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return defaultPreferences;
  const { data } = await supabase.from("user_preferences").select("*").eq("user_id", user.id).maybeSingle();
  if (!data) return defaultPreferences;
  return {
    platforms: (data.platforms ?? []) as OfferStore[],
    categories: (data.categories ?? []) as OfferCategory[],
    country: data.country || "BE",
  };
}

export async function saveUserPreferences(preferences: UserPreferences): Promise<{ error?: string }> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return { error: "Supabase n'est pas configuré." };
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Connecte-toi pour sauvegarder tes préférences." };

  const { error } = await supabase.from("user_preferences").upsert({
    user_id: user.id,
    platforms: preferences.platforms,
    categories: preferences.categories,
    country: preferences.country,
    updated_at: new Date().toISOString(),
  });
  return { error: error?.message };
}
