"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import type { AuthUser } from "@/lib/auth";
import type { Offer } from "@/types/offer";
import { trackEvent } from "@/lib/analytics/track";
import { buildBurstDots } from "@/lib/claim-burst";
import { useFavorites } from "@/lib/favorites";
import { expiryProgress, formatPrice, formatRemaining, offerExpiresAt } from "@/lib/offers";
import { siteConfig } from "@/lib/site-config";
import type { PriceHistoryEntry } from "@/lib/price-history-repository";
import { AccountNavLink } from "./account-nav-link";
import { ArrowIcon, ClockIcon, HeartIcon } from "./icons";
import { OfferPriceHistory } from "./offer-price-history";
import { PlatformBadge } from "./platform-badge";
import { RelatedOfferCard } from "./related-offer-card";
import { ShareMenu } from "./share-menu";

type Props = { offer: Offer; user: AuthUser | null; initialFavorites: string[]; unreadCount?: number; relatedOffers?: Offer[]; priceHistory?: PriceHistoryEntry[] };

const burstDots = buildBurstDots(10);

export function OfferDetail({ offer, user, initialFavorites, unreadCount = 0, relatedOffers = [], priceHistory = [] }: Props) {
  const [now, setNow] = useState<number | null>(null);
  const [claimed, setClaimed] = useState(false);
  const { favorites, toggleFavorite } = useFavorites(user?.id ?? null, initialFavorites);
  useEffect(() => { setNow(Date.now()); const timer = window.setInterval(() => setNow(Date.now()), 30_000); return () => window.clearInterval(timer); }, []);
  const expiration = offerExpiresAt(offer);
  const remaining = expiration !== null && now !== null ? expiration - now : null;
  const progress = expiryProgress(remaining);
  const urgent = remaining !== null && remaining > 0 && remaining < 24 * 3_600_000;
  const favorite = favorites.includes(offer.id);

  function handleClaim() {
    trackEvent("claim_click", { store: offer.store, offerId: offer.id });
    setClaimed(true);
  }

  return <main className="subpage site-shell">
    <header className="subpage-header"><Link href="/" className="brand">DROPS<span className="brand-period">.</span></Link><div className="header-actions"><Link href="/" className="back-link">← Retour aux offres</Link><AccountNavLink user={user} unreadCount={unreadCount} /></div></header>

    <div className="detail-hero">
      <Image src={offer.image} alt={offer.imageAlt} fill priority sizes="100vw" className="detail-hero-image" />
      <div className="detail-hero-vignette" />
      <div className="detail-hero-content">
        <div className="detail-tags"><PlatformBadge store={offer.store} /><span className="art-tag">{offer.category}</span></div>
        <h1>{offer.title}</h1>
      </div>
    </div>

    <div className="detail-body">
      <div className="detail-main">
        <p className="detail-description">{offer.description}</p>
        <div className="detail-cards">
          <div className="detail-card"><span className="micro-label">PLATEFORME</span><strong>{offer.platform}</strong></div>
          <div className="detail-card"><span className="micro-label">TYPE</span><strong>{offer.kind}</strong></div>
          <div className="detail-card"><span className="micro-label">PRIX HABITUEL</span><strong>{offer.originalPrice === null ? "—" : formatPrice(offer.originalPrice)}</strong></div>
          <div className="detail-card detail-card--accent"><span className="micro-label">AUJOURD&apos;HUI</span><strong>GRATUIT</strong></div>
        </div>
      </div>
      <aside className="detail-side">
        <div className={`detail-countdown-card ${urgent ? "is-urgent" : ""}`}>
          <span className="micro-label">{remaining !== null && remaining <= 0 ? "OFFRE EXPIRÉE" : "EXPIRE DANS"}</span>
          <div className="detail-countdown-value"><ClockIcon className={`clock-icon ${urgent ? "is-urgent" : ""}`} />{remaining === null ? "—" : formatRemaining(remaining)}</div>
          <div className="expiry-progress" role="progressbar" aria-label="Temps restant avant expiration" aria-valuenow={Math.round(progress)} aria-valuemin={0} aria-valuemax={100}><span style={{ width: `${progress}%`, ...(urgent ? { background: "#ff6b5b" } : {}) }} /></div>
        </div>
        <button type="button" className={`claim-button detail-claim ${claimed ? "is-claimed" : ""}`} onClick={handleClaim} disabled={remaining !== null && remaining <= 0}>
          {claimed ? "Récupéré" : "Récupérer"} <span className="cta-icon"><ArrowIcon className="arrow-icon" /></span>
          {claimed && burstDots.map((style, i) => <span key={i} className="claim-burst-dot" style={style} />)}
        </button>
        <div className="detail-side-actions">
          <button type="button" className={`favorite-button detail-favorite ${favorite ? "is-favorite" : ""}`} onClick={() => toggleFavorite(offer.id)} aria-label={`${favorite ? "Retirer" : "Ajouter"} ${offer.title} ${favorite ? "des" : "aux"} favoris`} aria-pressed={favorite}><HeartIcon fill={favorite ? "currentColor" : "none"} /></button>
          <ShareMenu url={`${siteConfig.url}/offres/${offer.id}`} title={`${offer.title} gratuit sur ${offer.store}`} text={`${offer.title} est gratuit sur ${offer.store} 🎮`} />
        </div>
      </aside>
    </div>

    <OfferPriceHistory offer={offer} history={priceHistory} />

    {relatedOffers.length > 0 && <section className="related-offers">
      <div className="section-heading"><div><h2>Tu aimeras <em>aussi</em></h2></div></div>
      <div className="related-offers-grid">{relatedOffers.map((related) => <RelatedOfferCard key={related.id} offer={related} />)}</div>
    </section>}
  </main>;
}
