import type { SavingsStats } from "@/lib/account-stats-repository";
import { formatPrice } from "@/lib/offers";

// Server Component — les données arrivent déjà calculées/formatées depuis
// account-stats-repository.ts, aucun state client nécessaire ici.
export function SavingsCard({ stats }: { stats: SavingsStats }) {
  const maxMonth = Math.max(1, ...stats.monthly.map((m) => m.value));

  return <div className="savings-card">
    <div className="provider-cards-grid">
      <div className="provider-card"><span className="micro-label">VALEUR TOTALE ÉCONOMISÉE</span><strong className="admin-stat-value">{formatPrice(stats.totalValue)}</strong></div>
      <div className="provider-card"><span className="micro-label">JEUX RÉCUPÉRÉS</span><strong className="admin-stat-value">{stats.gamesCount}</strong></div>
      <div className="provider-card"><span className="micro-label">DLC RÉCUPÉRÉS</span><strong className="admin-stat-value">{stats.dlcCount}</strong></div>
      <div className="provider-card"><span className="micro-label">TWITCH DROPS</span><strong className="admin-stat-value">{stats.twitchDropsCount}</strong></div>
    </div>
    {stats.monthly.some((m) => m.value > 0) && <>
      <p className="micro-label" style={{ marginTop: 20, marginBottom: 8 }}>ÉCONOMIES PAR MOIS</p>
      <div className="monitoring-chart">
        {stats.monthly.map((m, i) => <div key={i} className="monitoring-bar-wrap" title={`${m.label} : ${formatPrice(m.value)}`}>
          <div className="monitoring-bar" style={{ height: `${(m.value / maxMonth) * 100}%` }} />
        </div>)}
      </div>
      <p className="empty-note">{stats.monthly.map((m) => m.label).join(" · ")}</p>
    </>}
  </div>;
}
