"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import type { AuthUser } from "@/lib/auth";
import type { Offer, OfferCategory } from "@/types/offer";
import { useFavorites } from "@/lib/favorites";
import { formatPrice, isOfferActive, offerExpiresAt, totalFreeValue } from "@/lib/offers";
import { AccountNavLink } from "./account-nav-link";
import { ArrowIcon } from "./icons";
import { OfferCard } from "./offer-card";
import { Reveal } from "./reveal";

type Props = {
  title: string;
  description: string;
  offers: Offer[];
  emptyTitle: string;
  emptyDescription: string;
  logoImage?: string;
  logoIcon?: ReactNode;
  categoryFilter?: boolean;
  user: AuthUser | null;
  initialFavorites: string[];
  unreadCount?: number;
  intro?: string;
  faq?: Array<{ question: string; answer: string }>;
};

export function CatalogPage({ title, description, offers, emptyTitle, emptyDescription, logoImage, logoIcon, categoryFilter = false, user, initialFavorites, unreadCount = 0, intro, faq }: Props) {
  const [now, setNow] = useState<number | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [category, setCategory] = useState<OfferCategory | "TOUT">("TOUT");
  const { favorites, toggleFavorite } = useFavorites(user?.id ?? null, initialFavorites);

  useEffect(() => {
    setNow(Date.now());
    const interval = window.setInterval(() => setNow(Date.now()), 30_000);
    return () => window.clearInterval(interval);
  }, []);

  const activeOffers = useMemo(() => offers.filter((offer) => isOfferActive(offer, now ?? Date.now())), [offers, now]);
  const availableCategories = useMemo(() => Array.from(new Set(activeOffers.map((offer) => offer.category))), [activeOffers]);
  const visibleOffers = categoryFilter && category !== "TOUT" ? activeOffers.filter((offer) => offer.category === category) : activeOffers;
  const totalValue = totalFreeValue(activeOffers);

  return <>
    <main className="subpage site-shell">
      <header className="subpage-header">
        <Link href="/" className="brand">DROPS<span className="brand-period">.</span></Link>
        <div className="header-actions"><Link href="/" className="back-link">← Retour aux offres</Link><AccountNavLink user={user} unreadCount={unreadCount} /></div>
      </header>
      <section className={`subpage-intro ${logoImage || logoIcon ? "subpage-intro--banner" : ""}`}>
        {logoImage && <span className="browse-logo subpage-logo" aria-hidden="true"><Image src={logoImage} alt="" width={84} height={84} unoptimized /></span>}
        {logoIcon && <span className="browse-logo browse-logo--icon subpage-logo" aria-hidden="true">{logoIcon}</span>}
        <h1><em>{title}</em></h1>
        <p>{description}</p>
        <div className="subpage-stats">
          <span><b>{activeOffers.length}</b> offre{activeOffers.length > 1 ? "s" : ""} disponible{activeOffers.length > 1 ? "s" : ""}</span>
          <span><b>{formatPrice(totalValue)}</b> économisés</span>
        </div>
      </section>
      {categoryFilter && availableCategories.length > 1 && <div className="filters">
        <div className="filter-group" role="group" aria-label="Catégorie">
          <span className="filter-label">TYPE</span>
          <div className="filter-options">
            <button type="button" className={category === "TOUT" ? "selected" : ""} onClick={() => setCategory("TOUT")} aria-pressed={category === "TOUT"}>TOUT</button>
            {availableCategories.map((item) => <button key={item} type="button" className={category === item ? "selected" : ""} onClick={() => setCategory(item)} aria-pressed={category === item}>{item}</button>)}
          </div>
        </div>
      </div>}
      {visibleOffers.length > 0
        ? <Reveal><div className="offer-grid">
            {visibleOffers.map((offer) => <OfferCard
              key={offer.id}
              offer={offer}
              expiresAt={offerExpiresAt(offer)}
              now={now}
              favorite={favorites.includes(offer.id)}
              onFavorite={() => toggleFavorite(offer.id)}
              onClaim={() => setNotice(`${offer.title} est une offre de démonstration. Aucun lien de récupération n’est encore disponible.`)}
            />)}
          </div></Reveal>
        : <div className="empty-state">
            <span>∅</span>
            <h3>{emptyTitle}</h3>
            <p>{emptyDescription}</p>
            <Link href="/" className="empty-link">Voir toutes les offres <ArrowIcon /></Link>
          </div>}
      {intro && <section className="seo-intro"><p>{intro}</p></section>}
      {faq && faq.length > 0 && <section className="faq-section">
        <h2>Questions <em>fréquentes</em></h2>
        <div className="faq-list">
          {faq.map((entry) => <details key={entry.question} className="faq-item">
            <summary>{entry.question}</summary>
            <p>{entry.answer}</p>
          </details>)}
        </div>
      </section>}
    </main>
    {notice && <div className="notice" role="status"><p>{notice}</p><button type="button" onClick={() => setNotice(null)} aria-label="Fermer le message">×</button></div>}
  </>;
}
