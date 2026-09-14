import type { Metadata } from "next";
import Link from "next/link";
import { getAdminReferralStats } from "@/lib/admin-referrals-repository";

export const metadata: Metadata = { title: "Parrainage" };
export const dynamic = "force-dynamic";

const PERIODS: Array<{ key: string; label: string; days: number | null }> = [
  { key: "7", label: "7 jours", days: 7 },
  { key: "30", label: "30 jours", days: 30 },
  { key: "90", label: "90 jours", days: 90 },
  { key: "all", label: "Depuis toujours", days: null },
];

export default async function AdminReferralsPage({ searchParams }: { searchParams: Promise<{ period?: string }> }) {
  const { period: periodKey } = await searchParams;
  const period = PERIODS.find((p) => p.key === periodKey) ?? PERIODS[3];
  const stats = await getAdminReferralStats(period.days);

  return <div className="admin-page">
    <div className="admin-page-heading">
      <div><span className="section-index">TABLEAU DE BORD</span><h1>Le <em>parrainage</em></h1></div>
    </div>

    <div className="admin-sync-filters">
      {PERIODS.map((p) => <Link key={p.key} href={`/admin/referrals?period=${p.key}`} className={p.key === period.key ? "selected" : ""}>{p.label}</Link>)}
    </div>

    <div className="provider-cards-grid">
      <div className="provider-card"><span className="micro-label">INVITATIONS</span><strong className="admin-stat-value">{stats.totalInvitations}</strong></div>
      <div className="provider-card"><span className="micro-label">CONFIRMÉES</span><strong className="admin-stat-value">{stats.totalConfirmed}</strong></div>
      <div className="provider-card"><span className="micro-label">TAUX DE CONFIRMATION</span><strong className="admin-stat-value">{stats.confirmationRate}%</strong></div>
      <div className="provider-card"><span className="micro-label">RÉCOMPENSES DISTRIBUÉES</span><strong className="admin-stat-value">{stats.rewardsDistributed}</strong></div>
    </div>

    <p className="empty-note" style={{ marginTop: 12 }}>
      Non disponible ici : le taux de conversion clic → inscription n&apos;est pas stocké dans cette base (seul un clic suivi d&apos;une inscription réussie crée une ligne). Consulte Google Analytics / Plausible (voir /admin/seo) pour le nombre de clics sur les liens d&apos;invitation.
    </p>

    <div className="admin-subheading"><h2>Meilleurs ambassadeurs</h2></div>
    {stats.topAmbassadors.length === 0 ? <div className="empty-state"><span>∅</span><h3>Aucun parrainage pour l&apos;instant.</h3></div> : <div className="admin-table-wrap">
      <table className="admin-table">
        <thead><tr><th>Email</th><th>Invitations</th><th>Confirmées</th></tr></thead>
        <tbody>
          {stats.topAmbassadors.map((entry) => <tr key={entry.userId}>
            <td>{entry.email ?? "—"}</td>
            <td>{entry.signedUp}</td>
            <td>{entry.confirmed}</td>
          </tr>)}
        </tbody>
      </table>
    </div>}
  </div>;
}
