"use server";

import { revalidatePath } from "next/cache";
import { saveBetaBanner } from "@/lib/beta-banner-repository";

export type BannerFormState = { error?: string; success?: boolean };

export async function saveBannerAction(_prevState: BannerFormState, formData: FormData): Promise<BannerFormState> {
  const enabled = formData.get("enabled") === "on";
  const message = String(formData.get("message") ?? "").trim();
  const linkUrl = String(formData.get("linkUrl") ?? "").trim() || null;
  const linkLabel = String(formData.get("linkLabel") ?? "").trim() || null;

  if (enabled && !message) return { error: "Le texte de la bannière est obligatoire si elle est activée." };

  const result = await saveBetaBanner({ enabled, message, linkUrl, linkLabel });
  if (result.error) return { error: result.error };

  revalidatePath("/", "layout");
  revalidatePath("/admin/banner");
  return { success: true };
}
