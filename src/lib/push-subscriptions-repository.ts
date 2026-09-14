import { createSupabaseServerClient } from "@/lib/supabase/server-client";
import { supabaseAdmin } from "@/lib/supabase/admin-client";

// Architecture Web Push activée en V8 — voir src/lib/push/client.ts pour
// l'envoi effectif et src/components/push-notification-toggle.tsx pour
// l'interface d'activation/désactivation côté navigateur.
export type PushSubscriptionInput = { endpoint: string; p256dh: string; auth: string };
export type StoredPushSubscription = { id: string; endpoint: string; p256dh: string; auth: string };

export async function savePushSubscription(subscription: PushSubscriptionInput): Promise<{ error?: string }> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return { error: "Supabase n'est pas configuré." };
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Connecte-toi pour activer les notifications push." };

  const { error } = await supabase
    .from("push_subscriptions")
    .upsert(
      { user_id: user.id, endpoint: subscription.endpoint, p256dh: subscription.p256dh, auth: subscription.auth },
      { onConflict: "user_id,endpoint" },
    );
  return { error: error?.message };
}

export async function deletePushSubscription(endpoint: string): Promise<{ error?: string }> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return { error: "Supabase n'est pas configuré." };
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Connecte-toi pour gérer les notifications push." };

  const { error } = await supabase.from("push_subscriptions").delete().eq("user_id", user.id).eq("endpoint", endpoint);
  return { error: error?.message };
}

export async function hasMyPushSubscription(): Promise<boolean> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return false;
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;
  const { data } = await supabase.from("push_subscriptions").select("id").eq("user_id", user.id).limit(1).maybeSingle();
  return Boolean(data);
}

// Réservé au service de notifications (src/lib/notification-dispatch.ts) :
// passe par le client service_role car il doit lire les abonnements de
// tous les comptes.
export async function getPushSubscriptionsForUser(userId: string): Promise<StoredPushSubscription[]> {
  if (!supabaseAdmin) return [];
  const { data } = await supabaseAdmin.from("push_subscriptions").select("id, endpoint, p256dh, auth").eq("user_id", userId);
  return data ?? [];
}

export async function deletePushSubscriptionById(id: string): Promise<void> {
  if (!supabaseAdmin) return;
  await supabaseAdmin.from("push_subscriptions").delete().eq("id", id);
}
