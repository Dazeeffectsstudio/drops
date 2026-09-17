"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { AuthUser } from "@/lib/auth";
import type { Offer } from "@/types/offer";
import { useFavorites } from "@/lib/favorites";
import { getOfferStatus, offerExpiresAt } from "@/lib/offers";
import { AccountNavLink } from "./account-nav-link";
import { ArrowIcon } from "./icons";
import { OfferCard } from "./offer-card";

type Tab = "active" | "upcoming" | "expired";
const tabs: Array<{ key: Tab; label: string }> = [
  { key: "active", label: "Actives" },
  { key: "upcoming", label: "Bientôt disponibles" },
  { key: "expired", label: "Expirées" },
];

export function FavoritesPage({ offers, user, initialFavorites, unreadCount = 0 }: { offers: Offer[]; user: AuthUser | null; initialFavorites: string[]; unreadCount?: number }) {
  const [now, setNow] = useState<number | null>(null);
  const [tab, setTab] = useState<Tab>("active");
  const { favorites, ready, toggleFavorite } = useFavorites(user?.id ?? null, initialFavorites);
  useEffect(() => {
    setNow(Date.now());
  }, []);
  const allItems = offers.filter((offer) => favorites.includes(offer.id));
  // Avant le montage (now === null), impossible de connaître le vrai statut
  // de chaque offre sans risquer un hydration mismatch (voir la note dans
  // offer-card.tsx) — on affiche donc tout dans l'onglet "Actives" par
  // défaut le temps que `now` se remplisse, sans jamais formater de date.
  const items = now === null ? allItems : allItems.filter((offer) => getOfferStatus(offer, now) === tab);
  const counts = now === null ? null : {
    active: allItems.filter((offer) => getOfferStatus(offer, now) === "active").length,
    upcoming: allItems.filter((offer) => getOfferStatus(offer, now) === "upcoming").length,
    expired: allItems.filter((offer) => getOfferStatus(offer, now) === "expired").length,
  };
  return <main className="subpage site-shell"><header className="subpage-header"><Link href="/" className="brand">DROPS<span className="brand-period">.</span></Link><div className="header-actions"><Link href="/" className="back-link">← Retour aux offres</Link><AccountNavLink user={user} unreadCount={unreadCount} /></div></header><section className="subpage-intro"><h1>Mes <em>favoris</em></h1><p>Retrouve les offres que tu veux surveiller avant leur expiration.</p></section>
    {allItems.length > 0 && <div className="admin-sync-filters" role="tablist" aria-label="Filtrer mes favoris">
      {tabs.map((entry) => <button key={entry.key} type="button" role="tab" aria-selected={tab === entry.key} className={tab === entry.key ? "selected" : ""} onClick={() => setTab(entry.key)}>{entry.label}{counts && ` (${counts[entry.key]})`}</button>)}
    </div>}
    {!ready ? <div className="empty-state">Chargement des favoris…</div> : allItems.length === 0 ? <div className="empty-state"><span>♡</span><h3>Ta collection est vide.</h3><p>Ajoute des offres depuis l’accueil pour les garder sous la main.</p><Link href="/" className="empty-link">Découvrir les offres <ArrowIcon /></Link></div> : items.length > 0 ? <div className="offer-grid">{items.map((offer) => <OfferCard key={offer.id} offer={offer} expiresAt={offerExpiresAt(offer)} now={now} favorite onFavorite={() => toggleFavorite(offer.id)} onClaim={() => undefined} />)}</div> : <div className="empty-state"><span>∅</span><h3>Rien ici pour l&apos;instant.</h3><p>Aucun favori dans cette catégorie.</p></div>}
  </main>;
}
