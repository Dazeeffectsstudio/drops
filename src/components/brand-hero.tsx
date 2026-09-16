"use client";

import Image from "next/image";
import { useState } from "react";
import type { Offer } from "@/types/offer";
import { trackEvent } from "@/lib/analytics/track";
import { buildBurstDots } from "@/lib/claim-burst";
import { formatPrice, formatRemaining, offerExpiresAt } from "@/lib/offers";
import { ArrowIcon } from "./icons";
import { PlatformBadge } from "./platform-badge";

type Props = { totalValueLabel: string; offerCount: number; onCtaClick: () => void; featuredOffer?: Offer; now: number | null; onClaim: (offer: Offer) => void };

const burstDots = buildBurstDots(10);

// Hero éditorial : le statement de marque à gauche, la vraie jaquette du
// jeu en vedette à droite — asymétrique et posée en biais plutôt que
// centrée, pour que la vraie image domine au lieu d'une forme abstraite.
// Remplace l'ancienne mise en scène "goutte qui tombe" (toujours présente
// en plus discret dans le kicker) désormais qu'une vraie photo porte le
// hero.
export function BrandHero({ totalValueLabel, offerCount, onCtaClick, featuredOffer, now, onClaim }: Props) {
  const [claimed, setClaimed] = useState(false);
  const expiresAt = featuredOffer ? offerExpiresAt(featuredOffer) : null;
  const remaining = expiresAt !== null && now !== null ? expiresAt - now : null;

  function handleClaim() {
    if (!featuredOffer) return;
    trackEvent("claim_click", { store: featuredOffer.store, offerId: featuredOffer.id });
    onClaim(featuredOffer);
    setClaimed(true);
  }

  return <div className="brand-hero">
    <div className="brand-hero-text">
      <div className="brand-hero-kicker">
        <span className="brand-hero-dot" />
        <span>{totalValueLabel} de jeux gratuits aujourd&apos;hui &middot; {offerCount} offres</span>
      </div>
      <h1 className="brand-hero-title">
        <span className="brand-hero-title-strong">Don&apos;t pay.</span>
        <span className="brand-hero-title-light">Just play.</span>
      </h1>
      <p className="brand-hero-description">Epic Games, Steam et cinq autres plateformes, réunies chaque jour au même endroit.</p>
      <button type="button" className="brand-hero-cta" onClick={onCtaClick}>
        Voir les offres <ArrowIcon className="arrow-icon" />
      </button>
    </div>

    {featuredOffer && <div className="brand-hero-feature">
      <div className="brand-hero-feature-art">
        <Image src={featuredOffer.image} alt={featuredOffer.imageAlt} fill priority sizes="(max-width: 900px) 92vw, 46vw" className="brand-hero-feature-image" />
        <span className="brand-hero-feature-tag"><span className="live-dot" /> JEU EN VEDETTE</span>
      </div>
      <div className="brand-hero-feature-card">
        <PlatformBadge store={featuredOffer.store} />
        <strong>{featuredOffer.title}</strong>
        <div className="brand-hero-feature-meta">
          <span>{featuredOffer.originalPrice !== null && <s>{formatPrice(featuredOffer.originalPrice)}</s>} <b>GRATUIT</b></span>
          <span>{remaining === null ? "—" : `Expire dans ${formatRemaining(remaining)}`}</span>
        </div>
        <button type="button" className={`claim-button ${claimed ? "is-claimed" : ""}`} onClick={handleClaim}>
          {claimed ? "Récupéré" : "RÉCUPÉRER"} <ArrowIcon className="arrow-icon" />
          {claimed && burstDots.map((style, i) => <span key={i} className="claim-burst-dot" style={style} />)}
        </button>
      </div>
    </div>}
  </div>;
}
