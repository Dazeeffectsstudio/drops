"use client";

import Image from "next/image";
import type { Offer } from "@/types/offer";
import { formatPrice } from "@/lib/offers";
import { useCountUp } from "@/lib/use-count-up";
import { ArrowIcon } from "./icons";
import { PlatformBadge } from "./platform-badge";

type Props = { totalValue: number; offerCount: number; onCtaClick: () => void; featuredOffer?: Offer };

// Hero plein cadre façon store de jeu (Epic Games Store / Xbox / Steam) :
// la jaquette du jeu en vedette remplit tout le cadre, le texte est posé
// dessus avec un voile de lisibilité — jamais une petite image flottante
// avec du vide autour. Une seule ligne d'action, pas deux CTA qui se
// disputent l'attention.
export function BrandHero({ totalValue, offerCount, onCtaClick, featuredOffer }: Props) {
  const animatedCount = useCountUp(offerCount);
  // Anime en centimes (entiers) puis reconvertit, sinon l'arrondi de
  // l'animation coupe les centimes du prix affiché (98,40 € -> 98,00 €).
  const animatedValueCents = useCountUp(Math.round(totalValue * 100));

  return <div className="brand-hero">
    {featuredOffer && <Image src={featuredOffer.image} alt="" fill priority sizes="100vw" className="brand-hero-bg" />}
    <div className="brand-hero-grade" />
    <div className="brand-hero-scrim" />

    <div className="brand-hero-content">
      <div className="brand-hero-kicker">
        <span className="brand-hero-dot" />
        <span>{animatedCount} offres gratuites en ce moment, pour {formatPrice(animatedValueCents / 100)}</span>
      </div>

      <h1 className="brand-hero-title">
        <span className="brand-hero-title-strong">
          {"Don't pay.".split(" ").map((word, i) => <span key={i} className="brand-hero-word" style={{ animationDelay: `${.5 + i * .06}s` }}>{word}</span>)}
        </span>
        <span className="brand-hero-title-light">
          {"Just play.".split(" ").map((word, i) => <span key={i} className="brand-hero-word" style={{ animationDelay: `${.62 + i * .06}s` }}>{word}</span>)}
        </span>
      </h1>

      <p className="brand-hero-description">Epic Games, Steam et cinq autres plateformes, réunies chaque jour au même endroit.</p>

      <div className="brand-hero-bottom">
        {featuredOffer && <div className="brand-hero-offer">
          <span className="brand-hero-offer-tag"><span className="live-dot" /> JEU EN VEDETTE</span>
          <div className="brand-hero-offer-row">
            <PlatformBadge store={featuredOffer.store} compact />
            <strong>{featuredOffer.title}</strong>
            {featuredOffer.originalPrice !== null && <s>{formatPrice(featuredOffer.originalPrice)}</s>}
            <b>GRATUIT</b>
          </div>
        </div>}
        <button type="button" className="brand-hero-cta" onClick={onCtaClick}>
          Voir les offres <span className="cta-icon"><ArrowIcon className="arrow-icon" /></span>
        </button>
      </div>
    </div>
  </div>;
}
