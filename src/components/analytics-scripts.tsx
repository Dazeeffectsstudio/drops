import { Suspense } from "react";
import Script from "next/script";
import { GA_MEASUREMENT_ID, PLAUSIBLE_DOMAIN } from "@/lib/analytics/config";
import { AuthEventTracker } from "./auth-event-tracker";
import { RouteChangeTracker } from "./route-change-tracker";

// N'injecte les scripts gtag/Plausible que si NEXT_PUBLIC_GA_MEASUREMENT_ID
// ou NEXT_PUBLIC_PLAUSIBLE_DOMAIN sont configurées — voir .env.local.example.
// Les trackers restent montés dans tous les cas : RouteChangeTracker et
// AuthEventTracker appellent trackEvent(), qui ne fait déjà rien sans
// fournisseur configuré (voir src/lib/analytics/track.ts) — mais
// AuthEventTracker doit tourner même sans analytics pour nettoyer le
// paramètre "_evt" de l'URL après une connexion/inscription.
export function AnalyticsScripts() {
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
    <Suspense fallback={null}><RouteChangeTracker /><AuthEventTracker /></Suspense>
  </>;
}
