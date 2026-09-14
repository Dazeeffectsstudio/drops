import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { InviteLinkCard } from "@/components/invite-link-card";
import { ReferralRewardList } from "@/components/referral-reward-list";
import { getCurrentUser } from "@/lib/auth";
import { generateQrCodeDataUrl } from "@/lib/qr-code";
import { getMyReferralRewards } from "@/lib/referral-rewards";
import { getMyReferralStats } from "@/lib/referrals-repository";
import { absoluteUrl } from "@/lib/site-config";

export const metadata: Metadata = { title: "Ambassadeur", robots: { index: false, follow: false } };

export default async function AmbassadorPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/ambassador");

  const inviteUrl = absoluteUrl(`/?ref=${user.id}`);
  const [stats, rewards, qrCode] = await Promise.all([
    getMyReferralStats(),
    getMyReferralRewards(),
    generateQrCodeDataUrl(inviteUrl),
  ]);

  return <main className="subpage site-shell">
    <header className="subpage-header">
      <Link href="/" className="brand">DROPS<span className="brand-period">.</span></Link>
      <Link href="/account" className="back-link">← MON COMPTE</Link>
    </header>
    <section className="subpage-intro">
      <span className="section-index">PROGRAMME AMBASSADEURS</span>
      <h1>Deviens <em>ambassadeur</em> DROPS</h1>
      <p>Partage ton lien, débloque des récompenses à chaque palier d&apos;amis invités.</p>
    </section>

    <div className="ambassador-card">
      <div className="ambassador-card-glow" aria-hidden="true" />
      <div className="ambassador-card-content">
        <div className="ambassador-card-stats">
          <div><strong>{stats.totalSignedUp}</strong><span>invitations</span></div>
          <div><strong>{stats.totalConfirmed}</strong><span>confirmées</span></div>
          <div><strong>{rewards.length}</strong><span>récompenses</span></div>
        </div>
        {/* eslint-disable-next-line @next/next/no-img-element -- next/image ne gère pas les data: URLs sans passer en "unoptimized", inutile ici (image déjà générée à la bonne taille côté serveur) */}
        <img src={qrCode} alt="QR code de ton lien d'invitation" className="ambassador-qr" width={160} height={160} />
      </div>
    </div>

    <InviteLinkCard url={inviteUrl} />

    <div className="admin-subheading"><h2>Récompenses</h2></div>
    <ReferralRewardList earned={rewards} signedUpCount={stats.totalSignedUp} />
  </main>;
}
