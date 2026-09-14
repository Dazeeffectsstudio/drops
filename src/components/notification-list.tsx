"use client";

import Link from "next/link";
import { useTransition } from "react";
import { markAllNotificationsReadAction } from "@/app/notifications/actions";
import { getOfferStatus } from "@/lib/offers";
import type { MyNotificationSubscription } from "@/lib/notification-subscriptions-repository";

const DAY_MS = 24 * 60 * 60 * 1000;

function isEndingSoon(offer: MyNotificationSubscription["offer"]): boolean {
  if (!offer) return false;
  const remaining = new Date(offer.expiresAt).getTime() - Date.now();
  return remaining > 0 && remaining < DAY_MS;
}

function Row({ sub }: { sub: MyNotificationSubscription }) {
  const unread = Boolean(sub.notifiedAt && !sub.readAt);
  return <li className={`notification-row ${unread ? "notification-row--unread" : ""}`}>
    {unread && <span className="unread-dot" aria-hidden="true" />}
    {sub.offer ? <Link href={`/offres/${sub.offer.id}`}>{sub.offer.title}</Link> : <span>Offre supprimée</span>}
    <span className="notification-row-meta">{sub.offer?.store ?? "—"}</span>
  </li>;
}

export function NotificationList({ subscriptions }: { subscriptions: MyNotificationSubscription[] }) {
  const [pending, startTransition] = useTransition();

  const tracked = subscriptions.filter((sub) => !sub.notifiedAt);
  const newlyAvailable = subscriptions.filter((sub) => sub.notifiedAt && sub.offer && getOfferStatus(sub.offer, Date.now()) === "active");
  const endingSoon = subscriptions.filter((sub) => isEndingSoon(sub.offer));
  const history = subscriptions.filter((sub) => sub.notifiedAt);
  const hasUnread = subscriptions.some((sub) => sub.notifiedAt && !sub.readAt);

  return <div className="notification-center">
    {hasUnread && <button type="button" className="admin-test-button" disabled={pending} onClick={() => startTransition(() => { markAllNotificationsReadAction(); })}>
      {pending ? "…" : "TOUT MARQUER COMME LU"}
    </button>}

    <section className="notification-section">
      <h2>Offres suivies</h2>
      {tracked.length === 0 ? <p className="empty-note">Aucune offre en attente pour l&apos;instant.</p> : <ul className="notification-list">{tracked.map((sub) => <Row key={sub.id} sub={sub} />)}</ul>}
    </section>

    <section className="notification-section">
      <h2>Nouvelles offres disponibles</h2>
      {newlyAvailable.length === 0 ? <p className="empty-note">Rien de nouveau pour l&apos;instant.</p> : <ul className="notification-list">{newlyAvailable.map((sub) => <Row key={sub.id} sub={sub} />)}</ul>}
    </section>

    <section className="notification-section">
      <h2>Expirent bientôt</h2>
      {endingSoon.length === 0 ? <p className="empty-note">Rien n&apos;expire dans les prochaines 24h.</p> : <ul className="notification-list">{endingSoon.map((sub) => <Row key={sub.id} sub={sub} />)}</ul>}
    </section>

    <section className="notification-section">
      <h2>Historique</h2>
      {history.length === 0 ? <p className="empty-note">Aucune notification envoyée pour l&apos;instant.</p> : <ul className="notification-list">{history.map((sub) => <Row key={sub.id} sub={sub} />)}</ul>}
    </section>
  </div>;
}
