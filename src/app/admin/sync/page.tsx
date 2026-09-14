import type { Metadata } from "next";
import Link from "next/link";
import { ProviderCard, type ProviderCardData } from "@/components/admin/provider-card";
import { SyncHistoryTable } from "@/components/admin/sync-history-table";
import { providers } from "@/lib/providers";
import { getRecentSyncLogs } from "@/lib/sync-logs-repository";

export const metadata: Metadata = { title: "Synchronisation" };

export default async function AdminSyncPage({ searchParams }: { searchParams: Promise<{ provider?: string }> }) {
  const { provider: filterProvider } = await searchParams;
  const logs = await getRecentSyncLogs(200);

  const cards: ProviderCardData[] = providers.map((provider) => {
    const latest = logs.find((log) => log.provider === provider.key);
    return {
      key: provider.key,
      label: provider.label,
      mode: provider.mode,
      unavailableReason: provider.unavailableReason,
      lastStatus: latest?.status ?? null,
      lastOffersFound: latest?.offersFound ?? null,
      lastDurationMs: latest?.durationMs ?? null,
      lastSyncAt: latest?.createdAt ?? null,
    };
  });

  const filteredLogs = filterProvider ? logs.filter((log) => log.provider === filterProvider) : logs;

  return <div className="admin-page">
    <div className="admin-page-heading">
      <div><span className="section-index">SYNCHRONISATION</span><h1>Historique &amp; <em>providers</em></h1></div>
      <Link href="/admin" className="back-link">← RETOUR AU TABLEAU DE BORD</Link>
    </div>

    <div className="provider-cards-grid">
      {cards.map((card) => <ProviderCard key={card.key} data={card} />)}
    </div>

    <div className="admin-subheading"><h2>Historique complet</h2></div>
    <div className="admin-sync-filters">
      <Link href="/admin/sync" className={!filterProvider ? "selected" : ""}>TOUT</Link>
      {providers.map((provider) => <Link key={provider.key} href={`/admin/sync?provider=${provider.key}`} className={filterProvider === provider.key ? "selected" : ""}>{provider.label}</Link>)}
    </div>
    <SyncHistoryTable logs={filteredLogs} />
  </div>;
}
