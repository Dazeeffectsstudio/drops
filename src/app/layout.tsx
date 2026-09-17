import type { Metadata, Viewport } from "next";
import { Archivo, Space_Grotesk } from "next/font/google";
import { Suspense } from "react";
import { siteConfig } from "@/lib/site-config";
import { AnalyticsScripts } from "@/components/analytics-scripts";
import { BetaBanner } from "@/components/beta-banner";
import { MobileNav } from "@/components/mobile-nav";
import { OfflineBanner } from "@/components/offline-banner";
import { ReferralCapture } from "@/components/referral-capture";
import { ServiceWorkerRegister } from "@/components/sw-register";
import { StreakTracker } from "@/components/streak-tracker";
import "./globals.css";

// Auto-hébergée par Next.js (aucune requête réseau à Google au chargement,
// compatible avec la CSP stricte du site) — remplace Arial pour une
// hiérarchie typographique plus affirmée, tout en gardant les mêmes
// graisses (400 à 900) déjà utilisées partout dans globals.css.
const archivo = Archivo({ subsets: ["latin"], weight: ["400", "500", "600", "700", "800", "900"], variable: "--font-sans", display: "swap" });

// Police d'affichage distincte pour la marque, le hero et les grands titres
// de section — le reste de l'interface (labels, boutons, corps de texte)
// garde Archivo. Les proportions plus techniques/anguleuses de Space
// Grotesk donnent du caractère aux quelques endroits qui portent
// l'identité de la page, sans changer la police des centaines de petits
// éléments d'UI partout ailleurs (risque de régression trop large).
const spaceGrotesk = Space_Grotesk({ subsets: ["latin"], weight: ["500", "700"], variable: "--font-display", display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: { default: `${siteConfig.name} — ${siteConfig.tagline}`, template: `%s — ${siteConfig.name}` },
  description: siteConfig.description,
  keywords: ["jeux gratuits", "epic games gratuit", "steam gratuit", "twitch drops", "prime gaming", "jeux gratuits belgique", "bons plans jeux vidéo"],
  applicationName: siteConfig.name,
  authors: [{ name: siteConfig.name }],
  manifest: "/manifest.webmanifest",
  icons: { icon: "/favicon.svg", apple: "/icons/apple-touch-icon.png" },
  appleWebApp: { capable: true, statusBarStyle: "black-translucent", title: siteConfig.name },
  robots: { index: siteConfig.isProduction, follow: siteConfig.isProduction },
  // Vérification Google Search Console par balise meta — voir DEPLOYMENT.md.
  // Absente tant que NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION n'est pas définie.
  verification: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION ? { google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION } : undefined,
  openGraph: {
    type: "website",
    locale: siteConfig.locale,
    siteName: siteConfig.name,
    title: `${siteConfig.name} — ${siteConfig.tagline}`,
    description: siteConfig.description,
    url: siteConfig.url,
  },
  twitter: {
    card: "summary_large_image",
    title: `${siteConfig.name} — ${siteConfig.tagline}`,
    description: siteConfig.description,
  },
};

export const viewport: Viewport = {
  themeColor: "#10120f",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="fr" className={`${archivo.variable} ${spaceGrotesk.variable}`}><body>
    <BetaBanner />
    <OfflineBanner />
    {children}
    <MobileNav />
    <StreakTracker />
    <ServiceWorkerRegister />
    <Suspense fallback={null}><ReferralCapture /></Suspense>
    <AnalyticsScripts />
  </body></html>;
}
