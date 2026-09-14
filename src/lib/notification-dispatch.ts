import { sendNewOfferEmail, sendOfferEndingSoonEmail, sendOfferStartedEmail } from "@/lib/email/send";
import { hasNotificationBeenSent, insertNotificationLog, type NotificationType } from "@/lib/notification-logs-repository";
import { getAllRecipientPreferences, type RecipientPreferences } from "@/lib/notification-preferences-repository";
import { mapRowToOffer } from "@/lib/offers-repository";
import { getOfferStatus } from "@/lib/offers";
import { deletePushSubscriptionById, getPushSubscriptionsForUser } from "@/lib/push-subscriptions-repository";
import { sendPushNotification } from "@/lib/push/client";
import { supabaseAdmin } from "@/lib/supabase/admin-client";
import type { OfferRow } from "@/types/database";
import type { Offer } from "@/types/offer";

// Service central qui décide QUI reçoit QUOI, envoie par email et par push,
// journalise chaque tentative dans notification_logs, et ne renvoie jamais
// deux fois la même notification (même utilisateur + même offre + même
// type + même canal — voir hasNotificationBeenSent). Appelé automatiquement
// à la fin de src/lib/sync-offers.ts et par /api/notifications/check-expiring.
//
// Chaque envoi est isolé dans son propre try/catch : une erreur (Resend en
// panne, abonnement push expiré, etc.) ne doit jamais interrompre le reste
// de la synchronisation.

const EXPIRING_SOON_WINDOWS: Array<{ type: NotificationType; maxMs: number; minMs: number; title: string }> = [
  { type: "offer_ending_soon_24h", maxMs: 24 * 60 * 60 * 1000, minMs: 2 * 60 * 60 * 1000, title: "⚠️ Bientôt fini (24h restantes)" },
  { type: "offer_ending_soon_2h", maxMs: 2 * 60 * 60 * 1000, minMs: 0, title: "⚠️ Dernière chance (2h restantes)" },
];

// Fonction pure (pas d'appel réseau) : à quelle fenêtre d'expiration
// appartient une offre dont il reste `remainingMs` millisecondes — ou
// aucune si elle est trop loin ou déjà passée. Isolée ici pour être
// testable sans mocker Supabase (voir notification-dispatch.test.ts).
export function matchExpiringSoonWindow(remainingMs: number): { type: NotificationType; title: string } | null {
  for (const window of EXPIRING_SOON_WINDOWS) {
    if (remainingMs > window.minMs && remainingMs <= window.maxMs) return { type: window.type, title: window.title };
  }
  return null;
}

function platformAllowed(pref: RecipientPreferences, store: string): boolean {
  if (store === "Epic Games") return pref.epicGames;
  if (store === "Steam") return pref.steam;
  if (store === "Twitch") return pref.twitchDrops;
  if (store === "Prime Gaming") return pref.primeGaming;
  return true; // pas de switch dédié en V8 pour PlayStation/Xbox/Roblox
}

async function deliverEmail(recipient: { userId: string; email: string }, offer: Offer, type: NotificationType): Promise<void> {
  if (await hasNotificationBeenSent(recipient.userId, offer.id, type, "email")) return;
  try {
    const sender = type === "new_offer" ? sendNewOfferEmail : type === "offer_started" ? sendOfferStartedEmail : sendOfferEndingSoonEmail;
    const result = await sender(recipient.email, offer);
    await insertNotificationLog({
      userId: recipient.userId,
      offerId: offer.id,
      type,
      provider: "email",
      status: result.error ? "error" : result.sent ? "sent" : "skipped",
      errorMessage: result.error ?? null,
    });
  } catch (error) {
    await insertNotificationLog({ userId: recipient.userId, offerId: offer.id, type, provider: "email", status: "error", errorMessage: error instanceof Error ? error.message : String(error) });
  }
}

async function deliverPush(userId: string, offer: Offer, type: NotificationType, payload: { title: string; body: string }): Promise<void> {
  if (await hasNotificationBeenSent(userId, offer.id, type, "push")) return;
  const subscriptions = await getPushSubscriptionsForUser(userId);
  if (subscriptions.length === 0) return;

  for (const subscription of subscriptions) {
    try {
      const result = await sendPushNotification(subscription, { ...payload, url: `/offres/${offer.id}` });
      if (result.expired) await deletePushSubscriptionById(subscription.id);
      await insertNotificationLog({
        userId,
        offerId: offer.id,
        type,
        provider: "push",
        status: result.error ? "error" : result.sent ? "sent" : "skipped",
        errorMessage: result.error ?? null,
      });
    } catch (error) {
      await insertNotificationLog({ userId, offerId: offer.id, type, provider: "push", status: "error", errorMessage: error instanceof Error ? error.message : String(error) });
    }
  }
}

export async function dispatchNewOfferNotifications(offers: Offer[], recipients: RecipientPreferences[]): Promise<void> {
  for (const offer of offers) {
    const eligible = recipients.filter((r) => r.newOffers && platformAllowed(r, offer.store));
    for (const recipient of eligible) {
      await deliverEmail(recipient, offer, "new_offer");
      await deliverPush(recipient.userId, offer, "new_offer", { title: "🎮 Nouvelle offre gratuite", body: offer.title });
    }
  }
}

// Les offres suivies via "Me prévenir" (notification_subscriptions, V7) qui
// viennent de passer de "bientôt disponible" à "active" : indépendant du
// contenu de ce sync précis, on relit tous les abonnements en attente.
async function dispatchStartedOfferNotifications(recipients: RecipientPreferences[]): Promise<void> {
  if (!supabaseAdmin) return;
  const emailByUser = new Map(recipients.map((r) => [r.userId, r.email]));

  const { data } = await supabaseAdmin.from("notification_subscriptions").select("id, user_id, offer_id, offers(*)").is("notified_at", null);
  if (!data) return;
  const now = Date.now();

  for (const row of data) {
    const offerRow = row.offers as unknown as OfferRow | null;
    if (!offerRow) continue;
    const offer = mapRowToOffer(offerRow);
    if (getOfferStatus(offer, now) !== "active") continue;

    const email = emailByUser.get(row.user_id);
    if (email) {
      await deliverEmail({ userId: row.user_id, email }, offer, "offer_started");
      await deliverPush(row.user_id, offer, "offer_started", { title: "⏳ Offre disponible !", body: offer.title });
    }
    await supabaseAdmin.from("notification_subscriptions").update({ notified_at: new Date().toISOString() }).eq("id", row.id);
  }
}

async function getExpiringAudience(offerId: string, recipients: RecipientPreferences[]): Promise<RecipientPreferences[]> {
  if (!supabaseAdmin) return [];
  const [{ data: favorites }, { data: subscriptions }] = await Promise.all([
    supabaseAdmin.from("favorites").select("user_id").eq("offer_id", offerId),
    supabaseAdmin.from("notification_subscriptions").select("user_id").eq("offer_id", offerId),
  ]);
  const interestedUserIds = new Set([...(favorites ?? []).map((row) => row.user_id), ...(subscriptions ?? []).map((row) => row.user_id)]);
  return recipients.filter((r) => interestedUserIds.has(r.userId) && r.expiringSoon);
}

async function dispatchExpiringSoonNotifications(recipients: RecipientPreferences[]): Promise<void> {
  if (!supabaseAdmin) return;
  const { data } = await supabaseAdmin.from("offers").select("*");
  if (!data) return;
  const now = Date.now();

  for (const row of data as OfferRow[]) {
    const offer = mapRowToOffer(row);
    if (getOfferStatus(offer, now) !== "active") continue;
    const remaining = new Date(offer.expiresAt).getTime() - now;

    const window = matchExpiringSoonWindow(remaining);
    if (!window) continue;

    const audience = await getExpiringAudience(offer.id, recipients);
    for (const recipient of audience) {
      await deliverEmail(recipient, offer, window.type);
      await deliverPush(recipient.userId, offer, window.type, { title: window.title, body: offer.title });
    }
  }
}

// Point d'entrée unique. `newOffers` = offres créées lors du sync qui vient
// de tourner (liste vide si appelé depuis /api/notifications/check-expiring,
// qui ne gère que les offres démarrées / bientôt expirées).
export async function runNotificationDispatch(newOffers: Offer[]): Promise<void> {
  if (!supabaseAdmin) return;
  try {
    const recipients = await getAllRecipientPreferences();
    if (recipients.length === 0) return;
    await dispatchNewOfferNotifications(newOffers, recipients);
    await dispatchStartedOfferNotifications(recipients);
    await dispatchExpiringSoonNotifications(recipients);
  } catch (error) {
    console.error("[notification-dispatch] échec non bloquant :", error instanceof Error ? error.message : error);
  }
}
