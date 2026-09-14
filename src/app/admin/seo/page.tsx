import { getAllOffers } from "@/lib/offers-repository";
import { categories, platforms } from "@/lib/catalog";
import { siteConfig } from "@/lib/site-config";

export const dynamic = "force-dynamic";

type PageAudit = { path: string; label: string; indexable: boolean; hasDescription: boolean; hasStructuredData: boolean };

function buildAudit(offerCount: number): PageAudit[] {
  return [
    { path: "/", label: "Accueil", indexable: true, hasDescription: true, hasStructuredData: true },
    { path: "/platforms", label: "Index plateformes", indexable: true, hasDescription: true, hasStructuredData: false },
    { path: "/platforms/[store]", label: `Pages plateforme (×${platforms.length})`, indexable: true, hasDescription: true, hasStructuredData: true },
    { path: "/categories", label: "Index catégories", indexable: true, hasDescription: true, hasStructuredData: false },
    { path: "/categories/[category]", label: `Pages catégorie (×${categories.length})`, indexable: true, hasDescription: true, hasStructuredData: true },
    { path: "/offres/[id]", label: `Pages offre (×${offerCount})`, indexable: true, hasDescription: true, hasStructuredData: true },
    { path: "/privacy, /terms, /contact", label: "Pages légales", indexable: true, hasDescription: true, hasStructuredData: false },
    { path: "/login, /register, /account, /notifications", label: "Pages privées / utilitaires", indexable: false, hasDescription: false, hasStructuredData: false },
    { path: "/admin/*", label: "Tableau de bord admin", indexable: false, hasDescription: false, hasStructuredData: false },
  ];
}

function scoreFor(audit: PageAudit): number {
  let score = 40;
  if (audit.hasDescription) score += 30;
  if (audit.hasStructuredData) score += 30;
  return audit.indexable ? score : 0;
}

export default async function AdminSeoPage() {
  const offers = await getAllOffers();
  const audit = buildAudit(offers.length);
  const previewOffers = offers.slice(0, 6);

  return <div className="admin-page">
    <div className="admin-page-heading">
      <div><span className="section-index">SEO</span><h1>Référencement &amp; <em>partage</em></h1></div>
    </div>

    {!siteConfig.isProduction && <p className="admin-notice">
      NEXT_PUBLIC_SITE_URL n&apos;est pas configurée — le site tourne en mode développement et reste volontairement en <code>noindex</code> (invisible pour Google) tant que cette variable n&apos;est pas définie sur ton vrai domaine.
    </p>}

    <div className="provider-cards-grid">
      <div className="provider-card"><span className="micro-label">DOMAINE CONFIGURÉ</span><strong className="admin-stat-value" style={{ fontSize: 18 }}>{siteConfig.url}</strong></div>
      <div className="provider-card"><span className="micro-label">SITEMAP</span><a href="/sitemap.xml" target="_blank" rel="noreferrer" className="admin-stat-value" style={{ fontSize: 18, color: "var(--lime)" }}>/sitemap.xml ↗</a></div>
      <div className="provider-card"><span className="micro-label">ROBOTS.TXT</span><a href="/robots.txt" target="_blank" rel="noreferrer" className="admin-stat-value" style={{ fontSize: 18, color: "var(--lime)" }}>/robots.txt ↗</a></div>
      <div className="provider-card"><span className="micro-label">PAGES DANS LE SITEMAP</span><strong className="admin-stat-value">{7 + platforms.length + categories.length + offers.length}</strong></div>
    </div>

    <div className="admin-subheading"><h2>Score SEO par type de page</h2></div>
    <div className="admin-table-wrap">
      <table className="admin-table">
        <thead><tr><th>Page</th><th>Route</th><th>Indexable</th><th>Description unique</th><th>Données structurées</th><th>Score</th></tr></thead>
        <tbody>
          {audit.map((row) => <tr key={row.path}>
            <td>{row.label}</td>
            <td><code>{row.path}</code></td>
            <td>{row.indexable ? "✓" : "noindex"}</td>
            <td>{row.hasDescription ? "✓" : "—"}</td>
            <td>{row.hasStructuredData ? "✓" : "—"}</td>
            <td><span className={`admin-status admin-status--${scoreFor(row) >= 90 ? "lime" : scoreFor(row) >= 40 ? "blue" : "gray"}`}>{scoreFor(row)}/100</span></td>
          </tr>)}
        </tbody>
      </table>
    </div>
    <p className="empty-note" style={{ marginTop: 12 }}>Score indicatif basé sur une checklist (métadonnées, indexation, données structurées) — pas un vrai audit Lighthouse. Lance un audit Lighthouse réel depuis Chrome DevTools sur le site déployé pour un score officiel.</p>

    <div className="admin-subheading"><h2>Aperçu Open Graph</h2></div>
    {previewOffers.length === 0 ? <p className="empty-note">Aucune offre à prévisualiser pour l&apos;instant.</p> : <div className="notification-preview-grid">
      {previewOffers.map((offer) => <div key={offer.id} className="notification-preview-card">
        <h3>{offer.title}</h3>
        <p className="notification-preview-subject">{siteConfig.url}/offres/{offer.id}</p>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={`/offres/${offer.id}/opengraph-image`} alt={`Aperçu Open Graph pour ${offer.title}`} style={{ width: "100%", borderRadius: 8, border: "1px solid #262b23" }} />
      </div>)}
    </div>}
  </div>;
}
