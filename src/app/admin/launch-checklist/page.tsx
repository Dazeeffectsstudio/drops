import { isAnalyticsConfigured } from "@/lib/analytics/config";
import { isEmailConfigured } from "@/lib/email/client";
import { isPushConfigured } from "@/lib/push/client";
import { siteConfig } from "@/lib/site-config";

export const dynamic = "force-dynamic";

type ChecklistItem = { label: string; ok: boolean; hint: string };

function buildChecklist(): ChecklistItem[] {
  const httpsReady = siteConfig.isProduction && siteConfig.url.startsWith("https://");
  return [
    { label: "Domaine connecté", ok: siteConfig.isProduction, hint: siteConfig.isProduction ? siteConfig.url : "Définis NEXT_PUBLIC_SITE_URL sur ton vrai domaine (voir DEPLOYMENT.md)." },
    { label: "HTTPS actif", ok: httpsReady, hint: httpsReady ? "Actif" : "Automatique sur Vercel dès que le domaine est connecté et vérifié." },
    { label: "Search Console validée", ok: Boolean(process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION), hint: "Ajoute NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION avec le code fourni par Google (voir DEPLOYMENT.md)." },
    { label: "Analytics actif", ok: isAnalyticsConfigured, hint: isAnalyticsConfigured ? "Configuré" : "Optionnel — définis NEXT_PUBLIC_GA_MEASUREMENT_ID ou NEXT_PUBLIC_PLAUSIBLE_DOMAIN si tu veux des statistiques." },
    { label: "Cron de synchronisation déclaré", ok: true, hint: "vercel.json déclare /api/sync (6h) et /api/notifications/check-expiring (30min) — actif dès le déploiement sur Vercel (plan Pro pour cette fréquence, voir DEPLOYMENT.md pour l'alternative Hobby)." },
    { label: "Emails actifs", ok: isEmailConfigured, hint: isEmailConfigured ? "Configuré (Resend)" : "Définis RESEND_API_KEY pour des envois réels." },
    { label: "Notifications push actives", ok: isPushConfigured, hint: isPushConfigured ? "Configuré" : "Clés VAPID manquantes (normalement déjà générées, voir .env.local)." },
    { label: "robots.txt valide", ok: true, hint: "Généré automatiquement par src/app/robots.ts." },
    { label: "Sitemap valide", ok: true, hint: "Généré automatiquement par src/app/sitemap.ts." },
    { label: "Build de production réussi", ok: true, hint: "Si cette page s'affiche, le dernier build a réussi." },
  ];
}

export default function LaunchChecklistPage() {
  const items = buildChecklist();
  const doneCount = items.filter((item) => item.ok).length;

  return <div className="admin-page">
    <div className="admin-page-heading">
      <div><span className="section-index">LANCEMENT</span><h1>Checklist de <em>lancement</em></h1></div>
      <span className="admin-status admin-status--lime">{doneCount}/{items.length} prêts</span>
    </div>

    <div className="admin-table-wrap">
      <table className="admin-table">
        <thead><tr><th>Élément</th><th>Statut</th><th>Détail</th></tr></thead>
        <tbody>
          {items.map((item) => <tr key={item.label}>
            <td>{item.label}</td>
            <td><span className={`admin-status admin-status--${item.ok ? "lime" : "orange"}`}>{item.ok ? "✓ Prêt" : "À faire"}</span></td>
            <td className="admin-table-message">{item.hint}</td>
          </tr>)}
        </tbody>
      </table>
    </div>

    <p className="empty-note" style={{ marginTop: 16 }}>Guide détaillé pas à pas : voir <code>DEPLOYMENT.md</code> à la racine du projet.</p>
  </div>;
}
