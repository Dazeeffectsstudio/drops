import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { NotificationList } from "@/components/notification-list";
import { getCurrentUser } from "@/lib/auth";
import { getMySubscriptions } from "@/lib/notification-subscriptions-repository";

export const metadata: Metadata = { title: "Notifications — DROPS" };

export default async function NotificationsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/notifications");

  const subscriptions = await getMySubscriptions();
  const unreadCount = subscriptions.filter((sub) => sub.notifiedAt && !sub.readAt).length;

  return <main className="subpage site-shell">
    <header className="subpage-header">
      <Link href="/" className="brand">DROPS<span className="brand-period">.</span></Link>
      <Link href="/account" className="back-link">← MON COMPTE</Link>
    </header>
    <section className="subpage-intro">
      <span className="section-index">CENTRE DE NOTIFICATIONS</span>
      <h1>Mes <em>alertes</em>{unreadCount > 0 && <span className="unread-badge">{unreadCount}</span>}</h1>
      <p>Les offres que tu suis, celles qui viennent d&apos;apparaître, et celles qui expirent bientôt.</p>
    </section>
    <NotificationList subscriptions={subscriptions} />
  </main>;
}
