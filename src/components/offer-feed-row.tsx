"use client";

import Image from "next/image";
import Link from "next/link";
import type { Offer } from "@/types/offer";
import { trackEvent } from "@/lib/analytics/track";
import { formatPrice, formatRemaining, getOfferStatus } from "@/lib/offers";
import { ClockIcon, HeartIcon } from "./icons";
import { PlatformBadge } from "./platform-badge";

type Props = {
  offer: Offer;
  expiresAt: number | null;
  now: number | null;
  favorite: boolean;
  onFavorite: () => void;
  onClaim: () => void;
};

const claimLabel: Record<"upcoming" | "active" | "expired", string> = {
  upcoming: "Bientôt disponible",
  active: "Récupérer",
  expired: "Expirée",
};

export function OfferFeedRow({ offer, expiresAt, now, favorite, onFavorite, onClaim }: Props) {
  const status = now !== null ? getOfferStatus(offer, now) : "active";
  const remaining = expiresAt !== null && now !== null ? expiresAt - now : null;
  const urgent = remaining !== null && remaining > 0 && remaining < 24 * 3_600_000;

  return <article className={`feed-row feed-row--${status} ${urgent ? "is-urgent" : ""} reveal`}>
    <Link href={`/offres/${offer.id}`} className="feed-row-thumb" aria-label={offer.title}>
      <Image src={offer.image} alt="" fill sizes="56px" className="feed-row-thumb-image" />
      {offer.isNew && <span className="feed-row-live" aria-hidden="true" />}
    </Link>
    <div className="feed-row-main">
      <div className="feed-row-meta"><PlatformBadge store={offer.store} compact /><span className="meta-dot" /><span>{offer.category}</span></div>
      <h3><Link href={`/offres/${offer.id}`}>{offer.title}</Link></h3>
    </div>
    <div className="feed-row-price">
      {offer.originalPrice !== null && <s>{formatPrice(offer.originalPrice)}</s>}
      <strong>GRATUIT</strong>
    </div>
    <div className="feed-row-countdown"><ClockIcon className={`clock-icon ${urgent ? "is-urgent" : ""}`} />{remaining === null ? "—" : formatRemaining(remaining)}</div>
    <div className="feed-row-actions">
      <button type="button" className={`favorite-button ${favorite ? "is-favorite" : ""}`} onClick={onFavorite} aria-label={`${favorite ? "Retirer" : "Ajouter"} ${offer.title} ${favorite ? "des" : "aux"} favoris`} aria-pressed={favorite}>
        <HeartIcon fill={favorite ? "currentColor" : "none"} />
      </button>
      <button type="button" className="claim-button" onClick={() => { trackEvent("claim_click", { store: offer.store, offerId: offer.id }); onClaim(); }} disabled={status !== "active"}>{claimLabel[status]}</button>
    </div>
  </article>;
}
