import type { Metadata } from "next";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { getCurrentFavoritesState } from "@/lib/favorites-repository";
import { faqJsonLd } from "@/lib/json-ld";
import { getMyUnreadNotificationCount } from "@/lib/notification-logs-repository";
import { getAllOffers } from "@/lib/offers-repository";
import { isOfferActive, offerExpiresAt } from "@/lib/offers";
import { absoluteUrl } from "@/lib/site-config";
import { AccountNavLink } from "@/components/account-nav-link";
import { ShareMenu } from "@/components/share-menu";
import { WeekOfferGrid } from "@/components/week-offer-grid";

export const metadata: Metadata = {
  title: "Jeux gratuits cette semaine",
  description: "Toutes les offres de jeux gratuits actives cette semaine : nouveautés, offres qui expirent bientôt, et FAQ. Mis à jour automatiquement.",
  alternates: { canonical: absoluteUrl("/free-games-this-week") },
  openGraph: { title: "Jeux gratuits cette semaine", description: "Toutes les offres de jeux gratuits actives cette semaine sur DROPS.", type: "website", url: absoluteUrl("/free-games-this-week") },
};
export const revalidate = 1800;

const faq = [
  { question: "Cette liste est-elle mise à jour automatiquement ?", answer: "Oui — dès qu'une offre expire ou qu'une nouvelle apparaît, cette page se met à jour toute seule, sans intervention humaine." },
  { question: "Puis-je partager cette page ?", answer: "Oui, c'est fait pour — utilise le bouton Partager en haut de page pour l'envoyer sur Discord, WhatsApp, X ou Telegram." },
];

export default async function FreeGamesThisWeekPage() {
  const [offers, user, { favorites }, unreadCount] = await Promise.all([
    getAllOffers(),
    getCurrentUser(),
    getCurrentFavoritesState(),
    getMyUnreadNotificationCount(),
  ]);

  const now = Date.now();
  const active = offers.filter((offer) => isOfferActive(offer, now));
  const endingSoon = active.filter((offer) => {
    const remaining = offerExpiresAt(offer) - now;
    return remaining > 0 && remaining < 48 * 60 * 60 * 1000;
  });
  const newOffers = active.filter((offer) => offer.isNew);
  const url = absoluteUrl("/free-games-this-week");

  const itemListJsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Jeux gratuits cette semaine",
    url,
    numberOfItems: active.length,
    itemListElement: active.slice(0, 20).map((offer, index) => ({ "@type": "ListItem", position: index + 1, url: absoluteUrl(`/offres/${offer.id}`), name: offer.title })),
  };

  return <>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListJsonLd) }} />
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd(faq)) }} />
    <main className="subpage site-shell">
      <header className="subpage-header">
        <Link href="/" className="brand">DROPS<span className="brand-period">.</span></Link>
        <div className="header-actions"><Link href="/" className="back-link">← RETOUR AU SITE</Link><AccountNavLink user={user} unreadCount={unreadCount} /></div>
      </header>
      <section className="subpage-intro">
        <span className="section-index">ÉDITION DE LA SEMAINE</span>
        <h1>Jeux gratuits <em>cette semaine</em></h1>
        <p>{active.length} offre{active.length > 1 ? "s" : ""} actives, mises à jour automatiquement.</p>
        <ShareMenu url={url} title="Jeux gratuits cette semaine sur DROPS" text="Tous les jeux gratuits de la semaine, en un seul endroit 🎮" />
      </section>

      {newOffers.length > 0 && <section className="week-section">
        <h2>⚡ Nouveautés</h2>
        <WeekOfferGrid offers={newOffers} user={user} initialFavorites={favorites} />
      </section>}

      {endingSoon.length > 0 && <section className="week-section">
        <h2>⏳ Expirent bientôt</h2>
        <WeekOfferGrid offers={endingSoon} user={user} initialFavorites={favorites} />
      </section>}

      <section className="week-section">
        <h2>Toutes les offres actives</h2>
        {active.length === 0 ? <p className="empty-note">Aucune offre active pour l&apos;instant.</p> : <WeekOfferGrid offers={active} user={user} initialFavorites={favorites} />}
      </section>

      <section className="faq-section">
        <span className="section-index">FAQ</span>
        <h2>Questions <em>fréquentes</em></h2>
        <div className="faq-list">
          {faq.map((entry) => <details key={entry.question} className="faq-item"><summary>{entry.question}</summary><p>{entry.answer}</p></details>)}
        </div>
      </section>
    </main>
  </>;
}
