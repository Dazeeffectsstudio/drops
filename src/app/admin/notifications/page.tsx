import { buildOffer } from "@/lib/offer-builder";
import { newOfferEmailTemplate, offerEndingSoonEmailTemplate, offerStartedEmailTemplate } from "@/lib/notifications/templates";

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

export default function AdminNotificationsPreviewPage() {
  return <div className="admin-page">
    <div className="admin-page-heading">
      <div><span className="section-index">APERÇU</span><h1>Templates <em>email</em></h1></div>
    </div>
    <p className="admin-notice">
      Mode aperçu uniquement — aucun email n&apos;est envoyé automatiquement pour l&apos;instant.
      Le service d&apos;envoi (<code>src/lib/notifications/send.ts</code>) est prêt mais pas encore branché à un fournisseur (Resend, Postmark…).
    </p>
    <div className="notification-preview-grid">
      {templates.map((template) => <div key={template.key} className="notification-preview-card">
        <h3>{template.label}</h3>
        <p className="notification-preview-subject">Sujet : {template.subject}</p>
        <iframe title={template.label} srcDoc={template.html} className="notification-preview-frame" />
      </div>)}
    </div>
  </div>;
}
