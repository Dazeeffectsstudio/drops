"use server";

import { revalidatePath } from "next/cache";
import { markAllNotificationsRead, subscribeToOffer } from "@/lib/notification-subscriptions-repository";

export async function markAllNotificationsReadAction(): Promise<void> {
  await markAllNotificationsRead();
  revalidatePath("/notifications");
}

export async function subscribeToOfferAction(offerId: string): Promise<{ error?: string; alreadySubscribed?: boolean }> {
  const result = await subscribeToOffer(offerId);
  if (!result.error) revalidatePath("/notifications");
  return result;
}
