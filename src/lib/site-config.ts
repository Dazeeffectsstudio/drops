// Configuration centralisée du site — toutes les URLs, métadonnées SEO et
// liens de contact/réseaux sociaux du projet passent par ce fichier plutôt
// que d'être répétés (et donc désynchronisés) dans chaque page.
//
// NEXT_PUBLIC_SITE_URL doit être définie sur le vrai domaine en production
// (ex: https://drops.be) — sans elle, tout retombe sur localhost:3000, ce
// qui reste cohérent en développement mais ne doit jamais arriver en prod
// (sitemap/robots/Open Graph pointeraient vers localhost).
const productionUrl = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "");

export const siteConfig = {
  name: "DROPS",
  tagline: "DON'T PAY. JUST PLAY.",
  description: "Tous les jeux, drops et récompenses que tu peux récupérer gratuitement. Epic Games, Steam, PlayStation, Xbox, Twitch Drops, Roblox, Prime Gaming — sans bruit, seulement les bonnes opportunités.",
  url: productionUrl ?? "http://localhost:3000",
  isProduction: Boolean(productionUrl),
  contactEmail: "contact@drops.be",
  social: {
    twitter: "",
    discord: "",
    facebook: "",
  },
  locale: "fr_BE",
  country: "Belgique",
} as const;

export function absoluteUrl(path: string): string {
  if (/^https?:\/\//.test(path)) return path;
  return `${siteConfig.url}${path.startsWith("/") ? path : `/${path}`}`;
}
