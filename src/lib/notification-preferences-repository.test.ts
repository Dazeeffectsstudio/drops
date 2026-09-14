import { beforeEach, describe, expect, it, vi } from "vitest";

// Vérifie que getAllRecipientPreferences() exclut les comptes dont l'email
// n'est pas encore confirmé (voir la mission V8 : "utilisateur sans email
// vérifié"), et applique les valeurs par défaut pour un compte qui n'a
// jamais visité /account/notifications.
const { listUsersMock, selectMock, fromMock } = vi.hoisted(() => ({
  listUsersMock: vi.fn(),
  selectMock: vi.fn(),
  fromMock: vi.fn(),
}));

vi.mock("@/lib/supabase/admin-client", () => ({
  supabaseAdmin: {
    auth: { admin: { listUsers: listUsersMock } },
    from: fromMock,
  },
}));

vi.mock("@/lib/supabase/server-client", () => ({
  createSupabaseServerClient: vi.fn().mockResolvedValue(null),
}));

beforeEach(() => {
  listUsersMock.mockReset();
  selectMock.mockReset().mockResolvedValue({ data: [] });
  fromMock.mockReset().mockReturnValue({ select: selectMock });
});

describe("getAllRecipientPreferences", () => {
  it("exclut les comptes dont l'email n'est pas confirmé", async () => {
    listUsersMock.mockResolvedValue({
      data: {
        users: [
          { id: "confirmed-user", email: "verified@example.com", email_confirmed_at: "2026-01-01T00:00:00.000Z" },
          { id: "unconfirmed-user", email: "pending@example.com", email_confirmed_at: null },
        ],
      },
    });

    const { getAllRecipientPreferences } = await import("@/lib/notification-preferences-repository");
    const recipients = await getAllRecipientPreferences();

    expect(recipients).toHaveLength(1);
    expect(recipients[0].userId).toBe("confirmed-user");
  });

  it("applique les préférences par défaut (tout activé) pour un compte sans ligne notification_preferences", async () => {
    listUsersMock.mockResolvedValue({
      data: { users: [{ id: "new-user", email: "new@example.com", email_confirmed_at: "2026-01-01T00:00:00.000Z" }] },
    });

    const { getAllRecipientPreferences } = await import("@/lib/notification-preferences-repository");
    const recipients = await getAllRecipientPreferences();

    expect(recipients).toEqual([
      { userId: "new-user", email: "new@example.com", newOffers: true, epicGames: true, steam: true, expiringSoon: true, twitchDrops: true, primeGaming: true },
    ]);
  });
});
