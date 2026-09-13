"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { offers } from "@/data/offers";
import { useFavorites } from "@/lib/favorites";
import { offerExpiresAt } from "@/lib/offers";
import { ArrowIcon } from "./icons";
import { OfferCard } from "./offer-card";

export function FavoritesPage() {
  const [now, setNow] = useState<number | null>(null);
  const { favorites, ready, toggleFavorite } = useFavorites();
  useEffect(() => {
    setNow(Date.now());
  }, []);
  const items = offers.filter((offer) => favorites.includes(offer.id));
  return <main className="subpage site-shell"><header className="subpage-header"><Link href="/" className="brand">DROPS<span className="brand-period">.</span></Link><Link href="/" className="back-link">← RETOUR AUX OFFRES</Link></header><section className="subpage-intro"><span className="section-index">MA COLLECTION</span><h1>MES <em>FAVORIS</em></h1><p>Retrouve les offres que tu veux surveiller avant leur expiration.</p></section>{!ready ? <div className="empty-state">Chargement des favoris…</div> : items.length > 0 ? <div className="offer-grid">{items.map((offer) => <OfferCard key={offer.id} offer={offer} expiresAt={offerExpiresAt(offer)} now={now} favorite onFavorite={() => toggleFavorite(offer.id)} onClaim={() => undefined} />)}</div> : <div className="empty-state"><span>♡</span><h3>Ta collection est vide.</h3><p>Ajoute des offres depuis l’accueil pour les garder sous la main.</p><Link href="/" className="empty-link">DÉCOUVRIR LES OFFRES <ArrowIcon /></Link></div>}</main>;
}
