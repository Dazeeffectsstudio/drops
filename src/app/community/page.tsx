import type { Metadata } from "next";
import Link from "next/link";
import { getCommunityStats, type LeaderboardEntry } from "@/lib/community-stats-repository";
import { formatPrice } from "@/lib/offers";

export const metadata: Metadata = { title: "Classement communautaire", description: "Les classements anonymisés de la communauté DROPS : économies, streaks, favoris et plateformes les plus populaires." };
export const dynamic = "force-dynamic";

function Leaderboard({ title, entries, formatValue }: { title: string; entries: LeaderboardEntry[]; formatValue: (v: number) => string }) {
  return <div className="leaderboard-card">
    <h3>{title}</h3>
    {entries.length === 0 ? <p className="empty-note">Pas encore assez de données.</p> : <ol className="leaderboard-list">
      {entries.map((entry, i) => <li key={entry.label} className={i === 0 ? "is-top-rank" : ""}>
        <span className="leaderboard-rank">{i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `#${i + 1}`}</span>
        <span>{entry.label}</span>
        <strong>{formatValue(entry.value)}</strong>
      </li>)}
    </ol>}
  </div>;
}

export default async function CommunityPage() {
  const stats = await getCommunityStats();

  return <main className="subpage site-shell">
    <header className="subpage-header">
      <Link href="/" className="brand">DROPS<span className="brand-period">.</span></Link>
      <Link href="/" className="back-link">← Retour au site</Link>
    </header>
    <section className="subpage-intro">
      <h1>Classement <em>communautaire</em></h1>
      <p>100% anonymisé — jamais d&apos;email ni de pseudo réel affiché ici.</p>
    </section>

    <div className="leaderboard-grid">
      <Leaderboard title="💰 Le plus économisé" entries={stats.topSavers} formatValue={formatPrice} />
      <Leaderboard title="🔥 Plus gros streaks" entries={stats.topStreaks} formatValue={(v) => `${v} jours`} />
      <Leaderboard title="⭐ Plus de favoris" entries={stats.topCollectors} formatValue={(v) => `${v}`} />
      <Leaderboard title="🎮 Plateformes populaires" entries={stats.popularPlatforms} formatValue={(v) => `${v} favoris`} />
    </div>
  </main>;
}
