"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { categories, findPlatformByStore, platforms } from "@/lib/catalog";
import { createOffer, deleteOffer, updateOffer, type OfferFormInput } from "@/lib/offers-repository";
import type { OfferCategory, OfferStore } from "@/types/offer";

export type OfferFormState = { error?: string };

const storeValues = platforms.map((entry) => entry.store);
const categoryValues = categories.map((entry) => entry.category);

function parseOfferForm(formData: FormData): { data: OfferFormInput } | { error: string } {
  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const store = String(formData.get("store") ?? "") as OfferStore;
  const category = String(formData.get("category") ?? "") as OfferCategory;
  const image = String(formData.get("image") ?? "").trim();
  const url = String(formData.get("url") ?? "").trim();
  const expiresAtRaw = String(formData.get("expiresAt") ?? "");
  const startsAtRaw = String(formData.get("startsAt") ?? "").trim();
  const originalPriceRaw = String(formData.get("originalPrice") ?? "").trim();
  const currentPriceRaw = String(formData.get("currentPrice") ?? "0").trim();

  if (!title) return { error: "Le titre est obligatoire." };
  if (!description) return { error: "La description est obligatoire." };
  if (!storeValues.includes(store)) return { error: "Choisis une plateforme valide." };
  if (!categoryValues.includes(category)) return { error: "Choisis une catégorie valide." };
  if (!image) return { error: "L'image est obligatoire (chemin ou URL)." };
  if (!url) return { error: "Le lien est obligatoire." };
  if (!expiresAtRaw) return { error: "La date d'expiration est obligatoire." };

  const expiresAtDate = new Date(expiresAtRaw);
  if (Number.isNaN(expiresAtDate.getTime())) return { error: "La date d'expiration est invalide." };

  let startsAt: string | null = null;
  if (startsAtRaw) {
    const startsAtDate = new Date(startsAtRaw);
    if (Number.isNaN(startsAtDate.getTime())) return { error: "La date de début est invalide." };
    if (startsAtDate.getTime() >= expiresAtDate.getTime()) return { error: "La date de début doit être avant la date d'expiration." };
    startsAt = startsAtDate.toISOString();
  }

  const currentPrice = Number(currentPriceRaw);
  if (Number.isNaN(currentPrice) || currentPrice < 0) return { error: "Le prix actuel doit être un nombre positif." };

  let originalPrice: number | null = null;
  if (originalPriceRaw) {
    originalPrice = Number(originalPriceRaw);
    if (Number.isNaN(originalPrice) || originalPrice < 0) return { error: "L'ancien prix doit être un nombre positif." };
  }

  const platformEntry = findPlatformByStore(store);
  if (!platformEntry) return { error: "Plateforme inconnue." };

  return {
    data: {
      id: String(formData.get("id") ?? "").trim() || undefined,
      title,
      description,
      platform: platformEntry.platform,
      store,
      category,
      image,
      originalPrice,
      currentPrice,
      startsAt,
      expiresAt: expiresAtDate.toISOString(),
      url,
      featured: formData.get("featured") === "on",
      trending: formData.get("trending") === "on",
      isNew: formData.get("isNew") === "on",
    },
  };
}

export async function saveOfferAction(_prevState: OfferFormState, formData: FormData): Promise<OfferFormState> {
  const parsed = parseOfferForm(formData);
  if ("error" in parsed) return { error: parsed.error };

  const id = String(formData.get("id") ?? "").trim();
  const result = id ? await updateOffer(id, parsed.data) : await createOffer(parsed.data);
  if (result.error) return { error: result.error };

  revalidatePath("/admin");
  revalidatePath("/");
  revalidatePath("/platforms");
  revalidatePath("/categories");
  redirect("/admin");
}

export async function deleteOfferAction(id: string): Promise<{ error?: string }> {
  const result = await deleteOffer(id);
  if (!result.error) {
    revalidatePath("/admin");
    revalidatePath("/");
    revalidatePath("/platforms");
    revalidatePath("/categories");
  }
  return result;
}
