import { Suspense } from "react";
import Script from "next/script";
import { GA_MEASUREMENT_ID, PLAUSIBLE_DOMAIN } from "@/lib/analytics/config";
import { RouteChangeTracker } from "./route-change-tracker";

// N'injecte strictement aucun script tant que ni NEXT_PUBLIC_GA_MEASUREMENT_ID
// ni NEXT_PUBLIC_PLAUSIBLE_DOMAIN ne sont configurées — voir .env.local.example.
export function AnalyticsScripts() {
  if (!GA_MEASUREMENT_ID && !PLAUSIBLE_DOMAIN) return null;

  return <>
    {GA_MEASUREMENT_ID && <>
      <Script src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`} strategy="afterInteractive" />
      <Script id="ga4-init" strategy="afterInteractive">
        {`window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', '${GA_MEASUREMENT_ID}', { send_page_view: false });
window.gtag = gtag;`}
      </Script>
    </>}
    {PLAUSIBLE_DOMAIN && <Script src="https://plausible.io/js/script.js" data-domain={PLAUSIBLE_DOMAIN} strategy="afterInteractive" />}
    <Suspense fallback={null}><RouteChangeTracker /></Suspense>
  </>;
}
