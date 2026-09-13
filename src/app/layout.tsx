import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "DROPS — Don't pay. Just play.",
  description: "Tous les jeux, drops et récompenses que tu peux récupérer gratuitement.",
  icons: { icon: "/favicon.svg" },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="fr"><body>{children}</body></html>;
}
