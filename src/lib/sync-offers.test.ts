import { beforeEach, describe, expect, it, vi } from "vitest";
import { buildOffer } from "@/lib/offer-builder";
import { syncAllOffers } from "@/lib/sync-offers";
import type { Offer } from "@/types/offer";

// Toutes les dépendances externes (Supabase via offers-repository, les
// journaux, l'historique des prix, et la liste des providers) sont
// simulées : ces tests vérifient uniquement la logique de
// src/lib/sync-offers.ts (dédoublonnage, détection de changement,
// expiration, isolation des erreurs), jamais une vraie base de données.
const { fetchOffersA, fetchOffersB, createOfferMock, updateOfferMock, getAllOffersMock, insertSyncLogMock, recordPriceChangeMock } = vi.hoisted(() => ({
  fetchOffersA: vi.fn(),
  fetchOffersB: vi.fn(),
  createOfferMock: vi.fn(),
  updateOfferMock: vi.fn(),
  getAllOffersMock: vi.fn(),
  insertSyncLogMock: vi.fn(),
  recordPriceChangeMock: vi.fn(),
}));

vi.mock("@/lib/providers", () => ({
  SYNC_ID_PREFIX: "sync-",
  providers: [
    { key: "provider-a", label: "Provider A", store: "Epic Games", mode: "simulated" as const, fetchOffers: fetchOffersA },
    { key: "provider-b", label: "Provider B", store: "Steam", mode: "simulated" as const, fetchOffers: fetchOffersB },
  ],
}));

vi.mock("@/lib/offers-repository", () => ({
  createOffer: createOfferMock,
  updateOffer: updateOfferMock,
  getAllOffers: getAllOffersMock,
}));

vi.mock("@/lib/price-history-repository", () => ({ recordPriceChange: recordPriceChangeMock }));
vi.mock("@/lib/sync-logs-repository", () => ({ insertSyncLog: insertSyncLogMock }));

function makeOffer(overrides: Partial<Parameters<typeof buildOffer>[0]> = {}): Offer {
  return buildOffer({
    id: "sync-provider-a-game",
    title: "Test Game",
    description: "Une description de test.",
    platform: "PC",
    store: "Epic Games",
    category: "JEUX",
    image: "/images/echoes-of-nova.svg",
    originalPrice: 19.99,
    expiresAt: "2027-01-01T18:00:00.000Z",
    url: "https://example.com/test-game",
    ...overrides,
  });
}

beforeEach(() => {
  fetchOffersA.mockReset().mockResolvedValue([]);
  fetchOffersB.mockReset().mockResolvedValue([]);
  createOfferMock.mockReset().mockResolvedValue({});
  updateOfferMock.mockReset().mockResolvedValue({});
  getAllOffersMock.mockReset().mockResolvedValue([]);
  insertSyncLogMock.mockReset().mockResolvedValue(undefined);
  recordPriceChangeMock.mockReset().mockResolvedValue(undefined);
});

describe("syncAllOffers", () => {
  it("provider vide : ne crée rien et ne plante pas", async () => {
    const summary = await syncAllOffers();
    expect(summary.offersFound).toBe(0);
    expect(summary.offersCreated).toBe(0);
    expect(createOfferMock).not.toHaveBeenCalled();
  });

  it("nouvelle offre : la crée, puis ne la recrée pas en double au prochain passage", async () => {
    const offer = makeOffer();
    fetchOffersA.mockResolvedValue([offer]);

    getAllOffersMock.mockResolvedValueOnce([]);
    const first = await syncAllOffers();
    expect(createOfferMock).toHaveBeenCalledTimes(1);
    expect(first.offersCreated).toBe(1);

    // Deuxième passage : l'offre "existe" déjà côté base, sans changement.
    getAllOffersMock.mockResolvedValueOnce([offer]);
    const second = await syncAllOffers();
    expect(createOfferMock).toHaveBeenCalledTimes(1); // toujours 1, pas de doublon
    expect(updateOfferMock).not.toHaveBeenCalled();
    expect(second.offersCreated).toBe(0);
    expect(second.offersUpdated).toBe(0);
  });

  it("offre modifiée : met à jour et enregistre le nouveau prix dans l'historique", async () => {
    const existing = makeOffer({ originalPrice: 19.99 });
    const incoming = makeOffer({ originalPrice: 9.99 });
    fetchOffersA.mockResolvedValue([incoming]);
    getAllOffersMock.mockResolvedValue([existing]);

    const summary = await syncAllOffers();

    expect(updateOfferMock).toHaveBeenCalledTimes(1);
    expect(summary.offersUpdated).toBe(1);
    expect(recordPriceChangeMock).toHaveBeenCalledWith(incoming.id, 9.99, incoming.currentPrice);
  });

  it("offre disparue du flux : la marque expirée sans la supprimer", async () => {
    const existing = makeOffer({ expiresAt: "2099-01-01T18:00:00.000Z" });
    fetchOffersA.mockResolvedValue([]); // l'offre n'apparaît plus
    getAllOffersMock.mockResolvedValue([existing]);

    const summary = await syncAllOffers();

    expect(updateOfferMock).toHaveBeenCalledTimes(1);
    expect(summary.offersExpired).toBe(1);
  });

  it("offre non gérée par un provider (id sans préfixe sync-) : jamais touchée", async () => {
    const manualOffer = makeOffer({ id: "echoes-of-nova", expiresAt: "2099-01-01T18:00:00.000Z" });
    fetchOffersA.mockResolvedValue([]);
    getAllOffersMock.mockResolvedValue([manualOffer]);

    await syncAllOffers();

    expect(updateOfferMock).not.toHaveBeenCalled();
    expect(createOfferMock).not.toHaveBeenCalled();
  });

  it("provider en erreur : les autres providers continuent normalement", async () => {
    const okOffer = makeOffer({ id: "sync-provider-b-game", store: "Steam" });
    fetchOffersA.mockRejectedValue(new Error("API indisponible"));
    fetchOffersB.mockResolvedValue([okOffer]);
    getAllOffersMock.mockResolvedValue([]);

    const summary = await syncAllOffers();

    const resultA = summary.providers.find((p) => p.provider === "provider-a");
    const resultB = summary.providers.find((p) => p.provider === "provider-b");
    expect(resultA?.status).toBe("error");
    expect(resultA?.message).toContain("API indisponible");
    expect(resultB?.status).toBe("success");
    expect(resultB?.offersCreated).toBe(1);
    expect(createOfferMock).toHaveBeenCalledTimes(1);
  });
});
