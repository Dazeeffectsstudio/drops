import { TestEmailButton } from "@/components/admin/test-email-button";
import { buildOffer } from "@/lib/offer-builder";
import { newOfferEmailTemplate, offerEndingSoonEmailTemplate, offerStartedEmailTemplate } from "@/lib/notifications/templates";
import { getNotificationLogStats } from "@/lib/notification-logs-repository";
import { isEmailConfigured } from "@/lib/email/client";
import { isPushConfigured } from "@/lib/push/client";

export const dynamic = "force-dynamic";

const sampleOffer = buildOffer({
  id: "preview-sample",
  title: "Fortnite : Pack de démonstration",
  description: "Un aperçu du template email — ceci est une offre fictive utilisée uniquement pour prévisualiser le design.",
  platform: "PC",
  store: "Epic Games",
  category: "JEUX",
  image: "/images/placeholder.svg",
  originalPrice: 19.99,
  expiresAt: new Date(Date.now() + 86_400_000).toISOString(),
  url: "https://store.epicgames.com",
});

const templates = [
  { key: "new-offer", label: "Nouvelle offre", ...newOfferEmailTemplate(sampleOffer) },
  { key: "offer-started", label: "Offre démarrée", ...offerStartedEmailTemplate(sampleOffer) },
  { key: "offer-ending-soon", label: "Expire bientôt", ...offerEndingSoonEmailTemplate(sampleOffer) },
];

const typeLabels: Record<string, string> = {
  new_offer: "Nouvelle offre",
  offer_started: "Offre disponible",
  offer_ending_soon_24h: "Expire dans 24h",
  offer_ending_soon_2h: "Expire dans 2h",
  test: "Test admin",
};

export default async function AdminNotificationsPreviewPage() {
  const stats = await getNotificationLogStats();

  return <div className="admin-page">
    <div className="admin-page-heading">
      <div><span className="section-index">NOTIFICATIONS</span><h1>Emails &amp; <em>push</em></h1></div>
    </div>

    {!isEmailConfigured && <p className="admin-notice">
      RESEND_API_KEY n&apos;est pas configurée — les emails restent en mode développement (aucun envoi réel, juste un log serveur).
    </p>}
    {!isPushConfigured && <p className="admin-notice">
      Les clés VAPID ne sont pas configurées — les notifications push restent en mode développement.
    </p>}

    <div className="provider-cards-grid">
      <div className="provider-card"><span className="micro-label">EMAILS ENVOYÉS AUJOURD&apos;HUI</span><strong className="admin-stat-value">{stats.emailsSentToday}</strong></div>
      <div className="provider-card"><span className="micro-label">PUSH ENVOYÉS AUJOURD&apos;HUI</span><strong className="admin-stat-value">{stats.pushSentToday}</strong></div>
      <div className="provider-card"><span className="micro-label">TAUX DE SUCCÈS</span><strong className="admin-stat-value">{stats.successRate}%</strong></div>
      <div className="provider-card"><span className="micro-label">TAUX D&apos;ÉCHEC</span><strong className="admin-stat-value">{stats.failureRate}%</strong></div>
    </div>

    <div className="admin-subheading"><h2>Tester l&apos;envoi</h2></div>
    <TestEmailButton />

    <div className="admin-subheading"><h2>Derniers envois (aujourd&apos;hui)</h2></div>
    {stats.recent.length === 0 ? <p className="empty-note">Aucun envoi aujourd&apos;hui.</p> : <div className="admin-table-wrap">
      <table className="admin-table">
        <thead><tr><th>Date</th><th>Type</th><th>Canal</th><th>Statut</th></tr></thead>
        <tbody>
          {stats.recent.map((log) => <tr key={log.id}>
            <td>{new Intl.DateTimeFormat("fr-BE", { hour: "2-digit", minute: "2-digit" }).format(new Date(log.sentAt))}</td>
            <td>{typeLabels[log.type] ?? log.type}</td>
            <td>{log.provider === "email" ? "Email" : "Push"}</td>
            <td><span className={`admin-status admin-status--${log.status === "error" ? "orange" : log.status === "skipped" ? "gray" : "lime"}`}>{log.status === "error" ? "Erreur" : log.status === "skipped" ? "Ignoré (dev)" : "Envoyé"}</span></td>
          </tr>)}
        </tbody>
      </table>
    </div>}

    {stats.recentErrors.length > 0 && <>
      <div className="admin-subheading"><h2>Dernières erreurs</h2></div>
      <div className="admin-sync-errors">
        {stats.recentErrors.map((log) => <p key={log.id}><b>{typeLabels[log.type] ?? log.type} ({log.provider})</b> : {log.errorMessage ?? "erreur inconnue"}</p>)}
      </div>
    </>}

    <div className="admin-subheading"><h2>Aperçu des templates</h2></div>
    <div className="notification-preview-grid">
      {templates.map((template) => <div key={template.key} className="notification-preview-card">
        <h3>{template.label}</h3>
        <p className="notification-preview-subject">Sujet : {template.subject}</p>
        <iframe title={template.label} srcDoc={template.html} className="notification-preview-frame" />
      </div>)}
    </div>
  </div>;
}
