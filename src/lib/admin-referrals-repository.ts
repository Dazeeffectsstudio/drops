import { supabaseAdmin } from "@/lib/supabase/admin-client";

export type AdminReferralStats = {
  totalInvitations: number;
  totalConfirmed: number;
  confirmationRate: number;
  rewardsDistributed: number;
  topAmbassadors: Array<{ userId: string; email: string | null; signedUp: number; confirmed: number }>;
};

const empty: AdminReferralStats = { totalInvitations: 0, totalConfirmed: 0, confirmationRate: 0, rewardsDistributed: 0, topAmbassadors: [] };

// `days === null` = depuis toujours. Réservé à /admin/referrals — nécessite
// le client service_role car il agrège les parrainages de TOUT LE MONDE
// (les policies RLS de `referrals` limitent chacun à ses propres lignes).
export async function getAdminReferralStats(days: number | null): Promise<AdminReferralStats> {
  if (!supabaseAdmin) return empty;

  const since = days !== null ? new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString() : null;
  let query = supabaseAdmin.from("referrals").select("referrer_id, signed_up_at, confirmed_at, created_at");
  if (since) query = query.gte("created_at", since);
  const { data: referrals } = await query;

  let rewardsQuery = supabaseAdmin.from("referral_rewards").select("id", { count: "exact", head: true });
  if (since) rewardsQuery = rewardsQuery.gte("unlocked_at", since);
  const { count: rewardsDistributed } = await rewardsQuery;

  const rows = referrals ?? [];
  const signedUpRows = rows.filter((row) => row.signed_up_at !== null);
  const confirmedRows = rows.filter((row) => row.confirmed_at !== null);

  const byReferrer = new Map<string, { signedUp: number; confirmed: number }>();
  for (const row of signedUpRows) {
    const entry = byReferrer.get(row.referrer_id) ?? { signedUp: 0, confirmed: 0 };
    entry.signedUp += 1;
    byReferrer.set(row.referrer_id, entry);
  }
  for (const row of confirmedRows) {
    const entry = byReferrer.get(row.referrer_id) ?? { signedUp: 0, confirmed: 0 };
    entry.confirmed += 1;
    byReferrer.set(row.referrer_id, entry);
  }

  const topEntries = Array.from(byReferrer.entries()).sort((a, b) => b[1].signedUp - a[1].signedUp).slice(0, 10);
  let emailById = new Map<string, string | null>();
  if (topEntries.length > 0) {
    const { data: usersData } = await supabaseAdmin.auth.admin.listUsers({ perPage: 1000 });
    emailById = new Map((usersData?.users ?? []).map((u) => [u.id, u.email ?? null]));
  }

  return {
    totalInvitations: signedUpRows.length,
    totalConfirmed: confirmedRows.length,
    confirmationRate: signedUpRows.length > 0 ? Math.round((confirmedRows.length / signedUpRows.length) * 100) : 0,
    rewardsDistributed: rewardsDistributed ?? 0,
    topAmbassadors: topEntries.map(([userId, counts]) => ({ userId, email: emailById.get(userId) ?? null, signedUp: counts.signedUp, confirmed: counts.confirmed })),
  };
}
