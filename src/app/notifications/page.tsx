import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { NotificationFeed } from "@/components/notification-feed";
import { NotificationList } from "@/components/notification-list";
import { getCurrentUser } from "@/lib/auth";
import { getMyNotificationLogs, getMyUnreadNotificationCount } from "@/lib/notification-logs-repository";
import { getMySubscriptions } from "@/lib/notification-subscriptions-repository";

export const metadata: Metadata = { title: "Notifications", robots: { index: false, follow: false } };

export default async function NotificationsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/notifications");

  const [subscriptions, logs, unreadCount] = await Promise.all([
    getMySubscriptions(),
    getMyNotificationLogs(),
    getMyUnreadNotificationCount(),
  ]);

  return <main className="subpage site-shell">
    <header className="subpage-header">
      <Link href="/" className="brand">DROPS<span className="brand-period">.</span></Link>
      <Link href="/account" className="back-link">← Mon compte</Link>
    </header>
    <section className="subpage-intro">
      <h1>Mes <em>alertes</em>{unreadCount > 0 && <span className="unread-badge">{unreadCount}</span>}</h1>
      <p>Les offres que tu suis, celles qui viennent d&apos;apparaître, et celles qui expirent bientôt.</p>
    </section>

    <div className="admin-subheading"><h2>Fil d&apos;activité</h2></div>
    <NotificationFeed logs={logs} />

    <div className="admin-subheading"><h2>Offres suivies</h2></div>
    <NotificationList subscriptions={subscriptions} />
  </main>;
}
