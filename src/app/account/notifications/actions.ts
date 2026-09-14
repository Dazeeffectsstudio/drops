"use server";

import { revalidatePath } from "next/cache";
import { saveNotificationPreferences } from "@/lib/notification-preferences-repository";

export type NotificationPreferencesFormState = { error?: string; success?: boolean };

export async function saveNotificationPreferencesAction(_prevState: NotificationPreferencesFormState, formData: FormData): Promise<NotificationPreferencesFormState> {
  const result = await saveNotificationPreferences({
    newOffers: formData.get("newOffers") === "on",
    epicGames: formData.get("epicGames") === "on",
    steam: formData.get("steam") === "on",
    expiringSoon: formData.get("expiringSoon") === "on",
    twitchDrops: formData.get("twitchDrops") === "on",
    primeGaming: formData.get("primeGaming") === "on",
  });
  if (result.error) return { error: result.error };

  revalidatePath("/account/notifications");
  return { success: true };
}
