"use client";

import Image from "next/image";
import { useRef } from "react";
import type { Offer } from "@/types/offer";
import { formatPrice, formatRemaining, offerExpiresAt } from "@/lib/offers";
import { ArrowIcon } from "./icons";
import { PlatformBadge } from "./platform-badge";

function Slide({ offer, now, onClaim }: { offer: Offer; now: number | null; onClaim: (offer: Offer) => void }) {
  const expiresAt = offerExpiresAt(offer);
  const remaining = now !== null ? expiresAt - now : null;
  const expired = remaining !== null && remaining <= 0;

  return <article className="carousel-slide">
    <div className="carousel-slide-art"><Image src={offer.image} alt={offer.imageAlt} fill sizes="(max-width: 900px) 90vw, 620px" className="offer-art-image" /></div>
    <div className="carousel-slide-content">
      <PlatformBadge store={offer.store} />
      <h3>{offer.title}</h3>
      <div className="carousel-slide-meta">
        <div><span className="micro-label">ÉCONOMISÉ</span><strong>{offer.originalPrice !== null ? formatPrice(offer.originalPrice) : "—"}</strong></div>
        <div><span className="micro-label">EXPIRE DANS</span><strong>{remaining === null ? "—" : formatRemaining(remaining)}</strong></div>
      </div>
      <button type="button" className="claim-button" onClick={() => onClaim(offer)} disabled={expired}>{expired ? "EXPIRÉE" : "RÉCUPÉRER"} <span className="cta-icon"><ArrowIcon className="arrow-icon" /></span></button>
    </div>
  </article>;
}

export function FeaturedCarousel({ offers, now, onClaim }: { offers: Offer[]; now: number | null; onClaim: (offer: Offer) => void }) {
  const trackRef = useRef<HTMLDivElement>(null);
  if (offers.length === 0) return null;

  function scrollByCard(direction: 1 | -1) {
    const track = trackRef.current;
    if (!track) return;
    const card = track.querySelector<HTMLElement>(".carousel-slide");
    const amount = (card?.offsetWidth ?? 600) + 20;
    track.scrollBy({ left: amount * direction, behavior: "smooth" });
  }

  return <section className="carousel-section" aria-label="Offres à la une">
    <div className="section-heading">
      <div><span className="section-index">01 / À LA UNE</span><h2>SÉLECTION <em>DROPS</em></h2></div>
      <div className="carousel-controls">
        <button type="button" onClick={() => scrollByCard(-1)} aria-label="Offre précédente">←</button>
        <button type="button" onClick={() => scrollByCard(1)} aria-label="Offre suivante">→</button>
      </div>
    </div>
    <div className="carousel-track" ref={trackRef}>
      {offers.map((offer) => <Slide key={offer.id} offer={offer} now={now} onClaim={onClaim} />)}
    </div>
  </section>;
}
