"use client";

import Link from "next/link";
import { useMemo, useState, useTransition } from "react";
import { markAllNotificationLogsReadAction, markNotificationLogReadAction } from "@/app/notifications/actions";
import type { MyNotificationLogEntry, NotificationType } from "@/lib/notification-logs-repository";

const typeMeta: Record<NotificationType, { label: string; icon: string }> = {
  new_offer: { label: "Nouvelle offre", icon: "🎮" },
  offer_started: { label: "Offre disponible", icon: "⏳" },
  offer_ending_soon_24h: { label: "Expire dans 24h", icon: "⚠️" },
  offer_ending_soon_2h: { label: "Expire dans 2h", icon: "⚠️" },
  test: { label: "Test", icon: "🔔" },
};

const filters: Array<{ key: NotificationType | "ALL"; label: string }> = [
  { key: "ALL", label: "Tout" },
  { key: "new_offer", label: "Nouvelles offres" },
  { key: "offer_started", label: "Offres disponibles" },
  { key: "offer_ending_soon_24h", label: "Expire dans 24h" },
  { key: "offer_ending_soon_2h", label: "Expire dans 2h" },
];

export function NotificationFeed({ logs }: { logs: MyNotificationLogEntry[] }) {
  const [filter, setFilter] = useState<NotificationType | "ALL">("ALL");
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [pendingAll, startTransition] = useTransition();

  const visible = useMemo(() => (filter === "ALL" ? logs : logs.filter((log) => log.type === filter)), [logs, filter]);
  const hasUnread = logs.some((log) => !log.readAt);

  function markOneRead(id: string) {
    setPendingId(id);
    startTransition(async () => {
      await markNotificationLogReadAction(id);
      setPendingId(null);
    });
  }

  return <div className="notification-feed">
    <div className="admin-sync-filters">
      {filters.map((entry) => <button key={entry.key} type="button" className={filter === entry.key ? "selected" : ""} onClick={() => setFilter(entry.key)}>{entry.label}</button>)}
      {hasUnread && <button type="button" className="admin-test-button" disabled={pendingAll} onClick={() => startTransition(() => { markAllNotificationLogsReadAction(); })}>
        {pendingAll ? "…" : "TOUT MARQUER COMME LU"}
      </button>}
    </div>

    {visible.length === 0 ? <p className="empty-note">Rien ici pour l&apos;instant.</p> : <ul className="notification-list">
      {visible.map((log) => {
        const meta = typeMeta[log.type];
        const unread = !log.readAt;
        return <li key={log.id} className={`notification-row ${unread ? "notification-row--unread" : ""}`}>
          <span className="notification-type-icon" aria-hidden="true">{meta.icon}</span>
          <span className="notification-row-body">
            <span className="notification-row-title">
              {log.offer ? <Link href={`/offres/${log.offer.id}`}>{log.offer.title}</Link> : <span>Offre supprimée</span>}
            </span>
            <span className="notification-row-meta">{meta.label} · {new Intl.DateTimeFormat("fr-BE", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }).format(new Date(log.sentAt))}</span>
          </span>
          {unread && <button type="button" className="admin-test-button notification-row-action" disabled={pendingId === log.id} onClick={() => markOneRead(log.id)}>
            {pendingId === log.id ? "…" : "MARQUER LU"}
          </button>}
        </li>;
      })}
    </ul>}
  </div>;
}
