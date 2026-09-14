import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentUser, isAdminEmail } from "@/lib/auth";
import { isAnalyticsConfigured } from "@/lib/analytics/config";
import { isEmailConfigured } from "@/lib/email/client";
import { isPushConfigured } from "@/lib/push/client";
import { providers } from "@/lib/providers";
import { getRecentSyncLogs } from "@/lib/sync-logs-repository";
import { isSupabaseAdminConfigured } from "@/lib/supabase/admin-client";
import { isSupabaseConfigured } from "@/lib/supabase/public-client";
import { siteConfig } from "@/lib/site-config";

export const metadata: Metadata = { title: "État du service", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

type Check = { label: string; ok: boolean; detail: string };

export default async function StatusPage() {
  const user = await getCurrentUser();
  if (!user || !isAdminEmail(user.email)) redirect("/login?next=/status");

  const logs = await getRecentSyncLogs(50);
  const lastSyncAt = logs[0]?.createdAt ?? null;
  const latestByProvider = new Map(logs.map((log) => [log.provider, log]));

  const checks: Check[] = [
    { label: "Supabase (lecture publique)", ok: isSupabaseConfigured, detail: isSupabaseConfigured ? "Configuré" : "NEXT_PUBLIC_SUPABASE_URL / ANON_KEY manquantes" },
    { label: "Supabase (écriture admin)", ok: isSupabaseAdminConfigured, detail: isSupabaseAdminConfigured ? "Configuré" : "SUPABASE_SERVICE_ROLE_KEY manquante" },
    { label: "Emails (Resend)", ok: isEmailConfigured, detail: isEmailConfigured ? "Configuré — envois réels" : "Mode développement (aucun envoi réel)" },
    { label: "Notifications push", ok: isPushConfigured, detail: isPushConfigured ? "Configuré" : "Clés VAPID manquantes" },
    { label: "Google Search Console", ok: Boolean(process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION), detail: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION ? "Balise de vérification présente" : "NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION manquante" },
    { label: "Analytics", ok: isAnalyticsConfigured, detail: isAnalyticsConfigured ? "Configuré" : "Aucune clé GA4/Plausible" },
    { label: "Domaine de production", ok: siteConfig.isProduction, detail: siteConfig.isProduction ? siteConfig.url : "NEXT_PUBLIC_SITE_URL non définie (site en noindex)" },
  ];

  return <div className="admin-page">
    <div className="admin-page-heading">
      <div><span className="section-index">MONITORING</span><h1>État du <em>service</em></h1></div>
    </div>

    <div className="admin-table-wrap">
      <table className="admin-table">
        <thead><tr><th>Service</th><th>Statut</th><th>Détail</th></tr></thead>
        <tbody>
          {checks.map((check) => <tr key={check.label}>
            <td>{check.label}</td>
            <td><span className={`admin-status admin-status--${check.ok ? "lime" : "orange"}`}>{check.ok ? "OK" : "À configurer"}</span></td>
            <td className="admin-table-message">{check.detail}</td>
          </tr>)}
        </tbody>
      </table>
    </div>

    <div className="admin-subheading"><h2>Providers de synchronisation</h2></div>
    <div className="admin-table-wrap">
      <table className="admin-table">
        <thead><tr><th>Provider</th><th>Mode</th><th>Dernière synchro</th><th>Statut</th></tr></thead>
        <tbody>
          {providers.map((provider) => {
            const log = latestByProvider.get(provider.key);
            return <tr key={provider.key}>
              <td>{provider.label}</td>
              <td>{provider.mode === "real" ? "Réel" : "Simulé"}</td>
              <td>{log ? new Intl.DateTimeFormat("fr-BE", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }).format(new Date(log.createdAt)) : "Jamais"}</td>
              <td><span className={`admin-status admin-status--${log?.status === "error" ? "orange" : log ? "lime" : "gray"}`}>{log ? (log.status === "error" ? "Erreur" : "OK") : "—"}</span></td>
            </tr>;
          })}
        </tbody>
      </table>
    </div>
    <p className="empty-note" style={{ marginTop: 12 }}>Dernière synchronisation (tous providers) : {lastSyncAt ? new Intl.DateTimeFormat("fr-BE", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }).format(new Date(lastSyncAt)) : "jamais"}.</p>
  </div>;
}
