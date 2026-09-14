import type { Metadata } from "next";
import { getCommunityStats } from "@/lib/community-stats-repository";
import { getGrowthStats } from "@/lib/growth-stats-repository";
import { getNotificationLogStats } from "@/lib/notification-logs-repository";
import { isAnalyticsConfigured } from "@/lib/analytics/config";

export const metadata: Metadata = { title: "Croissance" };
export const dynamic = "force-dynamic";

export default async function AdminGrowthPage() {
  const [growth, notifStats, community] = await Promise.all([getGrowthStats(), getNotificationLogStats(), getCommunityStats()]);
  const maxDay = Math.max(1, ...growth.signupsByDay);
  const dayLabels = ["J-6", "J-5", "J-4", "J-3", "J-2", "Hier", "Aujourd'hui"];

  return <div className="admin-page">
    <div className="admin-page-heading">
      <div><span className="section-index">CROISSANCE</span><h1>Acquisition &amp; <em>engagement</em></h1></div>
    </div>

    <div className="provider-cards-grid">
      <div className="provider-card"><span className="micro-label">NOUVELLES INSCRIPTIONS (7J)</span><strong className="admin-stat-value">{growth.newSignups7d}</strong></div>
      <div className="provider-card"><span className="micro-label">UTILISATEURS ACTIFS (7J)</span><strong className="admin-stat-value">{growth.activeUsers7d}</strong></div>
      <div className="provider-card"><span className="micro-label">TAUX DE SUCCÈS NOTIFICATIONS</span><strong className="admin-stat-value">{notifStats.successRate}%</strong></div>
      <div className="provider-card"><span className="micro-label">EMAILS ENVOYÉS AUJOURD&apos;HUI</span><strong className="admin-stat-value">{notifStats.emailsSentToday}</strong></div>
    </div>

    <div className="admin-subheading"><h2>Inscriptions — 7 derniers jours</h2></div>
    <div className="monitoring-chart">
      {growth.signupsByDay.map((count, i) => <div key={i} className="monitoring-bar-wrap" title={`${dayLabels[i]} : ${count}`}>
        <div className="monitoring-bar" style={{ height: `${(count / maxDay) * 100}%` }} />
      </div>)}
    </div>
    <p className="empty-note">{dayLabels.join(" · ")}</p>

    <div className="admin-subheading"><h2>Plateformes les plus populaires (favoris)</h2></div>
    {community.popularPlatforms.length === 0 ? <p className="empty-note">Pas encore assez de données.</p> : <ul className="notification-list">
      {community.popularPlatforms.map((entry) => <li key={entry.label} className="notification-row"><span>{entry.label}</span><span className="notification-row-meta">{entry.value} favoris</span></li>)}
    </ul>}

    <p className="admin-notice" style={{ marginTop: 32 }}>
      <strong>Non disponible ici :</strong> le taux d&apos;ouverture des emails et les clics sur les notifications/boutons &quot;Récupérer&quot; ne sont pas stockés dans cette base (ça demanderait des pixels de suivi ou un service dédié). {isAnalyticsConfigured ? "Consulte Google Analytics / Plausible pour ces chiffres." : "Configure Google Analytics ou Plausible (voir /admin/seo) pour suivre ces clics."}
    </p>
  </div>;
}
