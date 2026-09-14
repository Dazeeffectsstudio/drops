import { checkAndAwardBadges } from "@/lib/badges";
import { createSupabaseServerClient } from "@/lib/supabase/server-client";
import { supabaseAdmin } from "@/lib/supabase/admin-client";

export type StreakInfo = { currentStreak: number; longestStreak: number };

function todayISODate(): string {
  return new Date().toISOString().slice(0, 10);
}

function isYesterday(dateStr: string): boolean {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return dateStr === yesterday.toISOString().slice(0, 10);
}

// Enregistre la visite du jour pour l'utilisateur connecté — no-op si non
// connecté ou déjà enregistré aujourd'hui (appelé au plus une fois par jour
// et par appareil, voir src/components/streak-tracker.tsx). Passe par le
// client service_role : la lecture doit voir l'état exact indépendamment
// des policies RLS pour calculer correctement la suite de jours.
export async function recordDailyVisit(): Promise<{ currentStreak: number; increased: boolean } | null> {
  const supabase = await createSupabaseServerClient();
  if (!supabase || !supabaseAdmin) return null;
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const today = todayISODate();
  const { data: existing } = await supabaseAdmin.from("user_streaks").select("*").eq("user_id", user.id).maybeSingle();

  if (existing?.last_visit_date === today) return { currentStreak: existing.current_streak, increased: false };

  const nextStreak = existing?.last_visit_date && isYesterday(existing.last_visit_date) ? existing.current_streak + 1 : 1;
  const longest = Math.max(nextStreak, existing?.longest_streak ?? 0);

  await supabaseAdmin.from("user_streaks").upsert({ user_id: user.id, current_streak: nextStreak, longest_streak: longest, last_visit_date: today, updated_at: new Date().toISOString() });
  await checkAndAwardBadges(user.id);

  return { currentStreak: nextStreak, increased: true };
}

export async function getMyStreak(): Promise<StreakInfo> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return { currentStreak: 0, longestStreak: 0 };
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { currentStreak: 0, longestStreak: 0 };
  const { data } = await supabase.from("user_streaks").select("current_streak, longest_streak").eq("user_id", user.id).maybeSingle();
  return { currentStreak: data?.current_streak ?? 0, longestStreak: data?.longest_streak ?? 0 };
}
