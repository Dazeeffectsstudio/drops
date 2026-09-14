"use server";

import { revalidatePath } from "next/cache";
import { saveUserPreferences } from "@/lib/preferences-repository";
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
