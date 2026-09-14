import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: { default: "Admin", template: "%s — Admin DROPS" }, robots: { index: false, follow: false } };

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <div className="site-shell admin-shell">
    <header className="subpage-header">
      <Link href="/" className="brand">DROPS<span className="brand-period">.</span> <span className="admin-badge">ADMIN</span></Link>
      <nav className="admin-nav">
        <Link href="/admin">Offres</Link>
        <Link href="/admin/sync">Synchronisation</Link>
        <Link href="/admin/users">Utilisateurs</Link>
        <Link href="/admin/notifications">Notifications</Link>
        <Link href="/admin/seo">SEO</Link>
        <Link href="/" className="back-link">← RETOUR AU SITE</Link>
      </nav>
    </header>
    {children}
  </div>;
}
