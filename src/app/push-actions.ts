"use server";

import { deletePushSubscription, savePushSubscription, type PushSubscriptionInput } from "@/lib/push-subscriptions-repository";

export async function savePushSubscriptionAction(subscription: PushSubscriptionInput): Promise<{ error?: string }> {
  return savePushSubscription(subscription);
}

export async function deletePushSubscriptionAction(endpoint: string): Promise<{ error?: string }> {
  return deletePushSubscription(endpoint);
}
