"use server";

import { revalidatePath } from "next/cache";
import { saveUserPreferences } from "@/lib/preferences-repository";
import { createSupabaseServerClient } from "@/lib/supabase/server-client";
import type { OfferCategory, OfferStore } from "@/types/offer";

export type PreferencesFormState = { error?: string; success?: boolean };

export async function savePreferencesAction(_prevState: PreferencesFormState, formData: FormData): Promise<PreferencesFormState> {
  const platforms = formData.getAll("platforms").map(String) as OfferStore[];
  const categories = formData.getAll("categories").map(String) as OfferCategory[];
  const country = String(formData.get("country") ?? "BE").trim() || "BE";

  const result = await saveUserPreferences({ platforms, categories, country });
  if (result.error) return { error: result.error };

  revalidatePath("/account");
  return { success: true };
}

export type PseudoFormState = { error?: string; success?: boolean };

export async function updatePseudoAction(_prevState: PseudoFormState, formData: FormData): Promise<PseudoFormState> {
  const pseudo = String(formData.get("pseudo") ?? "").trim().slice(0, 32);
  if (pseudo.length < 2) return { error: "Le pseudo doit contenir au moins 2 caractères." };

  const supabase = await createSupabaseServerClient();
  if (!supabase) return { error: "Supabase n'est pas configuré." };
  const { error } = await supabase.auth.updateUser({ data: { display_name: pseudo } });
  if (error) return { error: "Impossible d'enregistrer le pseudo." };

  revalidatePath("/account");
  return { success: true };
}
