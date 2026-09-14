import type { MetadataRoute } from "next";
import { siteConfig } from "@/lib/site-config";

// Convention native Next.js : génère /manifest.webmanifest automatiquement.
// Les icônes utilisent des chemins relatifs (pas siteConfig.url) — un
// manifeste PWA doit référencer ses icônes par une URL relative au domaine
// courant, pour fonctionner identiquement sur vercel.app et sur un futur
// domaine officiel sans aucune modification (voir MISSION V12, point 3).
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${siteConfig.name} — ${siteConfig.tagline}`,
    short_name: siteConfig.name,
    description: siteConfig.description,
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#10120f",
    theme_color: "#10120f",
    lang: "fr-BE",
    categories: ["games", "shopping", "lifestyle"],
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icons/icon-maskable-192.png", sizes: "192x192", type: "image/png", purpose: "maskable" },
      { src: "/icons/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
