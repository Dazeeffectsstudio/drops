import { getNotificationLogStats } from "@/lib/notification-logs-repository";
import { getRecentSyncLogs } from "@/lib/sync-logs-repository";
import { supabaseAdmin } from "@/lib/supabase/admin-client";

export const dynamic = "force-dynamic";

const DAY_MS = 24 * 60 * 60 * 1000;
const HOUR_MS = 60 * 60 * 1000;

async function getConnectedUsersLast24h(): Promise<number> {
  if (!supabaseAdmin) return 0;
  const { data } = await supabaseAdmin.auth.admin.listUsers({ perPage: 1000 });
  const now = Date.now();
  return (data?.users ?? []).filter((u) => u.last_sign_in_at && now - new Date(u.last_sign_in_at).getTime() < DAY_MS).length;
}

export default async function AdminMonitoringPage() {
  const [allLogs, notifStats, connectedUsers] = await Promise.all([
    getRecentSyncLogs(500),
    getNotificationLogStats(),
    getConnectedUsersLast24h(),
  ]);

  const since = Date.now() - DAY_MS;
  const last24h = allLogs.filter((log) => new Date(log.createdAt).getTime() >= since);
  const errors = last24h.filter((log) => log.status === "error");
  const durations = last24h.filter((log) => log.durationMs !== null).map((log) => log.durationMs as number);
  const avgDuration = durations.length > 0 ? Math.round(durations.reduce((sum, d) => sum + d, 0) / durations.length) : 0;
  const totalOffersFound = last24h.reduce((sum, log) => sum + log.offersFound, 0);

  // Répartition par heure (les 24 dernières), pour un histogramme simple en CSS.
  const now = Date.now();
  const buckets = Array.from({ length: 24 }, (_, i) => {
    const bucketStart = now - (23 - i) * HOUR_MS;
    const bucketEnd = bucketStart + HOUR_MS;
    const count = last24h.filter((log) => {
      const t = new Date(log.createdAt).getTime();
      return t >= bucketStart && t < bucketEnd;
    }).length;
    return count;
  });
  const maxBucket = Math.max(1, ...buckets);

  return <div className="admin-page">
    <div className="admin-page-heading">
      <div><span className="section-index">TABLEAU DE BORD</span><h1>Monitoring <em>(24h)</em></h1></div>
    </div>

    <div className="provider-cards-grid">
      <div className="provider-card"><span className="micro-label">SYNCHRONISATIONS</span><strong className="admin-stat-value">{last24h.length}</strong></div>
      <div className="provider-card"><span className="micro-label">ERREURS</span><strong className="admin-stat-value">{errors.length}</strong></div>
      <div className="provider-card"><span className="micro-label">DURÉE MOYENNE</span><strong className="admin-stat-value">{avgDuration} ms</strong></div>
      <div className="provider-card"><span className="micro-label">OFFRES RÉCUPÉRÉES</span><strong className="admin-stat-value">{totalOffersFound}</strong></div>
      <div className="provider-card"><span className="micro-label">UTILISATEURS CONNECTÉS</span><strong className="admin-stat-value">{connectedUsers}</strong></div>
      <div className="provider-card"><span className="micro-label">EMAILS ENVOYÉS</span><strong className="admin-stat-value">{notifStats.emailsSentToday}</strong></div>
      <div className="provider-card"><span className="micro-label">PUSH ENVOYÉS</span><strong className="admin-stat-value">{notifStats.pushSentToday}</strong></div>
      <div className="provider-card"><span className="micro-label">TAUX DE SUCCÈS NOTIFS</span><strong className="admin-stat-value">{notifStats.successRate}%</strong></div>
    </div>

    <div className="admin-subheading"><h2>Synchronisations par heure</h2></div>
    <div className="monitoring-chart">
      {buckets.map((count, i) => <div key={i} className="monitoring-bar-wrap" title={`${count} synchro(s)`}>
        <div className="monitoring-bar" style={{ height: `${(count / maxBucket) * 100}%` }} />
      </div>)}
    </div>
    <p className="empty-note">Les 24 dernières heures, une barre par heure (la plus récente à droite).</p>

    {errors.length > 0 && <>
      <div className="admin-subheading"><h2>Erreurs récentes</h2></div>
      <div className="admin-sync-errors">
        {errors.slice(0, 10).map((log) => <p key={log.id}><b>{log.provider}</b> : {log.message ?? "erreur inconnue"}</p>)}
      </div>
    </>}
  </div>;
}
