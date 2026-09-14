import type { SyncLogEntry } from "@/lib/sync-logs-repository";

export function SyncHistoryTable({ logs }: { logs: SyncLogEntry[] }) {
  if (logs.length === 0) {
    return <div className="empty-state">
      <span>∅</span>
      <h3>Aucune synchronisation pour l&apos;instant.</h3>
      <p>Lance-en une depuis le tableau de bord principal.</p>
    </div>;
  }

  return <div className="admin-table-wrap">
    <table className="admin-table">
      <thead>
        <tr><th>Date</th><th>Plateforme</th><th>Statut</th><th>Trouvées</th><th>Créées</th><th>MàJ</th><th>Expirées</th><th>Ignorées</th><th>Durée</th><th>Détails</th></tr>
      </thead>
      <tbody>
        {logs.map((log) => <tr key={log.id}>
          <td>{new Intl.DateTimeFormat("fr-BE", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }).format(new Date(log.createdAt))}</td>
          <td>{log.provider}</td>
          <td><span className={`admin-status admin-status--${log.status === "error" ? "orange" : "lime"}`}>{log.status === "error" ? "Erreur" : "Succès"}</span></td>
          <td>{log.offersFound}</td>
          <td>{log.offersCreated}</td>
          <td>{log.offersUpdated}</td>
          <td>{log.offersExpired}</td>
          <td>{log.offersSkipped}</td>
          <td>{log.durationMs !== null ? `${log.durationMs} ms` : "—"}</td>
          <td className="admin-table-message">{log.message ?? "—"}</td>
        </tr>)}
      </tbody>
    </table>
  </div>;
}
