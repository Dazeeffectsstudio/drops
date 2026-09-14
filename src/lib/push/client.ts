import webpush from "web-push";

const PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
const PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY;
const CONTACT = process.env.VAPID_CONTACT_EMAIL || "mailto:contact@example.com";

export const isPushConfigured = Boolean(PUBLIC_KEY && PRIVATE_KEY);

if (isPushConfigured) {
  webpush.setVapidDetails(CONTACT, PUBLIC_KEY as string, PRIVATE_KEY as string);
}

export type PushSubscriptionKeys = { endpoint: string; p256dh: string; auth: string };
export type PushPayload = { title: string; body: string; url: string };
export type PushResult = { sent: boolean; error?: string; expired?: boolean };

// Sans clés VAPID configurées, ne fait rien de réel — même logique de repli
// que le reste du projet (voir src/lib/email/client.ts). `expired: true`
// signale un abonnement mort (utilisateur a désinstallé/bloqué les
// notifications) : le service appelant doit alors le supprimer de
// push_subscriptions plutôt que de continuer à réessayer.
export async function sendPushNotification(subscription: PushSubscriptionKeys, payload: PushPayload): Promise<PushResult> {
  if (!isPushConfigured) {
    console.info(`[push] mode développement (VAPID non configuré) — aucun envoi réel. Titre: ${payload.title}`);
    return { sent: false };
  }
  try {
    await webpush.sendNotification(
      { endpoint: subscription.endpoint, keys: { p256dh: subscription.p256dh, auth: subscription.auth } },
      JSON.stringify(payload),
    );
    return { sent: true };
  } catch (error) {
    const statusCode = (error as { statusCode?: number } | undefined)?.statusCode;
    const expired = statusCode === 404 || statusCode === 410;
    return { sent: false, error: error instanceof Error ? error.message : String(error), expired };
  }
}
