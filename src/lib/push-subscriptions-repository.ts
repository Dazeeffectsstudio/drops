import { createSupabaseServerClient } from "@/lib/supabase/server-client";

// Architecture prête pour les Web Push, non activée pour l'instant (aucune
// UI n'appelle encore cette fonction — voir la mission V7, section 8).
// Quand les notifications navigateur seront activées, le Service Worker
// appellera une future Server Action qui passera par cette fonction avec
// les champs renvoyés par `PushSubscription.toJSON()`.
export type PushSubscriptionInput = { endpoint: string; p256dh: string; auth: string };

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
