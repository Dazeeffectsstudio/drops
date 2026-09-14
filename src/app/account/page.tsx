import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { signOutAction } from "@/app/auth-actions";
import { PreferencesForm } from "@/components/account/preferences-form";
import { getCurrentUser } from "@/lib/auth";
import { getUserPreferences } from "@/lib/preferences-repository";

export const metadata: Metadata = { title: "Mon compte", robots: { index: false, follow: false } };

export default async function AccountPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/account");

  const preferences = await getUserPreferences();
  const initial = (user.email ?? "?").charAt(0).toUpperCase();

  return <main className="subpage site-shell">
    <header className="subpage-header">
      <Link href="/" className="brand">DROPS<span className="brand-period">.</span></Link>
      <Link href="/" className="back-link">← RETOUR AU SITE</Link>
    </header>
    <section className="subpage-intro">
      <span className="section-index">MON COMPTE</span>
      <h1>Salut, <em>{user.email ?? "toi"}</em></h1>
      <p>Gère ton compte, tes favoris et tes préférences de notification.</p>
    </section>

    <div className="account-panel">
      <div className="account-identity">
        {user.avatarUrl ? <img src={user.avatarUrl} alt="" className="account-avatar account-avatar--large" /> : <span className="account-avatar account-avatar--large account-avatar--fallback">{initial}</span>}
        <div>
          <strong>{user.email}</strong>
          <div className="account-links">
            <Link href="/favoris">Mes favoris</Link>
            <Link href="/notifications">Centre de notifications</Link>
            <Link href="/account/notifications">Réglages des notifications</Link>
          </div>
        </div>
        <form action={signOutAction}><button type="submit" className="admin-test-button">SE DÉCONNECTER</button></form>
      </div>
    </div>

    <div className="admin-subheading"><h2>Préférences</h2></div>
    <PreferencesForm preferences={preferences} />
  </main>;
}
