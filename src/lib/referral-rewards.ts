import { supabaseAdmin } from "@/lib/supabase/admin-client";
import { createSupabaseServerClient } from "@/lib/supabase/server-client";
import { insertNotificationLog } from "@/lib/notification-logs-repository";

export type ReferralRewardKey = "first_friend" | "five_friends" | "ten_friends" | "twenty_five_friends";

export type ReferralRewardDefinition = { key: ReferralRewardKey; threshold: number; label: string; description: string; icon: string };

export const REFERRAL_REWARDS: ReferralRewardDefinition[] = [
  { key: "first_friend", threshold: 1, label: "Premier ami", description: "Un ami s'est inscrit grâce à ton lien.", icon: "🥉" },
  { key: "five_friends", threshold: 5, label: "5 amis", description: "5 amis se sont inscrits grâce à toi.", icon: "🥈" },
  { key: "ten_friends", threshold: 10, label: "10 amis", description: "10 amis se sont inscrits grâce à toi.", icon: "🥇" },
  { key: "twenty_five_friends", threshold: 25, label: "25 amis", description: "25 amis se sont inscrits grâce à toi — ambassadeur DROPS !", icon: "👑" },
];

// Appelée après chaque inscription attribuée à un parrain (voir
// attributeReferral dans referrals-repository.ts) — vérifie les seuils
// d'amis inscrits (referrals.signed_up_at non nul, peu importe si l'email a
// déjà été confirmé) et débloque les nouvelles récompenses méritées. Passe
// par supabaseAdmin car referral_rewards n'est lisible que par son
// propriétaire (RLS) — l'écriture doit contourner cette policy select-only.
export async function checkAndAwardReferralRewards(referrerId: string): Promise<ReferralRewardKey[]> {
  if (!supabaseAdmin) return [];

  const [{ count: totalReferred }, { data: existing }] = await Promise.all([
    supabaseAdmin.from("referrals").select("id", { count: "exact", head: true }).eq("referrer_id", referrerId).not("signed_up_at", "is", null),
    supabaseAdmin.from("referral_rewards").select("reward_key").eq("referrer_id", referrerId),
  ]);

  const already = new Set((existing ?? []).map((row) => row.reward_key));
  const count = totalReferred ?? 0;
  const toAward = REFERRAL_REWARDS.filter((reward) => count >= reward.threshold && !already.has(reward.key));
  if (toAward.length === 0) return [];

  await supabaseAdmin.from("referral_rewards").insert(toAward.map((reward) => ({ referrer_id: referrerId, reward_key: reward.key })));
  await Promise.all(toAward.map(() => insertNotificationLog({ userId: referrerId, offerId: null, type: "referral_reward", provider: "in_app", status: "sent" })));
  return toAward.map((reward) => reward.key);
}

export async function getMyReferralRewards(): Promise<ReferralRewardKey[]> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return [];
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];
  const { data } = await supabase.from("referral_rewards").select("reward_key").eq("referrer_id", user.id);
  return (data ?? []).map((row) => row.reward_key as ReferralRewardKey);
}
