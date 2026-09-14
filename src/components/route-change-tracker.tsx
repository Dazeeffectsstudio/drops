"use client";

import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { trackPageView } from "@/lib/analytics/track";

// Next.js App Router ne recharge pas la page en navigant via <Link> — sans
// ça, GA4/Plausible ne verraient que le tout premier chargement de chaque
// session, jamais les navigations suivantes.
export function RouteChangeTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    const query = searchParams.toString();
    trackPageView(query ? `${pathname}?${query}` : pathname);
  }, [pathname, searchParams]);

  return null;
}
