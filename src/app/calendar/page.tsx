import type { Metadata } from "next";
import Link from "next/link";
import { CalendarView } from "@/components/calendar-view";
import { AccountNavLink } from "@/components/account-nav-link";
import { getCurrentUser } from "@/lib/auth";
import { getCurrentFavoritesState } from "@/lib/favorites-repository";
import { getMyUnreadNotificationCount } from "@/lib/notification-logs-repository";
import { getAllOffers } from "@/lib/offers-repository";
import { absoluteUrl } from "@/lib/site-config";

export const metadata: Metadata = {
  title: "Calendrier des offres",
  description: "Toutes les offres gratuites DROPS sous forme de calendrier — débuts, fins, filtrable par plateforme et catégorie.",
  alternates: { canonical: absoluteUrl("/calendar") },
};

export default async function CalendarPage() {
  const [offers, user, { favorites }, unreadCount] = await Promise.all([
    getAllOffers(),
    getCurrentUser(),
    getCurrentFavoritesState(),
    getMyUnreadNotificationCount(),
  ]);

  return <main className="subpage site-shell">
    <header className="subpage-header">
      <Link href="/" className="brand">DROPS<span className="brand-period">.</span></Link>
      <div className="header-actions">
        <Link href="/" className="back-link">← Retour au site</Link>
        <AccountNavLink user={user} unreadCount={unreadCount} />
      </div>
    </header>
    <section className="subpage-intro">
      <h1>Le <em>calendrier</em> des offres</h1>
      <p>Visualise les débuts et fins d&apos;offres, filtre par plateforme ou catégorie, et repère celles que tu suis.</p>
    </section>
    <CalendarView offers={offers} user={user} initialFavorites={favorites} />
  </main>;
}
