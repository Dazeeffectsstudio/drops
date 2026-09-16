"use client";

import type { CSSProperties } from "react";
import { ArrowIcon } from "./icons";

type Props = { totalValueLabel: string; offerCount: number; onCtaClick: () => void };

const SCATTER_DOTS = [
  { color: "#f0c674", x: -300, y: -160, delay: 0 },
  { color: "#6fa8dc", x: 280, y: -190, delay: 0.05 },
  { color: "#7bc97e", x: -380, y: 90, delay: 0.1 },
  { color: "#5b7fc7", x: 350, y: 70, delay: 0.15 },
  { color: "#cdb8ff", x: -200, y: 220, delay: 0.02 },
  { color: "#e2726a", x: 210, y: 210, delay: 0.07 },
  { color: "#8ecae6", x: 0, y: -260, delay: 0.12 },
];

// Hero de marque : la goutte tombe, rebondit puis éclate en révélant le
// titre — reprend littéralement le nom "DROPS" comme mise en scène
// d'entrée plutôt que comme simple mot. Animation CSS pure, jouée une
// fois au montage ; `prefers-reduced-motion` la neutralise via la règle
// globale déjà en place dans globals.css.
export function BrandHero({ totalValueLabel, offerCount, onCtaClick }: Props) {
  return <div className="brand-hero">
    <div className="brand-hero-bg" aria-hidden="true" />
    <svg className="brand-hero-rings" viewBox="0 0 1440 820" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <circle cx="720" cy="380" r="280" />
      <circle cx="720" cy="380" r="200" />
    </svg>

    <div className="brand-hero-drop" aria-hidden="true" />
    <div className="brand-hero-trail" aria-hidden="true" />
    <div className="brand-hero-ring" aria-hidden="true" />
    {SCATTER_DOTS.map((dot, i) => <span
      key={i}
      className="brand-hero-scatter"
      aria-hidden="true"
      style={{ "--to": `translate(${dot.x}px, ${dot.y}px)`, background: dot.color, animationDelay: `${1.22 + dot.delay}s` } as CSSProperties}
    />)}

    <div className="brand-hero-content">
      <div className="brand-hero-kicker">
        <span className="brand-hero-dot" />
        <span>{totalValueLabel} de jeux gratuits aujourd&apos;hui &middot; {offerCount} offres</span>
      </div>
      <h1 className="brand-hero-title">
        <span className="brand-hero-title-strong">Don&apos;t pay<span className="brand-hero-accent">.</span></span>
        <span className="brand-hero-title-light">Just play<span className="brand-hero-accent">.</span></span>
      </h1>
      <p className="brand-hero-description">Epic Games, Steam et cinq autres plateformes, réunies chaque jour au même endroit.</p>
      <button type="button" className="brand-hero-cta" onClick={onCtaClick}>
        Voir les offres <ArrowIcon className="arrow-icon" />
      </button>
    </div>
  </div>;
}
