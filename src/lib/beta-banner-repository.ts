import { supabaseAdmin } from "@/lib/supabase/admin-client";
import { supabasePublic } from "@/lib/supabase/public-client";

export type BetaBannerData = { enabled: boolean; message: string; linkUrl: string | null; linkLabel: string | null };

export async function getBetaBanner(): Promise<BetaBannerData | null> {
  if (!supabasePublic) return null;
  const { data } = await supabasePublic.from("beta_banner").select("*").eq("id", "singleton").maybeSingle();
  if (!data) return null;
  return { enabled: data.enabled, message: data.message, linkUrl: data.link_url, linkLabel: data.link_label };
}

export async function saveBetaBanner(input: BetaBannerData): Promise<{ error?: string }> {
  if (!supabaseAdmin) return { error: "Supabase n'est pas configuré côté serveur." };
  const { error } = await supabaseAdmin
    .from("beta_banner")
    .upsert({ id: "singleton", enabled: input.enabled, message: input.message, link_url: input.linkUrl, link_label: input.linkLabel, updated_at: new Date().toISOString() });
  return { error: error?.message };
}
