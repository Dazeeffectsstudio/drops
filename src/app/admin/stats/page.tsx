import type { Metadata } from "next";
import { getAdminStats } from "@/lib/admin-stats-repository";
import { formatPrice } from "@/lib/offers";

export const metadata: Metadata = { title: "Statistiques" };
export const dynamic = "force-dynamic";

function Chart({ values, labels }: { values: number[]; labels: string }) {
  const max = Math.max(1, ...values);
  return <>
    <div className="monitoring-chart">
      {values.map((v, i) => <div key={i} className="monitoring-bar-wrap" title={String(v)}><div className="monitoring-bar" style={{ height: `${(v / max) * 100}%` }} /></div>)}
    </div>
    <p className="empty-note">{labels}</p>
  </>;
}

export default async function AdminStatsPage() {
  const stats = await getAdminStats();

  return <div className="admin-page">
    <div className="admin-page-heading">
      <div><span className="section-index">TABLEAU DE BORD</span><h1>Les <em>statistiques</em></h1></div>
    </div>

    <div className="provider-cards-grid">
      <div className="provider-card"><span className="micro-label">OFFRES ACTIVES</span><strong className="admin-stat-value">{stats.activeOffersCount}</strong></div>
      <div className="provider-card"><span className="micro-label">VALEUR TOTALE DES OFFRES</span><strong className="admin-stat-value">{formatPrice(stats.totalOffersValue)}</strong></div>
      <div className="provider-card"><span className="micro-label">PLATEFORME LA PLUS POPULAIRE</span><strong className="admin-stat-value" style={{ fontSize: 18 }}>{stats.mostPopularPlatform ?? "—"}</strong></div>
      <div className="provider-card"><span className="micro-label">UTILISATEURS AVEC DES FAVORIS</span><strong className="admin-stat-value">{stats.usersWithFavoritesCount}</strong></div>
      <div className="provider-card"><span className="micro-label">FAVORIS AU TOTAL</span><strong className="admin-stat-value">{stats.totalFavoritesCount}</strong></div>
      <div className="provider-card"><span className="micro-label">NOTIFICATIONS ACTIVES</span><strong className="admin-stat-value">{stats.activeNotificationsCount}</strong></div>
    </div>

    <p className="empty-note" style={{ marginTop: 12 }}>
      &quot;Utilisateurs avec des favoris&quot; est le seul signal de récupération réellement stocké en base (aucun clic sur &quot;RÉCUPÉRER&quot; n&apos;est journalisé côté serveur — voir /admin/growth pour le suivi via Analytics).
    </p>

    <div className="admin-subheading"><h2>Favoris ajoutés — 7 derniers jours</h2></div>
    <Chart values={stats.favoritesByDay7} labels="J-6 · J-5 · J-4 · J-3 · J-2 · Hier · Aujourd'hui" />

    <div className="admin-subheading"><h2>Favoris ajoutés — 30 derniers jours</h2></div>
    <Chart values={stats.favoritesByDay30} labels="Il y a 30 jours → aujourd'hui" />
  </div>;
}
