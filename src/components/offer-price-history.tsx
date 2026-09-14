"use client";

import { useEffect, useState } from "react";
import type { PriceHistoryEntry } from "@/lib/price-history-repository";
import { formatPrice } from "@/lib/offers";
import type { Offer } from "@/types/offer";

// "use client" (et non un Server Component séparé) car ce composant est
// rendu depuis offer-detail.tsx, lui-même client — voir la note sur le
// fuseau horaire serveur/navigateur dans drops-home.tsx : `mounted` évite
// tout hydration mismatch en n'affichant les dates formatées qu'après le
// montage, identique des deux côtés avant ça.
function useMounted(): boolean {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return mounted;
}

function dateLabel(iso: string): string {
  return new Intl.DateTimeFormat("fr-BE", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }).format(new Date(iso));
}

export function OfferPriceHistory({ offer, history }: { offer: Offer; history: PriceHistoryEntry[] }) {
  const mounted = useMounted();
  const fmt = (iso: string) => (mounted ? dateLabel(iso) : "…");

  return <section className="price-history">
    <div className="admin-subheading"><h2>Historique de l&apos;offre</h2></div>
    <div className="price-history-summary">
      <div><span className="micro-label">DÉBUT DE LA GRATUITÉ</span><strong>{offer.startsAt ? fmt(offer.startsAt) : "—"}</strong></div>
      <div><span className="micro-label">EXPIRATION</span><strong>{fmt(offer.expiresAt)}</strong></div>
      <div><span className="micro-label">ANCIEN PRIX</span><strong>{offer.originalPrice === null ? "—" : formatPrice(offer.originalPrice)}</strong></div>
      <div><span className="micro-label">PRIX ACTUEL</span><strong>{offer.currentPrice === 0 ? "GRATUIT" : formatPrice(offer.currentPrice)}</strong></div>
    </div>
    {history.length === 0 ? <p className="empty-note">Aucun changement de prix enregistré pour cette offre.</p> : <ul className="price-history-timeline">
      {history.map((entry) => <li key={entry.id}>
        <span className="price-history-dot" aria-hidden="true" />
        <div>
          <strong>{entry.currentPrice === 0 ? "GRATUIT" : formatPrice(entry.currentPrice)}</strong>
          {entry.originalPrice !== null && <span className="price-history-old"> (au lieu de {formatPrice(entry.originalPrice)})</span>}
          <span className="price-history-date">{fmt(entry.capturedAt)}</span>
        </div>
      </li>)}
    </ul>}
    <p className="empty-note" style={{ marginTop: 8 }}>Dernière mise à jour : {fmt(history.at(-1)?.capturedAt ?? offer.expiresAt)}.</p>
  </section>;
}
