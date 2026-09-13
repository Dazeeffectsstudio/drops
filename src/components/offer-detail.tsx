"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import type { Offer } from "@/types/offer";
import { useFavorites } from "@/lib/favorites";
import { formatPrice, formatRemaining, offerExpiresAt } from "@/lib/offers";
import { ArrowIcon, ClockIcon, HeartIcon } from "./icons";
import { PlatformBadge } from "./platform-badge";

export function OfferDetail({ offer }: { offer: Offer }) {
  const [now, setNow] = useState<number | null>(null);
  const { favorites, toggleFavorite } = useFavorites();
  useEffect(() => { setNow(Date.now()); const timer = window.setInterval(() => setNow(Date.now()), 30_000); return () => window.clearInterval(timer); }, []);
  const expiration = offerExpiresAt(offer);
  const remaining = expiration !== null && now !== null ? expiration - now : null;
  const favorite = favorites.includes(offer.id);
  return <main className="subpage site-shell"><header className="subpage-header"><Link href="/" className="brand">DROPS<span className="brand-period">.</span></Link><Link href="/" className="back-link">← RETOUR AUX OFFRES</Link></header><article className="detail-layout"><div className="detail-art"><Image src={offer.image} alt={offer.imageAlt} fill priority className="offer-art-image" /></div><div className="detail-content"><div className="detail-tags"><PlatformBadge store={offer.store} /><span className="art-tag">{offer.category}</span></div><span className="section-index">{offer.eyebrow}</span><h1>{offer.title}</h1><p className="detail-description">{offer.description}</p><div className="detail-info"><span>PLATEFORME <b>{offer.platform}</b></span><span>TYPE <b>{offer.kind}</b></span></div><div className="detail-pricing"><div><small>PRIX HABITUEL</small><s>{offer.originalPrice === null ? "—" : formatPrice(offer.originalPrice)}</s></div><div><small>AUJOURD&apos;HUI</small><strong>GRATUIT</strong></div></div><div className="detail-actions"><div className="countdown"><ClockIcon className="clock-icon" /><span><small>Expire dans</small><strong>{remaining === null ? "—" : formatRemaining(remaining)}</strong></span></div><button type="button" className="claim-button" onClick={() => undefined}>RÉCUPÉRER <ArrowIcon /></button><button type="button" className={`favorite-button detail-favorite ${favorite ? "is-favorite" : ""}`} onClick={() => toggleFavorite(offer.id)} aria-label="Ajouter aux favoris"><HeartIcon fill={favorite ? "currentColor" : "none"} /></button></div></div></article></main>;
}
