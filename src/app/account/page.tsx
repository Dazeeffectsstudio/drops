import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { signOutAction } from "@/app/auth-actions";
import { PreferencesForm } from "@/components/account/preferences-form";
import { PseudoForm } from "@/components/account/pseudo-form";
import { BadgeList } from "@/components/badge-list";
import { getMyActivity } from "@/lib/account-stats-repository";
import { getCurrentUser } from "@/lib/auth";
import { getMyBadges } from "@/lib/badges";
import { getUserPreferences } from "@/lib/preferences-repository";
import { getMyStreak } from "@/lib/streak-repository";

export const metadata: Metadata = { title: "Mon compte", robots: { index: false, follow: false } };

export default async function AccountPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/account");

  const [preferences, activity, streak, badges] = await Promise.all([
    getUserPreferences(),
    getMyActivity(),
    getMyStreak(),
    getMyBadges(),
  ]);

  const initial = (user.pseudo ?? user.email ?? "?").charAt(0).toUpperCase();
  const joinedLabel = new Intl.DateTimeFormat("fr-BE", { day: "numeric", month: "long", year: "numeric" }).format(new Date(user.createdAt));

  return <main className="subpage site-shell">
    <header className="subpage-header">
      <Link href="/" className="brand">DROPS<span className="brand-period">.</span></Link>
      <Link href="/" className="back-link">← RETOUR AU SITE</Link>
    </header>
    <section className="subpage-intro">
      <span className="section-index">MON COMPTE</span>
      <h1>Salut, <em>{user.pseudo ?? user.email ?? "toi"}</em></h1>
      <p>Gère ton compte, tes favoris et tes préférences de notification.</p>
    </section>

    <div className="account-panel">
      <div className="account-identity">
        {user.avatarUrl ? <img src={user.avatarUrl} alt="" className="account-avatar account-avatar--large" /> : <span className="account-avatar account-avatar--large account-avatar--fallback">{initial}</span>}
        <div>
          <strong>{user.pseudo ?? user.email}</strong>
          <span className="account-joined">Membre depuis le {joinedLabel}</span>
          <div className="account-links">
            <Link href="/favoris">Mes favoris</Link>
            <Link href="/notifications">Centre de notifications</Link>
            <Link href="/account/notifications">Réglages des notifications</Link>
            <Link href="/invite">Inviter un ami</Link>
          </div>
        </div>
        <form action={signOutAction}><button type="submit" className="admin-test-button">SE DÉCONNECTER</button></form>
      </div>
    </div>

    <div className="admin-subheading"><h2>Ton activité DROPS</h2></div>
    <div className="provider-cards-grid">
      <div className="provider-card"><span className="micro-label">FAVORIS</span><strong className="admin-stat-value">{activity.favoritesCount}</strong></div>
      <div className="provider-card"><span className="micro-label">NOTIFICATIONS ACTIVES</span><strong className="admin-stat-value">{activity.notificationsCount}</strong></div>
      <div className="provider-card"><span className="micro-label">PLATEFORME FAVORITE</span><strong className="admin-stat-value" style={{ fontSize: 18 }}>{activity.topPlatform ?? "—"}</strong></div>
      <div className="provider-card"><span className="micro-label">CATÉGORIE FAVORITE</span><strong className="admin-stat-value" style={{ fontSize: 18 }}>{activity.topCategory ?? "—"}</strong></div>
      <div className="provider-card"><span className="micro-label">STREAK ACTUEL</span><strong className="admin-stat-value">🔥 {streak.currentStreak}</strong></div>
      <div className="provider-card"><span className="micro-label">MEILLEUR STREAK</span><strong className="admin-stat-value">{streak.longestStreak}</strong></div>
    </div>

    <div className="admin-subheading"><h2>Pseudo</h2></div>
    <PseudoForm currentPseudo={user.pseudo} />

    <div className="admin-subheading"><h2>Badges</h2></div>
    <BadgeList earned={badges} />

    <div className="admin-subheading"><h2>Préférences</h2></div>
    <PreferencesForm preferences={preferences} />
  </main>;
}
