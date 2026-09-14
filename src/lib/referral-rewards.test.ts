import { beforeEach, describe, expect, it, vi } from "vitest";

// Vérifie la logique d'attribution des récompenses de parrainage
// (src/lib/referral-rewards.ts) : chaque seuil d'amis inscrits débloque la
// bonne récompense, jamais deux fois la même, sans jamais toucher une
// vraie base — même pattern que src/lib/badges.test.ts.
const { fromMock } = vi.hoisted(() => ({ fromMock: vi.fn() }));

vi.mock("@/lib/supabase/admin-client", () => ({ supabaseAdmin: { from: fromMock } }));
vi.mock("@/lib/supabase/server-client", () => ({ createSupabaseServerClient: vi.fn().mockResolvedValue(null) }));

type TableName = "referrals" | "referral_rewards" | "notification_logs";

function mockTables(config: { signedUp?: number; existingRewards?: string[] }) {
  const insertMock = vi.fn().mockResolvedValue({ data: null, error: null });
  fromMock.mockImplementation((table: TableName) => {
    if (table === "referrals") {
      return { select: vi.fn(() => ({ eq: vi.fn(() => ({ not: vi.fn().mockResolvedValue({ count: config.signedUp ?? 0, data: null, error: null }) })) })) };
    }
    if (table === "referral_rewards") {
      return {
        select: vi.fn(() => ({ eq: vi.fn().mockResolvedValue({ data: (config.existingRewards ?? []).map((key) => ({ reward_key: key })), error: null }) })),
        insert: insertMock,
      };
    }
    if (table === "notification_logs") {
      return { insert: insertMock };
    }
    throw new Error(`unexpected table ${table}`);
  });
  return insertMock;
}

beforeEach(() => {
  fromMock.mockReset();
});

describe("checkAndAwardReferralRewards", () => {
  it("attribue 'first_friend' au premier ami inscrit", async () => {
    mockTables({ signedUp: 1, existingRewards: [] });
    const { checkAndAwardReferralRewards } = await import("@/lib/referral-rewards");

    const awarded = await checkAndAwardReferralRewards("user-1");

    expect(awarded).toEqual(["first_friend"]);
  });

  it("n'attribue jamais deux fois la même récompense", async () => {
    mockTables({ signedUp: 3, existingRewards: ["first_friend"] });
    const { checkAndAwardReferralRewards } = await import("@/lib/referral-rewards");

    const awarded = await checkAndAwardReferralRewards("user-1");

    expect(awarded).toEqual([]);
  });

  it("attribue 'five_friends' à partir de 5 amis inscrits", async () => {
    mockTables({ signedUp: 5, existingRewards: ["first_friend"] });
    const { checkAndAwardReferralRewards } = await import("@/lib/referral-rewards");

    const awarded = await checkAndAwardReferralRewards("user-1");

    expect(awarded).toContain("five_friends");
  });

  it("attribue plusieurs paliers franchis d'un coup", async () => {
    mockTables({ signedUp: 25, existingRewards: [] });
    const { checkAndAwardReferralRewards } = await import("@/lib/referral-rewards");

    const awarded = await checkAndAwardReferralRewards("user-1");

    expect(awarded.sort()).toEqual(["first_friend", "five_friends", "ten_friends", "twenty_five_friends"].sort());
  });

  it("n'attribue rien avant le premier seuil", async () => {
    mockTables({ signedUp: 0, existingRewards: [] });
    const { checkAndAwardReferralRewards } = await import("@/lib/referral-rewards");

    const awarded = await checkAndAwardReferralRewards("user-1");

    expect(awarded).toEqual([]);
  });
});
