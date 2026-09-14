import { supabaseAdmin } from "@/lib/supabase/admin-client";

export type GrowthStats = { newSignups7d: number; activeUsers7d: number; signupsByDay: number[] };

const DAY_MS = 24 * 60 * 60 * 1000;

export async function getGrowthStats(): Promise<GrowthStats> {
  const empty: GrowthStats = { newSignups7d: 0, activeUsers7d: 0, signupsByDay: [0, 0, 0, 0, 0, 0, 0] };
  if (!supabaseAdmin) return empty;

  const { data } = await supabaseAdmin.auth.admin.listUsers({ perPage: 1000 });
  const users = data?.users ?? [];
  const now = Date.now();

  const newSignups7d = users.filter((u) => now - new Date(u.created_at).getTime() < 7 * DAY_MS).length;
  const activeUsers7d = users.filter((u) => u.last_sign_in_at && now - new Date(u.last_sign_in_at).getTime() < 7 * DAY_MS).length;

  const signupsByDay = Array.from({ length: 7 }, (_, i) => {
    const dayStart = now - (6 - i) * DAY_MS;
    const dayEnd = dayStart + DAY_MS;
    return users.filter((u) => {
      const t = new Date(u.created_at).getTime();
      return t >= dayStart && t < dayEnd;
    }).length;
  });

  return { newSignups7d, activeUsers7d, signupsByDay };
}
