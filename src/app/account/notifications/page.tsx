import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { NotificationPreferencesForm } from "@/components/account/notification-preferences-form";
import { PushNotificationToggle } from "@/components/push-notification-toggle";
import { getCurrentUser } from "@/lib/auth";
import { getNotificationPreferences } from "@/lib/notification-preferences-repository";

export const metadata: Metadata = { title: "Notifications — Mon compte", robots: { index: false, follow: false } };

export default async function AccountNotificationsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/account/notifications");

  const preferences = await getNotificationPreferences();
  const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ?? null;

  return <main className="subpage site-shell">
    <header className="subpage-header">
      <Link href="/" className="brand">DROPS<span className="brand-period">.</span></Link>
      <Link href="/account" className="back-link">← MON COMPTE</Link>
    </header>
    <section className="subpage-intro">
      <span className="section-index">MON COMPTE</span>
      <h1>Réglages des <em>notifications</em></h1>
      <p>Choisis ce que tu veux recevoir, et comment.</p>
    </section>

    <div className="admin-subheading"><h2>Notifications navigateur</h2></div>
    <PushNotificationToggle vapidPublicKey={vapidPublicKey} />

    <div className="admin-subheading"><h2>Préférences email</h2></div>
    <NotificationPreferencesForm preferences={preferences} />
  </main>;
}
