const RESEND_API_KEY = process.env.RESEND_API_KEY;
const FROM_ADDRESS = process.env.RESEND_FROM_EMAIL || "DROPS <onboarding@resend.dev>";

export const isEmailConfigured = Boolean(RESEND_API_KEY);

export type EmailPayload = { to: string; subject: string; html: string };
export type EmailResult = { sent: boolean; error?: string };

// Sans RESEND_API_KEY, ne fait rien de réel — juste un log, comme le reste
// du projet quand une intégration optionnelle n'est pas configurée (voir
// SYNC_SECRET, ADMIN_EMAILS). Dès que la clé est renseignée, envoie un
// vrai email via l'API REST de Resend (pas besoin de leur SDK).
export async function sendEmail(payload: EmailPayload): Promise<EmailResult> {
  if (!RESEND_API_KEY) {
    console.info(`[email] mode développement (RESEND_API_KEY absente) — aucun envoi réel. À: ${payload.to} — Sujet: ${payload.subject}`);
    return { sent: false };
  }
  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${RESEND_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from: FROM_ADDRESS, to: payload.to, subject: payload.subject, html: payload.html }),
    });
    if (!response.ok) {
      const text = await response.text();
      return { sent: false, error: `Resend a répondu ${response.status} : ${text.slice(0, 200)}` };
    }
    return { sent: true };
  } catch (error) {
    return { sent: false, error: error instanceof Error ? error.message : String(error) };
  }
}
