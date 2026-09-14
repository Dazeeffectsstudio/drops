"use server";

import { submitFeedback, type FeedbackType } from "@/lib/feedback-repository";

export type FeedbackFormState = { error?: string; success?: boolean };

export async function submitFeedbackAction(_prevState: FeedbackFormState, formData: FormData): Promise<FeedbackFormState> {
  const type = String(formData.get("type") ?? "feature") as FeedbackType;
  const message = String(formData.get("message") ?? "").trim();
  if (!message) return { error: "Décris ton message avant d'envoyer." };
  if (message.length > 2000) return { error: "Message trop long (2000 caractères maximum)." };

  const result = await submitFeedback(type, message);
  if (result.error) return { error: result.error };
  return { success: true };
}
