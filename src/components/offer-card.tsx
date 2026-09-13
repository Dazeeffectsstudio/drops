import Image from "next/image";
import Link from "next/link";
import type { Offer } from "@/types/offer";
import { expiryProgress, formatPrice, formatRemaining } from "@/lib/offers";
import { ArrowIcon, ClockIcon, HeartIcon } from "./icons";
import { PlatformBadge } from "./platform-badge";

type Props = {
  offer: Offer;
  expiresAt: number | null;
  now: number | null;
  favorite: boolean;
  onFavorite: () => void;
  onClaim: () => void;
};

export function OfferCard({ offer, expiresAt, now, favorite, onFavorite, onClaim }: Props) {
  const remaining = expiresAt !== null && now !== null ? expiresAt - now : null;
  const expired = remaining !== null && remaining <= 0;
  const progress = expiryProgress(remaining);
  const dateLabel = expiresAt !== null
    ? new Intl.DateTimeFormat("fr-BE", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }).format(expiresAt)
    : "Chargement…";

  return <article className={`offer-card offer-card--${offer.accent} reveal`}>
    <div className="offer-art">
      <Link href={`/offres/${offer.id}`} className="offer-art-link" aria-label={`Voir ${offer.title}`}><Image src={offer.image} alt={offer.imageAlt} fill sizes="(max-width: 700px) 100vw, (max-width: 1100px) 50vw, 33vw" className="offer-art-image" /></Link>
      <div className="offer-tags"><span className="art-tag">{offer.category}</span>{offer.isNew && <span className="new-tag">NOUVEAU</span>}</div>
      <button type="button" className={`favorite-button ${favorite ? "is-favorite" : ""}`} onClick={onFavorite} aria-label={`${favorite ? "Retirer" : "Ajouter"} ${offer.title} ${favorite ? "des" : "aux"} favoris`} aria-pressed={favorite}>
        <HeartIcon className="heart-icon" fill={favorite ? "currentColor" : "none"} />
      </button>
    </div>
    <div className="offer-body">
      <div className="offer-meta"><PlatformBadge store={offer.store} compact /><span className="meta-dot" /><span>{offer.platform}</span></div>
      <h3><Link href={`/offres/${offer.id}`}>{offer.title}</Link></h3>
      <p className="offer-kind">{offer.kind}</p>
      <div className="offer-divider" />
      <div className="offer-values">
        <div><span className="micro-label">PRIX</span><div className="price-line">{offer.originalPrice !== null && <span className="old-price">{formatPrice(offer.originalPrice)}</span>}<strong>{offer.currentPrice === 0 ? "GRATUIT" : formatPrice(offer.currentPrice)}</strong></div></div>
        <div className="expires"><span className="micro-label">EXPIRE LE</span><span className="expiry-date">{dateLabel}</span></div>
      </div>
      <div className="offer-actions">
        <div className="countdown"><ClockIcon className="clock-icon" /><span><small>Expire dans</small><strong>{remaining === null ? "—" : formatRemaining(remaining)}</strong></span></div>
        <button type="button" className="claim-button" onClick={onClaim} disabled={expired}>{expired ? "EXPIRÉE" : "RÉCUPÉRER"}<ArrowIcon className="arrow-icon" /></button>
      </div>
      <div className="expiry-progress" aria-label={`Il reste ${Math.round(progress)} % du temps de l’offre`}><span style={{ width: `${progress}%` }} /></div>
    </div>
  </article>;
}
