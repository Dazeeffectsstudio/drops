import { sendEmail, type EmailResult } from "./client";
import { newOfferEmailTemplate, offerEndingSoonEmailTemplate, offerStartedEmailTemplate } from "@/lib/notifications/templates";
import type { Offer } from "@/types/offer";

export async function sendNewOfferEmail(to: string, offer: Offer): Promise<EmailResult> {
  const { subject, html } = newOfferEmailTemplate(offer);
  return sendEmail({ to, subject, html });
}

export async function sendOfferStartedEmail(to: string, offer: Offer): Promise<EmailResult> {
  const { subject, html } = offerStartedEmailTemplate(offer);
  return sendEmail({ to, subject, html });
}

export async function sendOfferEndingSoonEmail(to: string, offer: Offer): Promise<EmailResult> {
  const { subject, html } = offerEndingSoonEmailTemplate(offer);
  return sendEmail({ to, subject, html });
}
