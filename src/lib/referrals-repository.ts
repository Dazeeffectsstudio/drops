import { cookies } from "next/headers";
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
}

export type ReferralStats = { code: string | null; totalSignedUp: number };

export async function getMyReferralStats(): Promise<ReferralStats> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return { code: null, totalSignedUp: 0 };
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { code: null, totalSignedUp: 0 };

  const { data } = await supabase.from("referrals").select("id").eq("referrer_id", user.id);
  return { code: user.id, totalSignedUp: (data ?? []).length };
}
