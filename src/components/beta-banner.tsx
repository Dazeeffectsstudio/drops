import { getBetaBanner } from "@/lib/beta-banner-repository";
import { BetaBannerDismiss } from "./beta-banner-dismiss";

// Server Component simple (pas de cookies()/session lue ici) — un `fetch`
// Supabase classique ne force pas le rendu dynamique du layout racine,
// contrairement à cookies() (voir la note dans mobile-nav.tsx).
export async function BetaBanner() {
  const banner = await getBetaBanner();
  if (!banner || !banner.enabled || !banner.message) return null;

  return <BetaBannerDismiss message={banner.message}>
    <span>{banner.message}</span>
    {banner.linkUrl && <a href={banner.linkUrl} target="_blank" rel="noreferrer">{banner.linkLabel || "En savoir plus"}</a>}
  </BetaBannerDismiss>;
}
