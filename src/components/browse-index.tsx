import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";

type Entry = { href: string; label: string; description: string; count: number; logoImage?: string; icon?: ReactNode };

export function BrowseIndex({ eyebrow, title, description, entries }: { eyebrow: string; title: string; description: string; entries: Entry[] }) {
  return <main className="subpage site-shell">
    <header className="subpage-header">
      <Link href="/" className="brand">DROPS<span className="brand-period">.</span></Link>
      <Link href="/" className="back-link">← RETOUR AUX OFFRES</Link>
    </header>
    <section className="subpage-intro">
      <span className="section-index">{eyebrow}</span>
      <h1><em>{title}</em></h1>
      <p>{description}</p>
    </section>
    <div className="browse-grid">
      {entries.map((entry) => <Link key={entry.href} href={entry.href} className="browse-card">
        <div className="browse-card-top">
          {entry.logoImage && <span className="browse-logo" aria-hidden="true"><Image src={entry.logoImage} alt="" width={26} height={26} unoptimized /></span>}
          {entry.icon && <span className="browse-logo browse-logo--icon" aria-hidden="true">{entry.icon}</span>}
          <span>{entry.count > 0 ? `${entry.count} OFFRE${entry.count > 1 ? "S" : ""}` : "BIENTÔT"}</span>
        </div>
        <strong>{entry.label}</strong>
        <p>{entry.description}</p>
      </Link>)}
    </div>
  </main>;
}
