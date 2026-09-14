import type { Metadata } from "next";
import Link from "next/link";
import { getCommunityStats } from "@/lib/community-stats-repository";
import { getGrowthStats } from "@/lib/growth-stats-repository";
import { getNotificationLogStats } from "@/lib/notification-logs-repository";
import { isAnalyticsConfigured } from "@/lib/analytics/config";

const ACQUISITION_EVENTS = [
  { name: "referral_click", label: "Clic sur un lien d'invitation (?ref=...)" },
  { name: "signup_via_referral", label: "Inscription convertie depuis un lien d'invitation" },
  { name: "pwa_install", label: "Installation de la PWA" },
  { name: "share", label: "Partage d'une offre (WhatsApp, X, Discord...)" },
  { name: "claim_click", label: "Clic sur « RÉCUPÉRER »" },
];

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

    <div className="admin-subheading"><h2>Acquisition</h2></div>
    <p className="empty-note">
      Chiffres de parrainage réels (base de données) : <Link href="/admin/referrals">voir /admin/referrals</Link>.
    </p>
    <ul className="notification-list">
      {ACQUISITION_EVENTS.map((event) => <li key={event.name} className="notification-row"><span>{event.label}</span><span className="notification-row-meta">{event.name}</span></li>)}
    </ul>
    <p className="admin-notice" style={{ marginTop: 12 }}>
      Ces événements sont envoyés à Google Analytics / Plausible (jamais stockés dans cette base — voir <Link href="/admin/seo">/admin/seo</Link>) : {isAnalyticsConfigured ? "consulte ton tableau de bord GA4/Plausible pour les volumes et taux de conversion." : "configure Google Analytics ou Plausible pour commencer à les recevoir."}
    </p>

    <p className="admin-notice" style={{ marginTop: 16 }}>
      <strong>Non disponible ici :</strong> le taux d&apos;ouverture des emails et les clics sur les notifications/boutons &quot;Récupérer&quot; ne sont pas stockés dans cette base (ça demanderait des pixels de suivi ou un service dédié). {isAnalyticsConfigured ? "Consulte Google Analytics / Plausible pour ces chiffres." : "Configure Google Analytics ou Plausible (voir /admin/seo) pour suivre ces clics."}
    </p>
  </div>;
}
