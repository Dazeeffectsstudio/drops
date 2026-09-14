import Link from "next/link";
import { SyncPanel } from "@/components/admin/sync-panel";
import { OffersTable } from "@/components/admin/offers-table";
import { getAllOffersWithTimestamps, isSupabaseConfigured } from "@/lib/offers-repository";
import { getRecentSyncLogs } from "@/lib/sync-logs-repository";

export default async function AdminPage() {
  const [offers, recentLogs] = await Promise.all([getAllOffersWithTimestamps(), getRecentSyncLogs()]);
  const lastSyncAt = recentLogs[0]?.createdAt ?? null;

  return <div className="admin-page">
    <div className="admin-page-heading">
      <div><span className="section-index">TABLEAU DE BORD</span><h1>Toutes les <em>offres</em></h1></div>
      <Link href="/admin/new" className="claim-button">+ AJOUTER UNE OFFRE</Link>
    </div>
    {!isSupabaseConfigured && <p className="admin-notice">
      Supabase n&apos;est pas encore configuré — copie <code>.env.local.example</code> en <code>.env.local</code> et renseigne tes clés.
      Aucune offre ne peut être lue ou modifiée tant que ce n&apos;est pas fait.
    </p>}
    <SyncPanel recentLogs={recentLogs} />
    <OffersTable offers={offers} lastSyncAt={lastSyncAt} />
  </div>;
}
