import { cookies } from "next/headers";
import { insertNotificationLog } from "@/lib/notification-logs-repository";
import { checkAndAwardReferralRewards } from "@/lib/referral-rewards";
import { supabaseAdmin } from "@/lib/supabase/admin-client";
import { createSupabaseServerClient } from "@/lib/supabase/server-client";

const REF_COOKIE = "drops_ref";

// Appelée juste après une inscription réussie (voir signUpAction dans
// src/app/auth-actions.ts) — lit le cookie posé par ReferralCapture et
// enregistre le parrainage si présent, valide, et différent du nouvel
// utilisateur (pas d'auto-parrainage). Le simple clic sur un lien
// d'invitation (avant inscription) n'est volontairement pas stocké en base
// — un insert public non authentifié serait une porte ouverte au spam ;
// ReferralCapture envoie un événement analytics à la place (voir ce fichier).
export async function attributeReferral(newUserId: string): Promise<void> {
  if (!supabaseAdmin) return;
  const cookieStore = await cookies();
  const referrerId = cookieStore.get(REF_COOKIE)?.value;
  if (!referrerId || referrerId === newUserId) return;

  await supabaseAdmin
    .from("referrals")
    .upsert({ referrer_id: referrerId, referred_id: newUserId, signed_up_at: new Date().toISOString() }, { onConflict: "referred_id" });

  await insertNotificationLog({ userId: referrerId, offerId: null, type: "referral_signup", provider: "in_app", status: "sent" });
  await checkAndAwardReferralRewards(referrerId);
}

// Appelée depuis /account (voir src/app/account/page.tsx) : dès qu'un
// compte parrainé a une session active, on sait que son email est confirmé
// (Supabase n'émet pas de session tant que l'email n'est pas validé, voir
// [[project-drops-overview]] section V7) — on marque donc confirmed_at et on
// prévient le parrain une seule fois (idempotent : ne fait rien si déjà
// marqué, ou si cet utilisateur n'a pas été parrainé).
export async function markReferralConfirmedIfNeeded(referredUserId: string): Promise<void> {
  if (!supabaseAdmin) return;
  const { data: referral } = await supabaseAdmin
    .from("referrals")
    .select("id, referrer_id")
    .eq("referred_id", referredUserId)
    .is("confirmed_at", null)
    .maybeSingle();
  if (!referral) return;

  await supabaseAdmin.from("referrals").update({ confirmed_at: new Date().toISOString() }).eq("id", referral.id);
  await insertNotificationLog({ userId: referral.referrer_id, offerId: null, type: "referral_confirmed", provider: "in_app", status: "sent" });
}

export type ReferralStats = { code: string | null; totalSignedUp: number; totalConfirmed: number };

export async function getMyReferralStats(): Promise<ReferralStats> {
  const empty: ReferralStats = { code: null, totalSignedUp: 0, totalConfirmed: 0 };
  const supabase = await createSupabaseServerClient();
  if (!supabase) return empty;
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return empty;

  const { data } = await supabase.from("referrals").select("signed_up_at, confirmed_at").eq("referrer_id", user.id);
  const rows = data ?? [];
  return {
    code: user.id,
    totalSignedUp: rows.filter((row) => row.signed_up_at !== null).length,
    totalConfirmed: rows.filter((row) => row.confirmed_at !== null).length,
  };
}
