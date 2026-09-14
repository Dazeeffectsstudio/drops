"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import type { Offer } from "@/types/offer";
import { subscribeToOfferAction } from "@/app/notifications/actions";
import { trackEvent } from "@/lib/analytics/track";
import { formatRemaining, offerStartsAt } from "@/lib/offers";
import { ClockIcon } from "./icons";
import { PlatformBadge } from "./platform-badge";
import { Reveal } from "./reveal";

function UpcomingCard({ offer, now, userId, subscribed, onNotified }: { offer: Offer; now: number | null; userId: string | null; subscribed: boolean; onNotified: (message: string) => void }) {
  const [pending, startTransition] = useTransition();
  const [justSubscribed, setJustSubscribed] = useState(false);
  const isSubscribed = subscribed || justSubscribed;
  const startsAt = offerStartsAt(offer);
  const remaining = startsAt !== null && now !== null ? startsAt - now : null;
  // Placeholder identique serveur/client tant que le composant n'est pas
  // monté (`now === null`) — voir la note dans offer-card.tsx sur le fuseau
  // horaire serveur (UTC) vs navigateur.
  const dateLabel = startsAt !== null && now !== null
    ? new Intl.DateTimeFormat("fr-BE", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }).format(startsAt)
    : "Bientôt";

  function handleNotify() {
    if (!userId || isSubscribed) return;
    startTransition(async () => {
      const result = await subscribeToOfferAction(offer.id);
      if (!result.error) {
        setJustSubscribed(true);
        trackEvent("notification_subscribe", { offerId: offer.id, store: offer.store });
        onNotified(`Tu seras prévenu·e par email quand « ${offer.title} » sera disponible.`);
      }
    });
  }

  return <article className="upcoming-card reveal">
    <div className="offer-meta"><PlatformBadge store={offer.store} /><span className="meta-dot" /><span>{offer.category}</span></div>
    <h3>{offer.title}</h3>
    <p className="offer-kind">{offer.kind}</p>
    <div className="upcoming-info">
      <div><span className="micro-label">DÉBUTE LE</span><span className="expiry-date">{dateLabel}</span></div>
      <div className="countdown"><ClockIcon className="clock-icon" /><span><small>Dans</small><strong>{remaining === null ? "—" : formatRemaining(remaining)}</strong></span></div>
    </div>
    {!userId
      ? <Link href="/login?next=/" className="notify-button">SE CONNECTER POUR ÊTRE PRÉVENU</Link>
      : <button type="button" className={`notify-button ${isSubscribed ? "is-notified" : ""}`} onClick={handleNotify} disabled={isSubscribed || pending}>
          {isSubscribed ? "TU SERAS PRÉVENU ✓" : pending ? "…" : "ME PRÉVENIR"}
        </button>}
  </article>;
}

type Props = { offers: Offer[]; now: number | null; userId: string | null; subscribedOfferIds: string[]; onNotified: (message: string) => void };

export function UpcomingSection({ offers, now, userId, subscribedOfferIds, onNotified }: Props) {
  if (offers.length === 0) return null;
  return <Reveal>
    <section id="bientot" className="upcoming-section" aria-labelledby="upcoming-title">
      <div className="section-heading">
        <div><span className="section-index">05 / À SURVEILLER</span><h2 id="upcoming-title">⏳ BIENTÔT <em>GRATUITS</em></h2></div>
        <p>Prépare-toi, ces offres<br />arrivent bientôt.</p>
      </div>
      <div className="upcoming-grid">
        {offers.map((offer) => <UpcomingCard key={offer.id} offer={offer} now={now} userId={userId} subscribed={subscribedOfferIds.includes(offer.id)} onNotified={onNotified} />)}
      </div>
    </section>
  </Reveal>;
}
