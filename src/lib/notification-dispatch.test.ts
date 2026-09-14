import { beforeEach, describe, expect, it, vi } from "vitest";
import { buildOffer } from "@/lib/offer-builder";
import { dispatchNewOfferNotifications, matchExpiringSoonWindow } from "@/lib/notification-dispatch";
import type { RecipientPreferences } from "@/lib/notification-preferences-repository";
import type { Offer } from "@/types/offer";

// Ces tests couvrent la logique pure de src/lib/notification-dispatch.ts
// (dédoublonnage, respect des préférences, nettoyage des abonnements push
// expirés) sans jamais toucher une vraie base de données ni un vrai
// fournisseur d'email/push.
const { sendNewOfferEmailMock, hasNotificationBeenSentMock, insertNotificationLogMock, getPushSubscriptionsForUserMock, deletePushSubscriptionByIdMock, sendPushNotificationMock } = vi.hoisted(() => ({
  sendNewOfferEmailMock: vi.fn(),
  hasNotificationBeenSentMock: vi.fn(),
  insertNotificationLogMock: vi.fn(),
  getPushSubscriptionsForUserMock: vi.fn(),
  deletePushSubscriptionByIdMock: vi.fn(),
  sendPushNotificationMock: vi.fn(),
}));

vi.mock("@/lib/email/send", () => ({
  sendNewOfferEmail: sendNewOfferEmailMock,
  sendOfferStartedEmail: vi.fn(),
  sendOfferEndingSoonEmail: vi.fn(),
}));
vi.mock("@/lib/notification-logs-repository", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/notification-logs-repository")>();
  return { ...actual, hasNotificationBeenSent: hasNotificationBeenSentMock, insertNotificationLog: insertNotificationLogMock };
});
vi.mock("@/lib/push-subscriptions-repository", () => ({
  getPushSubscriptionsForUser: getPushSubscriptionsForUserMock,
  deletePushSubscriptionById: deletePushSubscriptionByIdMock,
}));
vi.mock("@/lib/push/client", () => ({ sendPushNotification: sendPushNotificationMock }));
vi.mock("@/lib/supabase/admin-client", () => ({ supabaseAdmin: null }));

function makeOffer(overrides: Partial<Parameters<typeof buildOffer>[0]> = {}): Offer {
  return buildOffer({
    id: "sync-epic-games-game",
    title: "Test Game",
    description: "Une description de test.",
    platform: "PC",
    store: "Epic Games",
    category: "JEUX",
    image: "/images/placeholder.svg",
    originalPrice: 19.99,
    expiresAt: "2027-01-01T18:00:00.000Z",
    url: "https://example.com/test-game",
    ...overrides,
  });
}

function makeRecipient(overrides: Partial<RecipientPreferences> = {}): RecipientPreferences {
  return {
    userId: "user-1",
    email: "user1@example.com",
    newOffers: true,
    epicGames: true,
    steam: true,
    expiringSoon: true,
    twitchDrops: true,
    primeGaming: true,
    ...overrides,
  };
}

beforeEach(() => {
  sendNewOfferEmailMock.mockReset().mockResolvedValue({ sent: true });
  hasNotificationBeenSentMock.mockReset().mockResolvedValue(false);
  insertNotificationLogMock.mockReset().mockResolvedValue(undefined);
  getPushSubscriptionsForUserMock.mockReset().mockResolvedValue([]);
  deletePushSubscriptionByIdMock.mockReset().mockResolvedValue(undefined);
  sendPushNotificationMock.mockReset().mockResolvedValue({ sent: true });
});

describe("dispatchNewOfferNotifications", () => {
  it("envoie un email à chaque destinataire éligible", async () => {
    const offer = makeOffer();
    await dispatchNewOfferNotifications([offer], [makeRecipient()]);
    expect(sendNewOfferEmailMock).toHaveBeenCalledTimes(1);
    expect(sendNewOfferEmailMock).toHaveBeenCalledWith("user1@example.com", offer);
  });

  it("dédoublonnage : ne renvoie jamais deux fois la même notification", async () => {
    hasNotificationBeenSentMock.mockResolvedValue(true);
    await dispatchNewOfferNotifications([makeOffer()], [makeRecipient()]);
    expect(sendNewOfferEmailMock).not.toHaveBeenCalled();
  });

  it("préférences : n'envoie pas à un utilisateur qui a désactivé Epic Games", async () => {
    const offer = makeOffer({ store: "Epic Games" });
    await dispatchNewOfferNotifications([offer], [makeRecipient({ epicGames: false })]);
    expect(sendNewOfferEmailMock).not.toHaveBeenCalled();
  });

  it("préférences : n'envoie pas si notify_new_offers est désactivé, même avec la plateforme activée", async () => {
    const offer = makeOffer({ store: "Steam" });
    await dispatchNewOfferNotifications([offer], [makeRecipient({ newOffers: false, steam: true })]);
    expect(sendNewOfferEmailMock).not.toHaveBeenCalled();
  });

  it("plateforme sans switch dédié (PlayStation) : reçoit quand même la notification", async () => {
    const offer = makeOffer({ store: "PlayStation", platform: "PLAYSTATION" });
    await dispatchNewOfferNotifications([offer], [makeRecipient()]);
    expect(sendNewOfferEmailMock).toHaveBeenCalledTimes(1);
  });

  it("abonnement push expiré : est supprimé après un envoi en échec (410 Gone)", async () => {
    getPushSubscriptionsForUserMock.mockResolvedValue([{ id: "push-1", endpoint: "https://push.example/1", p256dh: "key", auth: "auth" }]);
    sendPushNotificationMock.mockResolvedValue({ sent: false, expired: true, error: "Gone" });

    await dispatchNewOfferNotifications([makeOffer()], [makeRecipient()]);

    expect(deletePushSubscriptionByIdMock).toHaveBeenCalledWith("push-1");
    expect(insertNotificationLogMock).toHaveBeenCalledWith(expect.objectContaining({ provider: "push", status: "error" }));
  });

  it("abonnement push valide : n'est jamais supprimé après un envoi réussi", async () => {
    getPushSubscriptionsForUserMock.mockResolvedValue([{ id: "push-2", endpoint: "https://push.example/2", p256dh: "key", auth: "auth" }]);
    sendPushNotificationMock.mockResolvedValue({ sent: true });

    await dispatchNewOfferNotifications([makeOffer()], [makeRecipient()]);

    expect(deletePushSubscriptionByIdMock).not.toHaveBeenCalled();
  });
});

describe("matchExpiringSoonWindow", () => {
  const HOUR = 60 * 60 * 1000;

  it("classe une offre à 10h de la fin dans la fenêtre 24h", () => {
    expect(matchExpiringSoonWindow(10 * HOUR)?.type).toBe("offer_ending_soon_24h");
  });

  it("classe une offre à 1h de la fin dans la fenêtre 2h", () => {
    expect(matchExpiringSoonWindow(1 * HOUR)?.type).toBe("offer_ending_soon_2h");
  });

  it("ignore une offre déjà expirée", () => {
    expect(matchExpiringSoonWindow(-1)).toBeNull();
  });

  it("ignore une offre encore loin de l'expiration (plus de 24h)", () => {
    expect(matchExpiringSoonWindow(48 * HOUR)).toBeNull();
  });
});
