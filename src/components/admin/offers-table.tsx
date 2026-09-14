"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getOfferStatus, offerExpiresAt } from "@/lib/offers";
import type { OfferWithTimestamps } from "@/lib/offers-repository";
import { DeleteOfferButton } from "./delete-offer-button";

type StatusTone = "lime" | "orange" | "gray" | "blue";

function adminStatus(offer: OfferWithTimestamps, now: number, lastSyncAt: number | null): { label: string; tone: StatusTone } {
  // Une offre créée ou modifiée par la dernière synchronisation le reste
  // tant qu'une nouvelle synchronisation ne l'a pas dépassée.
  if (lastSyncAt !== null) {
    const createdMs = new Date(offer.createdAt).getTime();
    const updatedMs = new Date(offer.updatedAt).getTime();
    if (createdMs >= lastSyncAt) return { label: "Nouvelle offre", tone: "lime" };
    if (updatedMs >= lastSyncAt && updatedMs !== createdMs) return { label: "Mise à jour", tone: "blue" };
  }
  const status = getOfferStatus(offer, now);
  if (status === "upcoming") return { label: "Bientôt disponible", tone: "blue" };
  if (status === "expired") return { label: "Expirée", tone: "gray" };
  if (offer.isNew) return { label: "Nouveau", tone: "lime" };
  const remaining = offerExpiresAt(offer) - now;
  if (remaining < 3 * 24 * 3_600_000) return { label: "Expire bientôt", tone: "orange" };
  return { label: "Gratuit", tone: "lime" };
}

export function OffersTable({ offers, lastSyncAt }: { offers: OfferWithTimestamps[]; lastSyncAt: string | null }) {
  const [now, setNow] = useState<number | null>(null);
  useEffect(() => { setNow(Date.now()); }, []);
  const lastSyncMs = lastSyncAt ? new Date(lastSyncAt).getTime() : null;

  if (offers.length === 0) {
    return <div className="empty-state">
      <span>∅</span>
      <h3>Aucune offre pour l&apos;instant.</h3>
      <p>Ajoute ta première offre pour commencer, ou vérifie ta connexion Supabase.</p>
      <Link href="/admin/new" className="empty-link">AJOUTER UNE OFFRE</Link>
    </div>;
  }

  return <div className="admin-table-wrap">
    <table className="admin-table">
      <thead>
        <tr><th>Image</th><th>Titre</th><th>Plateforme</th><th>Catégorie</th><th>Expire le</th><th>Statut</th><th>Actions</th></tr>
      </thead>
      <tbody>
        {offers.map((offer) => {
          const status = now !== null ? adminStatus(offer, now, lastSyncMs) : null;
          return <tr key={offer.id}>
            {/* eslint-disable-next-line @next/next/no-img-element -- les admins peuvent coller n'importe quelle URL externe, non listée dans next.config */}
            <td><div className="admin-table-thumb"><img src={offer.image} alt={offer.imageAlt} /></div></td>
            <td>{offer.title}</td>
            <td>{offer.store}</td>
            <td>{offer.category}</td>
            <td>{new Intl.DateTimeFormat("fr-BE", { day: "numeric", month: "short", year: "numeric" }).format(new Date(offer.expiresAt))}</td>
            <td>{status && <span className={`admin-status admin-status--${status.tone}`}>{status.label}</span>}</td>
            <td className="admin-table-actions">
              <Link href={`/admin/${offer.id}/edit`}>Modifier</Link>
              <DeleteOfferButton id={offer.id} title={offer.title} />
            </td>
          </tr>;
        })}
      </tbody>
    </table>
  </div>;
}
