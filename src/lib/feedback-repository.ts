import { createSupabaseServerClient } from "@/lib/supabase/server-client";
import { supabaseAdmin } from "@/lib/supabase/admin-client";

export type FeedbackType = "bug" | "platform" | "feature";

export async function submitFeedback(type: FeedbackType, message: string): Promise<{ error?: string }> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return { error: "Supabase n'est pas configuré." };
  const { data: { user } } = await supabase.auth.getUser();

  const { error } = await supabase.from("feedback").insert({ type, message, user_id: user?.id ?? null });
  return { error: error?.message };
}

export type FeedbackEntry = { id: string; type: string; message: string; userEmail: string | null; createdAt: string; status: string };

// Réservé à /admin/feedback : passe par le client service_role pour lire
// tous les retours (les policies RLS de `feedback` n'autorisent aucune
// lecture par un utilisateur normal, y compris le sien).
export async function getAllFeedback(): Promise<FeedbackEntry[]> {
  if (!supabaseAdmin) return [];
  const { data, error } = await supabaseAdmin.from("feedback").select("*").order("created_at", { ascending: false }).limit(200);
  if (error || !data) return [];

  const userIds = [...new Set(data.map((row) => row.user_id).filter((id): id is string => Boolean(id)))];
  const emailById = new Map<string, string>();
  if (userIds.length > 0) {
    const { data: usersData } = await supabaseAdmin.auth.admin.listUsers({ perPage: 1000 });
    for (const u of usersData?.users ?? []) if (u.email) emailById.set(u.id, u.email);
  }

  return data.map((row) => ({
    id: row.id,
    type: row.type,
    message: row.message,
    userEmail: row.user_id ? (emailById.get(row.user_id) ?? "compte supprimé") : null,
    createdAt: row.created_at,
    status: row.status,
  }));
}

export async function updateFeedbackStatus(id: string, status: string): Promise<{ error?: string }> {
  if (!supabaseAdmin) return { error: "Supabase n'est pas configuré côté serveur." };
  const { error } = await supabaseAdmin.from("feedback").update({ status }).eq("id", id);
  return { error: error?.message };
}
