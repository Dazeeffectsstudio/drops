import type { Metadata, Viewport } from "next";
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
  return <html lang="fr"><body>
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
