"use client";

import type { Offer } from "@/types/offer";
import { offerExpiresAt } from "@/lib/offers";
import { OfferCard } from "./offer-card";
import { Reveal } from "./reveal";

type Props = {
  offers: Offer[];
  now: number | null;
  favorites: string[];
  onFavorite: (id: string) => void;
  onClaim: (offer: Offer) => void;
};

export function NewTodaySection({ offers, now, favorites, onFavorite, onClaim }: Props) {
  if (offers.length === 0) return null;
  return <Reveal>
    <section id="nouveau" className="new-today-section" aria-labelledby="new-today-title">
      <div className="section-heading">
        <div><span className="section-index">03 / FRAIS DU JOUR</span><h2 id="new-today-title">⚡ NOUVEAU <em>AUJOURD&apos;HUI</em></h2></div>
        <p>Les dernières offres ajoutées<br />à la plateforme.</p>
      </div>
      <div className="offer-grid">
        {offers.map((offer) => <OfferCard
          key={offer.id}
          offer={offer}
          expiresAt={offerExpiresAt(offer)}
          now={now}
          favorite={favorites.includes(offer.id)}
          onFavorite={() => onFavorite(offer.id)}
          onClaim={() => onClaim(offer)}
        />)}
      </div>
    </section>
  </Reveal>;
}
