"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import type { Offer } from "@/types/offer";
import { trackEvent } from "@/lib/analytics/track";
import { expiryProgress, formatPrice, formatRemaining, getOfferStatus, offerStartsAt } from "@/lib/offers";
import { useTilt } from "@/lib/use-tilt";
import { ArrowIcon, ClockIcon, HeartIcon } from "./icons";
import { PlatformBadge } from "./platform-badge";

type Props = {
  offer: Offer;
  expiresAt: number | null;
  now: number | null;
  favorite: boolean;
  onFavorite: () => void;
  onClaim: () => void;
  featured?: boolean;
};

const claimLabel: Record<"upcoming" | "active" | "expired", string> = {
  upcoming: "BIENTÔT DISPONIBLE",
  active: "RÉCUPÉRER",
  expired: "EXPIRÉE",
};

export function OfferCard({ offer, expiresAt, now, favorite, onFavorite, onClaim, featured = false }: Props) {
  const [justFavorited, setJustFavorited] = useState(false);
  const { tiltStyle, onMove, onLeave } = useTilt();
  const status = now !== null ? getOfferStatus(offer, now) : "active";
  const startsAt = offerStartsAt(offer);
  const remaining = expiresAt !== null && now !== null ? expiresAt - now : null;
  const progress = expiryProgress(remaining);
  // Formater une date dépend du fuseau horaire d'exécution : sans `now !==
  // null` (signal que le composant a fini son premier rendu côté client),
  // le serveur (UTC sur Vercel) et le navigateur du visiteur (heure locale)
  // afficheraient une heure différente pour le même instant — hydration
  // mismatch. On affiche donc un placeholder identique des deux côtés tant
  // que le composant n'est pas monté.
  const dateLabel = expiresAt !== null && now !== null
    ? new Intl.DateTimeFormat("fr-BE", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }).format(expiresAt)
    : "Chargement…";

  function handleFavorite() {
    onFavorite();
    if (!favorite) {
      setJustFavorited(true);
      window.setTimeout(() => setJustFavorited(false), 400);
    }
  }

  return <article className={`offer-card offer-card--${offer.accent} offer-card--${status} ${featured ? "offer-card--featured" : ""} reveal`}>
    <div className="offer-art" onMouseMove={onMove} onMouseLeave={onLeave} style={tiltStyle}>
      <Link href={`/offres/${offer.id}`} className="offer-art-link" aria-label={`Voir ${offer.title}`}><Image src={offer.image} alt={offer.imageAlt} fill sizes="(max-width: 700px) 100vw, (max-width: 1100px) 50vw, 33vw" className="offer-art-image" /></Link>
      <div className="offer-tags"><span className="art-tag">{offer.category}</span>{offer.isNew && <span className="new-tag">NOUVEAU</span>}{status === "upcoming" && <span className="soon-tag">BIENTÔT</span>}</div>
      <button type="button" className={`favorite-button ${favorite ? "is-favorite" : ""} ${justFavorited ? "favorite-button--pop" : ""}`} onClick={handleFavorite} aria-label={`${favorite ? "Retirer" : "Ajouter"} ${offer.title} ${favorite ? "des" : "aux"} favoris`} aria-pressed={favorite}>
        <HeartIcon className="heart-icon" fill={favorite ? "currentColor" : "none"} />
      </button>
    </div>
    <div className="offer-body">
      <div className="offer-meta"><PlatformBadge store={offer.store} /></div>
      <h3><Link href={`/offres/${offer.id}`}>{offer.title}</Link></h3>
      <p className="offer-kind">{offer.kind}</p>
      <div className="offer-divider" />
      <div className="offer-values">
        <div><span className="micro-label">PRIX</span><div className="price-line">{offer.originalPrice !== null && <span className="old-price">{formatPrice(offer.originalPrice)}</span>}<strong>{offer.currentPrice === 0 ? "GRATUIT" : formatPrice(offer.currentPrice)}</strong></div></div>
        <div className="expires"><span className="micro-label">{status === "upcoming" ? "DISPONIBLE LE" : "EXPIRE LE"}</span><span className="expiry-date">{status === "upcoming" && startsAt !== null ? (now !== null ? new Intl.DateTimeFormat("fr-BE", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }).format(startsAt) : "Chargement…") : dateLabel}</span></div>
      </div>
      <div className="offer-actions">
        <div className="countdown"><ClockIcon className="clock-icon" /><span><small>Expire dans</small><strong>{remaining === null ? "—" : formatRemaining(remaining)}</strong></span></div>
        <button type="button" className="claim-button" onClick={() => { trackEvent("claim_click", { store: offer.store, offerId: offer.id }); onClaim(); }} disabled={status !== "active"}>{claimLabel[status]}<span className="cta-icon"><ArrowIcon className="arrow-icon" /></span></button>
      </div>
      <div className="expiry-progress" role="progressbar" aria-label="Temps restant avant expiration" aria-valuenow={Math.round(progress)} aria-valuemin={0} aria-valuemax={100}><span style={{ width: `${progress}%` }} /></div>
    </div>
  </article>;
}
