"use server";

import { revalidatePath } from "next/cache";
import { toggleFavorite } from "@/lib/favorites-repository";

export async function toggleFavoriteAction(offerId: string): Promise<{ error?: string }> {
  const result = await toggleFavorite(offerId);
  if (!result.error) {
    revalidatePath("/favoris");
    revalidatePath("/account");
  }
  return result;
}
