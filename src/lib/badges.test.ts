import { beforeEach, describe, expect, it, vi } from "vitest";

// Vérifie la logique d'attribution des badges (src/lib/badges.ts) : chaque
// seuil déclenche le bon badge, jamais deux fois le même (dédoublonnage via
// la liste des badges déjà obtenus), sans jamais toucher une vraie base.
const { fromMock } = vi.hoisted(() => ({ fromMock: vi.fn() }));

vi.mock("@/lib/supabase/admin-client", () => ({ supabaseAdmin: { from: fromMock } }));
vi.mock("@/lib/supabase/server-client", () => ({ createSupabaseServerClient: vi.fn().mockResolvedValue(null) }));

type TableName = "favorites" | "notification_subscriptions" | "user_streaks" | "user_badges";

function mockTables(config: {
  totalFavorites?: number;
  epicFavorites?: number;
  notifCount?: number;
  longestStreak?: number;
  existingBadges?: string[];
}) {
  const insertMock = vi.fn().mockResolvedValue({ data: null, error: null });
  fromMock.mockImplementation((table: TableName) => {
    if (table === "favorites") {
      return {
        select: vi.fn((_columns: string, opts?: { count?: string; head?: boolean }) => ({
          eq: vi.fn().mockResolvedValue(
            opts?.head
              ? { count: config.totalFavorites ?? 0, data: null, error: null }
              : {
                  data: [
                    ...Array.from({ length: config.epicFavorites ?? 0 }, () => ({ offer_id: "x", offers: { store: "Epic Games" } })),
                    ...Array.from({ length: (config.totalFavorites ?? 0) - (config.epicFavorites ?? 0) }, () => ({ offer_id: "y", offers: { store: "Steam" } })),
                  ],
                  error: null,
                },
          ),
        })),
      };
    }
    if (table === "notification_subscriptions") {
      return { select: vi.fn(() => ({ eq: vi.fn().mockResolvedValue({ count: config.notifCount ?? 0, data: null, error: null }) })) };
    }
    if (table === "user_streaks") {
      return { select: vi.fn(() => ({ eq: vi.fn(() => ({ maybeSingle: vi.fn().mockResolvedValue({ data: { longest_streak: config.longestStreak ?? 0 }, error: null }) })) })) };
    }
    if (table === "user_badges") {
      return {
        select: vi.fn(() => ({ eq: vi.fn().mockResolvedValue({ data: (config.existingBadges ?? []).map((key) => ({ badge_key: key })), error: null }) })),
        insert: insertMock,
      };
    }
    throw new Error(`unexpected table ${table}`);
  });
  return insertMock;
}

beforeEach(() => {
  fromMock.mockReset();
});

describe("checkAndAwardBadges", () => {
  it("attribue 'first_favorite' au premier favori", async () => {
    const insertMock = mockTables({ totalFavorites: 1, epicFavorites: 0, notifCount: 0, longestStreak: 0, existingBadges: [] });
    const { checkAndAwardBadges } = await import("@/lib/badges");

    const awarded = await checkAndAwardBadges("user-1");

    expect(awarded).toEqual(["first_favorite"]);
    expect(insertMock).toHaveBeenCalledWith([{ user_id: "user-1", badge_key: "first_favorite" }]);
  });

  it("n'attribue jamais deux fois le même badge", async () => {
    const insertMock = mockTables({ totalFavorites: 3, epicFavorites: 0, notifCount: 0, longestStreak: 0, existingBadges: ["first_favorite"] });
    const { checkAndAwardBadges } = await import("@/lib/badges");

    const awarded = await checkAndAwardBadges("user-1");

    expect(awarded).toEqual([]);
    expect(insertMock).not.toHaveBeenCalled();
  });

  it("attribue 'epic_hunter' à partir de 10 favoris Epic Games", async () => {
    mockTables({ totalFavorites: 10, epicFavorites: 10, notifCount: 0, longestStreak: 0, existingBadges: ["first_favorite"] });
    const { checkAndAwardBadges } = await import("@/lib/badges");

    const awarded = await checkAndAwardBadges("user-1");

    expect(awarded).toContain("epic_hunter");
  });

  it("attribue 'collector' à partir de 50 favoris", async () => {
    mockTables({ totalFavorites: 50, epicFavorites: 0, notifCount: 0, longestStreak: 0, existingBadges: ["first_favorite"] });
    const { checkAndAwardBadges } = await import("@/lib/badges");

    const awarded = await checkAndAwardBadges("user-1");

    expect(awarded).toContain("collector");
  });

  it("attribue 'loyal' à partir de 30 jours de streak", async () => {
    mockTables({ totalFavorites: 0, epicFavorites: 0, notifCount: 0, longestStreak: 30, existingBadges: [] });
    const { checkAndAwardBadges } = await import("@/lib/badges");

    const awarded = await checkAndAwardBadges("user-1");

    expect(awarded).toEqual(["loyal"]);
  });

  it("plusieurs seuils franchis en même temps attribuent plusieurs badges d'un coup", async () => {
    mockTables({ totalFavorites: 50, epicFavorites: 10, notifCount: 1, longestStreak: 30, existingBadges: [] });
    const { checkAndAwardBadges } = await import("@/lib/badges");

    const awarded = await checkAndAwardBadges("user-1");

    expect(awarded.sort()).toEqual(["collector", "epic_hunter", "first_favorite", "first_notification", "loyal"].sort());
  });
});
