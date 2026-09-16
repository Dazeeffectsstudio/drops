"use client";

import Image from "next/image";
import { useEffect, useState, type MouseEvent } from "react";
import type { Offer } from "@/types/offer";
import { trackEvent } from "@/lib/analytics/track";
import { buildBurstDots } from "@/lib/claim-burst";
import { formatPrice, formatRemaining, offerExpiresAt } from "@/lib/offers";
import { ArrowIcon } from "./icons";
import { PlatformBadge } from "./platform-badge";

type Props = { offers: Offer[]; now: number | null; onClaim: (offer: Offer) => void };

const DROP_COUNT = 10;
const burstDots = buildBurstDots(10);

export function FeaturedHeroBanner({ offers, now, onClaim }: Props) {
  const [index, setIndex] = useState(0);
  const [glow, setGlow] = useState({ x: 74, y: 32 });
  const [claimedId, setClaimedId] = useState<string | null>(null);

  // Fait défiler automatiquement entre les offres à la une, comme un vrai
  // banner de store (Epic Games/PlayStation) — s'arrête tout seul s'il n'y a
  // qu'une seule offre à montrer.
  useEffect(() => {
    if (offers.length < 2) return;
    const timer = window.setInterval(() => setIndex((current) => (current + 1) % offers.length), 7000);
    return () => window.clearInterval(timer);
  }, [offers.length]);

  useEffect(() => { setClaimedId(null); }, [index]);

  if (offers.length === 0) return null;
  const offer = offers[Math.min(index, offers.length - 1)];
  const expiresAt = offerExpiresAt(offer);
  const remaining = now !== null ? expiresAt - now : null;
  const claimed = claimedId === offer.id;

  function handleMove(event: MouseEvent<HTMLDivElement>) {
    const rect = event.currentTarget.getBoundingClientRect();
    setGlow({ x: ((event.clientX - rect.left) / rect.width) * 100, y: ((event.clientY - rect.top) / rect.height) * 100 });
  }

  function handleClaim() {
    trackEvent("claim_click", { store: offer.store, offerId: offer.id });
    onClaim(offer);
    setClaimedId(offer.id);
  }

  return <div className="featured-hero" onMouseMove={handleMove}>
    <Image src={offer.image} alt={offer.imageAlt} fill priority sizes="100vw" className="featured-hero-image" />
    <div className="featured-hero-glow" style={{ background: `radial-gradient(circle at ${glow.x}% ${glow.y}%, rgba(212,252,113,.3), transparent 45%)` }} />
    <div className="featured-hero-vignette" />
    <div className="featured-hero-drops" aria-hidden="true">
      {Array.from({ length: DROP_COUNT }).map((_, i) => <span
        key={i}
        className="featured-drop"
        style={{ left: `${5 + i * 9.4}%`, width: `${3 + (i % 3)}px`, height: `${3 + (i % 3)}px`, animationDuration: `${6 + (i % 4) * 1.1}s`, animationDelay: `${i * 0.55}s` }}
      />)}
    </div>

    <div className="featured-hero-kicker"><span className="live-dot" /> JEU EN VEDETTE</div>

    <div className="featured-hero-content">
      <h2>{offer.title}</h2>
      <div className="featured-hero-meta">
        <PlatformBadge store={offer.store} />
        <span className="featured-hero-price">{offer.originalPrice !== null && <s>{formatPrice(offer.originalPrice)}</s>} <strong>GRATUIT</strong></span>
        <span className="featured-hero-expiry">{remaining === null ? "—" : `Expire dans ${formatRemaining(remaining)}`}</span>
      </div>
      <div className="featured-hero-actions">
        <button type="button" className={`featured-claim-button ${claimed ? "is-claimed" : ""}`} onClick={handleClaim}>
          {claimed ? "Récupéré" : "Récupérer maintenant"} <ArrowIcon className="arrow-icon" />
          {claimed && burstDots.map((style, i) => <span key={i} className="claim-burst-dot" style={style} />)}
        </button>
        {offers.length > 1 && <div className="featured-hero-dots">
          {offers.map((item, i) => <button key={item.id} type="button" className={i === index ? "is-active" : ""} aria-label={`Voir ${item.title}`} onClick={() => setIndex(i)} />)}
        </div>}
      </div>
    </div>
  </div>;
}
