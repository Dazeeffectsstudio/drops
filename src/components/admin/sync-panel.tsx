"use client";

import { useState, useTransition } from "react";
import { runSyncAction } from "@/app/admin/actions";
import type { SyncLogEntry } from "@/lib/sync-logs-repository";

type ProviderStatus = {
  key: string;
  offersFound: number;
  offersCreated: number;
  offersUpdated: number;
  offersExpired: number;
  status: "success" | "error";
  message: string | null;
  createdAt: string;
};

function latestPerProvider(logs: SyncLogEntry[]): ProviderStatus[] {
  const seen = new Map<string, ProviderStatus>();
  for (const log of logs) {
    if (seen.has(log.provider)) continue;
    seen.set(log.provider, {
      key: log.provider,
      offersFound: log.offersFound,
      offersCreated: log.offersCreated,
      offersUpdated: log.offersUpdated,
      offersExpired: log.offersExpired,
      status: log.status,
      message: log.message,
      createdAt: log.createdAt,
    });
  }
  return Array.from(seen.values());
}

export function SyncPanel({ recentLogs }: { recentLogs: SyncLogEntry[] }) {
  const [pending, startTransition] = useTransition();
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const latest = latestPerProvider(recentLogs);
  const lastSyncAt = latest.reduce<string | null>((max, entry) => (!max || entry.createdAt > max ? entry.createdAt : max), null);
  const totals = latest.reduce(
    (acc, entry) => ({
      found: acc.found + entry.offersFound,
      created: acc.created + entry.offersCreated,
      updated: acc.updated + entry.offersUpdated,
      expired: acc.expired + entry.offersExpired,
    }),
    { found: 0, created: 0, updated: 0, expired: 0 },
  );
  const errors = latest.filter((entry) => entry.status === "error");

  function handleSync() {
    startTransition(async () => {
      const result = await runSyncAction();
      if (result.error) {
        setToast({ type: "error", message: result.error });
      } else if (result.summary) {
        const failed = result.summary.providers.filter((p) => p.status === "error");
        setToast({
          type: failed.length > 0 ? "error" : "success",
          message: failed.length > 0
            ? `Synchronisation terminée avec ${failed.length} erreur(s) : ${failed.map((p) => p.label).join(", ")}.`
            : `Synchronisation réussie : ${result.summary.offersFound} offres trouvées, ${result.summary.offersCreated} créées, ${result.summary.offersUpdated} mises à jour, ${result.summary.offersExpired} expirées.`,
        });
      }
      window.setTimeout(() => setToast(null), 7000);
    });
  }

  return <section className="admin-sync">
    <div className="admin-sync-heading">
      <div>
        <span className="section-index">SYNCHRONISATION</span>
        <h2>Offres <em>automatiques</em></h2>
        <p className="admin-sync-sub">
          {lastSyncAt
            ? `Dernière synchronisation : ${new Intl.DateTimeFormat("fr-BE", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }).format(new Date(lastSyncAt))}`
            : "Aucune synchronisation effectuée pour l'instant."}
        </p>
      </div>
      <button type="button" className="claim-button" onClick={handleSync} disabled={pending}>
        {pending ? "SYNCHRONISATION…" : "SYNCHRONISER MAINTENANT"}
      </button>
    </div>

    <div className="admin-sync-stats">
      <div><span className="micro-label">RÉCUPÉRÉES</span><strong>{totals.found}</strong></div>
      <div><span className="micro-label">NOUVELLES</span><strong>{totals.created}</strong></div>
      <div><span className="micro-label">MISES À JOUR</span><strong>{totals.updated}</strong></div>
      <div><span className="micro-label">EXPIRÉES</span><strong>{totals.expired}</strong></div>
    </div>

    {errors.length > 0 && <div className="admin-sync-errors">
      {errors.map((entry) => <p key={entry.key}><b>{entry.key}</b> : {entry.message ?? "erreur inconnue"}</p>)}
    </div>}

    {latest.length > 0 && <div className="admin-sync-providers">
      {latest.map((entry) => <span key={entry.key} className={`admin-sync-chip ${entry.status === "error" ? "admin-sync-chip--error" : ""}`}>
        {entry.key} · {entry.offersFound}
      </span>)}
    </div>}

    {toast && <div className={`notice admin-sync-toast ${toast.type === "error" ? "admin-sync-toast--error" : ""}`} role="status">
      <p>{toast.message}</p>
      <button type="button" onClick={() => setToast(null)} aria-label="Fermer le message">×</button>
    </div>}
  </section>;
}
