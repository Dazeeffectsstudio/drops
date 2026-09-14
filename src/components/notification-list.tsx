import Link from "next/link";
import type { MyNotificationSubscription } from "@/lib/notification-subscriptions-repository";

// Affiche uniquement les offres suivies ("Me prévenir") pas encore
// démarrées — le reste (nouvelles offres, offres disponibles, offres qui
// expirent bientôt, historique) vit désormais dans le fil d'activité
// (src/components/notification-feed.tsx), alimenté par notification_logs.
export function NotificationList({ subscriptions }: { subscriptions: MyNotificationSubscription[] }) {
  const tracked = subscriptions.filter((sub) => !sub.notifiedAt);

  if (tracked.length === 0) return <p className="empty-note">Aucune offre en attente pour l&apos;instant. Clique sur « Me prévenir » sur une offre à venir pour la suivre.</p>;

  return <ul className="notification-list">
    {tracked.map((sub) => <li key={sub.id} className="notification-row">
      {sub.offer ? <Link href={`/offres/${sub.offer.id}`}>{sub.offer.title}</Link> : <span>Offre supprimée</span>}
      <span className="notification-row-meta">{sub.offer?.store ?? "—"}</span>
    </li>)}
  </ul>;
}
