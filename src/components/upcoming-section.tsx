"use client";

import { useState } from "react";
import type { Offer } from "@/types/offer";
import { formatRemaining, offerStartsAt } from "@/lib/offers";
import { ClockIcon } from "./icons";
import { PlatformBadge } from "./platform-badge";
import { Reveal } from "./reveal";

function UpcomingCard({ offer, now }: { offer: Offer; now: number | null }) {
  const [notified, setNotified] = useState(false);
  const startsAt = offerStartsAt(offer);
  const remaining = startsAt !== null && now !== null ? startsAt - now : null;
  const dateLabel = startsAt !== null
    ? new Intl.DateTimeFormat("fr-BE", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }).format(startsAt)
    : "Bientôt";

  return <article className="upcoming-card reveal">
    <div className="offer-meta"><PlatformBadge store={offer.store} /><span className="meta-dot" /><span>{offer.category}</span></div>
    <h3>{offer.title}</h3>
    <p className="offer-kind">{offer.kind}</p>
    <div className="upcoming-info">
      <div><span className="micro-label">DÉBUTE LE</span><span className="expiry-date">{dateLabel}</span></div>
      <div className="countdown"><ClockIcon className="clock-icon" /><span><small>Dans</small><strong>{remaining === null ? "—" : formatRemaining(remaining)}</strong></span></div>
    </div>
    <button type="button" className={`notify-button ${notified ? "is-notified" : ""}`} onClick={() => setNotified(true)} disabled={notified}>
      {notified ? "TU SERAS PRÉVENU ✓" : "ME PRÉVENIR"}
    </button>
  </article>;
}

export function UpcomingSection({ offers, now }: { offers: Offer[]; now: number | null }) {
  if (offers.length === 0) return null;
  return <Reveal>
    <section id="bientot" className="upcoming-section" aria-labelledby="upcoming-title">
      <div className="section-heading">
        <div><span className="section-index">05 / À SURVEILLER</span><h2 id="upcoming-title">⏳ BIENTÔT <em>GRATUITS</em></h2></div>
        <p>Prépare-toi, ces offres<br />arrivent bientôt.</p>
      </div>
      <div className="upcoming-grid">
        {offers.map((offer) => <UpcomingCard key={offer.id} offer={offer} now={now} />)}
      </div>
    </section>
  </Reveal>;
}
