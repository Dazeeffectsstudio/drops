"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { trackEvent } from "@/lib/analytics/track";

const REF_COOKIE = "drops_ref";
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// Capture "?ref=<id du parrain>" dans un cookie (30 jours) pour que
// signUpAction (src/app/auth-actions.ts) puisse l'attribuer au moment de
// l'inscription — voir src/lib/referrals-repository.ts. Ne fait rien si le
// paramètre est absent ou ne ressemble pas à un identifiant utilisateur.
export function ReferralCapture() {
  const searchParams = useSearchParams();
  const ref = searchParams.get("ref");

  useEffect(() => {
    if (!ref || !UUID_RE.test(ref)) return;
    if (document.cookie.includes(`${REF_COOKIE}=`)) return;
    document.cookie = `${REF_COOKIE}=${ref}; max-age=${30 * 24 * 60 * 60}; path=/; samesite=lax`;
    trackEvent("referral_click", { referrer: ref });
  }, [ref]);

  return null;
}
