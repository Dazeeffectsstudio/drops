"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import type { AuthUser } from "@/lib/auth";
import type { Offer } from "@/types/offer";
import { trackEvent } from "@/lib/analytics/track";
import { useFavorites } from "@/lib/favorites";
import { formatPrice, formatRemaining, offerExpiresAt } from "@/lib/offers";
import { siteConfig } from "@/lib/site-config";
import type { PriceHistoryEntry } from "@/lib/price-history-repository";
import { AccountNavLink } from "./account-nav-link";
import { ArrowIcon, ClockIcon, HeartIcon } from "./icons";
import { OfferPriceHistory } from "./offer-price-history";
import { PlatformBadge } from "./platform-badge";
import { ShareMenu } from "./share-menu";

type Props = { offer: Offer; user: AuthUser | null; initialFavorites: string[]; unreadCount?: number; relatedOffers?: Offer[]; priceHistory?: PriceHistoryEntry[] };

export function OfferDetail({ offer, user, initialFavorites, unreadCount = 0, relatedOffers = [], priceHistory = [] }: Props) {
  const [now, setNow] = useState<number | null>(null);
  const { favorites, toggleFavorite } = useFavorites(user?.id ?? null, initialFavorites);
  useEffect(() => { setNow(Date.now()); const timer = window.setInterval(() => setNow(Date.now()), 30_000); return () => window.clearInterval(timer); }, []);
  const expiration = offerExpiresAt(offer);
  const remaining = expiration !== null && now !== null ? expiration - now : null;
  const favorite = favorites.includes(offer.id);
  return <main className="subpage site-shell"><header className="subpage-header"><Link href="/" className="brand">DROPS<span className="brand-period">.</span></Link><div className="header-actions"><Link href="/" className="back-link">← RETOUR AUX OFFRES</Link><AccountNavLink user={user} unreadCount={unreadCount} /></div></header><article className="detail-layout"><div className="detail-art"><Image src={offer.image} alt={offer.imageAlt} fill priority className="offer-art-image" /></div><div className="detail-content"><div className="detail-tags"><PlatformBadge store={offer.store} /><span className="art-tag">{offer.category}</span></div><span className="section-index">{offer.eyebrow}</span><h1>{offer.title}</h1><p className="detail-description">{offer.description}</p><div className="detail-info"><span>PLATEFORME <b>{offer.platform}</b></span><span>TYPE <b>{offer.kind}</b></span></div><div className="detail-pricing"><div><small>PRIX HABITUEL</small><s>{offer.originalPrice === null ? "—" : formatPrice(offer.originalPrice)}</s></div><div><small>AUJOURD&apos;HUI</small><strong>GRATUIT</strong></div></div><div className="detail-actions"><div className="countdown"><ClockIcon className="clock-icon" /><span><small>Expire dans</small><strong>{remaining === null ? "—" : formatRemaining(remaining)}</strong></span></div><button type="button" className="claim-button" onClick={() => trackEvent("claim_click", { store: offer.store, offerId: offer.id })}>RÉCUPÉRER <ArrowIcon /></button><button type="button" className={`favorite-button detail-favorite ${favorite ? "is-favorite" : ""}`} onClick={() => toggleFavorite(offer.id)} aria-label="Ajouter aux favoris"><HeartIcon fill={favorite ? "currentColor" : "none"} /></button><ShareMenu url={`${siteConfig.url}/offres/${offer.id}`} title={`${offer.title} gratuit sur ${offer.store}`} text={`${offer.title} est gratuit sur ${offer.store} 🎮`} /></div></div></article><OfferPriceHistory offer={offer} history={priceHistory} />{relatedOffers.length > 0 && <section className="related-offers"><div className="section-heading"><div><span className="section-index">OFFRES SIMILAIRES</span><h2>Tu aimeras <em>aussi</em></h2></div></div><div className="related-offers-grid">{relatedOffers.map((related) => <Link key={related.id} href={`/offres/${related.id}`} className="related-offer-card"><span className="related-offer-image"><Image src={related.image} alt={related.imageAlt} fill sizes="(max-width: 700px) 50vw, 25vw" /></span><span className="related-offer-content"><PlatformBadge store={related.store} /><strong>{related.title}</strong></span></Link>)}</div></section>}</main>;
}
