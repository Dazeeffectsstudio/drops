import { newOfferEmailTemplate, offerEndingSoonEmailTemplate, offerStartedEmailTemplate } from "./templates";
import type { Offer } from "@/types/offer";

export type EmailPayload = { to: string; subject: string; html: string };

// Abstraction volontairement sans fournisseur branché (Resend, Postmark,
// SendGrid...) : aucun email n'est réellement envoyé pour l'instant, comme
// demandé pour cette mission ("ne pas envoyer d'emails automatiquement").
// `deliver` est le SEUL endroit à modifier le jour où un fournisseur est
// choisi — tout le reste du code appelle uniquement les trois fonctions
// exportées ci-dessous, jamais `deliver` directement.
async function deliver(payload: EmailPayload): Promise<{ sent: boolean }> {
  console.info(`[notifications] mode aperçu (aucun envoi réel) — à: ${payload.to} — sujet: ${payload.subject}`);
  return { sent: false };
}

export async function sendNewOfferEmail(to: string, offer: Offer): Promise<{ sent: boolean }> {
  const { subject, html } = newOfferEmailTemplate(offer);
  return deliver({ to, subject, html });
}

export async function sendOfferStartedEmail(to: string, offer: Offer): Promise<{ sent: boolean }> {
  const { subject, html } = offerStartedEmailTemplate(offer);
  return deliver({ to, subject, html });
}

export async function sendOfferEndingSoonEmail(to: string, offer: Offer): Promise<{ sent: boolean }> {
  const { subject, html } = offerEndingSoonEmailTemplate(offer);
  return deliver({ to, subject, html });
}
