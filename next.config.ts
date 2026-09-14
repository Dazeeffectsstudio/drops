import type { NextConfig } from "next";

// CSP volontairement permissive sur script-src ('unsafe-inline') : le site
// utilise des scripts inline pour les données structurées JSON-LD et
// l'initialisation de GA4 (src/components/analytics-scripts.tsx). Un CSP
// strict à base de nonce serait plus sûr mais demande une intégration au
// middleware — pas fait dans cette mission pour ne pas risquer de casser
// l'existant sans tests approfondis. Documenté dans DEPLOYMENT.md.
//
// 'unsafe-eval' est ajouté UNIQUEMENT en développement : le rechargement à
// chaud (Fast Refresh) de Next.js repose sur eval() côté webpack en mode
// dev, sans quoi la console affiche des erreurs CSP et le site cesse de se
// mettre à jour tout seul. Les builds de production n'en ont pas besoin.
const csp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${process.env.NODE_ENV === "development" ? " 'unsafe-eval'" : ""} https://www.googletagmanager.com https://plausible.io`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: https:",
  "font-src 'self' data:",
  "connect-src 'self' https://*.supabase.co https://www.google-analytics.com https://plausible.io",
  "frame-ancestors 'none'",
].join("; ");

const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
  { key: "Content-Security-Policy", value: csp },
];

const nextConfig: NextConfig = {
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      // Images des offres Epic Games réelles (voir src/lib/providers/epic-games.ts).
      { protocol: "https", hostname: "cdn1.epicgames.com" },
      { protocol: "https", hostname: "cdn2.unrealengine.com" },
    ],
  },
  async headers() {
    return [{ source: "/(.*)", headers: securityHeaders }];
  },
};

export default nextConfig;
