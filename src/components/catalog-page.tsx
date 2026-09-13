"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { Offer } from "@/types/offer";
import { useFavorites } from "@/lib/favorites";
import { isOfferActive, offerExpiresAt } from "@/lib/offers";
import { ArrowIcon } from "./icons";
import { OfferCard } from "./offer-card";

type Props = {
  eyebrow: string;
  title: string;
  description: string;
  offers: Offer[];
  emptyTitle: string;
  emptyDescription: string;
};

export function CatalogPage({ eyebrow, title, description, offers, emptyTitle, emptyDescription }: Props) {
  const [now, setNow] = useState<number | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const { favorites, toggleFavorite } = useFavorites();

  useEffect(() => {
    setNow(Date.now());
    const interval = window.setInterval(() => setNow(Date.now()), 30_000);
    return () => window.clearInterval(interval);
  }, []);

  const activeOffers = useMemo(() => offers.filter((offer) => isOfferActive(offer, now ?? Date.now())), [offers, now]);

  return <>
    <main className="subpage site-shell">
      <header className="subpage-header">
        <Link href="/" className="brand">DROPS<span className="brand-period">.</span></Link>
        <Link href="/" className="back-link">← RETOUR AUX OFFRES</Link>
      </header>
      <section className="subpage-intro">
        <span className="section-index">{eyebrow}</span>
        <h1><em>{title}</em></h1>
        <p>{description}</p>
      </section>
      {activeOffers.length > 0
        ? <div className="offer-grid">
            {activeOffers.map((offer) => <OfferCard
              key={offer.id}
              offer={offer}
              expiresAt={offerExpiresAt(offer)}
              now={now}
              favorite={favorites.includes(offer.id)}
              onFavorite={() => toggleFavorite(offer.id)}
              onClaim={() => setNotice(`${offer.title} est une offre de démonstration. Aucun lien de récupération n’est encore disponible.`)}
            />)}
          </div>
        : <div className="empty-state">
            <span>∅</span>
            <h3>{emptyTitle}</h3>
            <p>{emptyDescription}</p>
            <Link href="/" className="empty-link">VOIR TOUTES LES OFFRES <ArrowIcon /></Link>
          </div>}
    </main>
    {notice && <div className="notice" role="status"><p>{notice}</p><button type="button" onClick={() => setNotice(null)} aria-label="Fermer le message">×</button></div>}
  </>;
}
