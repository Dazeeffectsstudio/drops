import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { InviteLinkCard } from "@/components/invite-link-card";
import { getCurrentUser } from "@/lib/auth";
import { getMyReferralStats } from "@/lib/referrals-repository";
import { absoluteUrl } from "@/lib/site-config";

export const metadata: Metadata = { title: "Inviter un ami", robots: { index: false, follow: false } };

export default async function InvitePage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/invite");

  const stats = await getMyReferralStats();
  const inviteUrl = absoluteUrl(`/?ref=${user.id}`);

  return <main className="subpage site-shell">
    <header className="subpage-header">
      <Link href="/" className="brand">DROPS<span className="brand-period">.</span></Link>
      <Link href="/account" className="back-link">← MON COMPTE</Link>
    </header>
    <section className="subpage-intro">
      <span className="section-index">PARRAINAGE</span>
      <h1>Invite un <em>ami</em></h1>
      <p>Partage ton lien personnel — DROPS te dira combien de personnes se sont inscrites grâce à toi.</p>
    </section>

    <div className="provider-cards-grid" style={{ marginBottom: 32 }}>
      <div className="provider-card"><span className="micro-label">INSCRIPTIONS VIA TON LIEN</span><strong className="admin-stat-value">{stats.totalSignedUp}</strong></div>
    </div>

    <InviteLinkCard url={inviteUrl} />

    <p className="empty-note" style={{ marginTop: 20 }}>Pas de récompense pour l&apos;instant — juste le plaisir de faire découvrir DROPS à tes amis (et on garde le compteur pour toi).</p>
  </main>;
}
