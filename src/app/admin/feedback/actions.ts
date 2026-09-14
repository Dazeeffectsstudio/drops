"use server";

import { revalidatePath } from "next/cache";
import { updateFeedbackStatus } from "@/lib/feedback-repository";

export async function updateFeedbackStatusAction(id: string, status: string): Promise<{ error?: string }> {
  const result = await updateFeedbackStatus(id, status);
  if (!result.error) revalidatePath("/admin/feedback");
  return result;
}
