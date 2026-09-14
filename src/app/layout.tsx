import type { Metadata, Viewport } from "next";
import { siteConfig } from "@/lib/site-config";
import { MobileNav } from "@/components/mobile-nav";
import { AnalyticsScripts } from "@/components/analytics-scripts";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: { default: `${siteConfig.name} — ${siteConfig.tagline}`, template: `%s — ${siteConfig.name}` },
  description: siteConfig.description,
  keywords: ["jeux gratuits", "epic games gratuit", "steam gratuit", "twitch drops", "prime gaming", "jeux gratuits belgique", "bons plans jeux vidéo"],
  applicationName: siteConfig.name,
  authors: [{ name: siteConfig.name }],
  icons: { icon: "/favicon.svg" },
  robots: { index: siteConfig.isProduction, follow: siteConfig.isProduction },
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
    {children}
    <MobileNav />
    <AnalyticsScripts />
  </body></html>;
}
