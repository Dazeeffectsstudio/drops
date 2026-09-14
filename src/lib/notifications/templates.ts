import type { Offer } from "@/types/offer";

// Templates HTML repris de l'identité visuelle DROPS (fond sombre, accent
// citron #d4fc71) — écrits en HTML/CSS inline pour rester compatibles avec
// les clients email, qui ignorent les feuilles de style externes.

function emailShell(preheader: string, bodyHtml: string): string {
  return `<!doctype html>
<html lang="fr"><head><meta charset="utf-8" /><meta name="viewport" content="width=device-width,initial-scale=1" /></head>
<body style="margin:0;background:#10120f;font-family:Arial,Helvetica,sans-serif;color:#f5f5ed;">
  <span style="display:none;max-height:0;overflow:hidden;">${preheader}</span>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#10120f;padding:32px 0;">
    <tr><td align="center">
      <table role="presentation" width="480" cellpadding="0" cellspacing="0" style="background:#1b1e1a;border-radius:16px;overflow:hidden;">
        <tr><td style="padding:28px 32px 0;">
          <span style="font-size:22px;font-weight:800;color:#f5f5ed;">DROPS<span style="color:#d4fc71;">.</span></span>
        </td></tr>
        <tr><td style="padding:24px 32px 32px;">${bodyHtml}</td></tr>
        <tr><td style="padding:20px 32px;border-top:1px solid #30352e;">
          <span style="font-size:12px;color:#999f94;">DON'T PAY. JUST PLAY. — Tu reçois cet email car tu suis des offres sur DROPS.</span>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;
}

function offerBlock(offer: Offer): string {
  return `<div style="margin-top:16px;">
    <span style="display:inline-block;background:#d4fc71;color:#10120f;font-size:11px;font-weight:700;padding:4px 10px;border-radius:999px;">${offer.store}</span>
    <h2 style="margin:12px 0 4px;font-size:20px;color:#f5f5ed;">${offer.title}</h2>
    <p style="margin:0 0 16px;font-size:14px;color:#b7bcb2;line-height:1.5;">${offer.description}</p>
    <a href="${offer.url}" style="display:inline-block;background:#d4fc71;color:#10120f;font-weight:700;font-size:13px;padding:12px 20px;border-radius:999px;text-decoration:none;">VOIR L'OFFRE</a>
  </div>`;
}

export type EmailTemplate = { subject: string; html: string };

export function newOfferEmailTemplate(offer: Offer): EmailTemplate {
  return {
    subject: `🎮 Nouvelle offre gratuite : ${offer.title}`,
    html: emailShell(
      `${offer.title} est gratuit sur ${offer.store}`,
      `<p style="margin:0;font-size:15px;color:#f5f5ed;">Une offre que tu suis vient d'apparaître :</p>${offerBlock(offer)}`,
    ),
  };
}

export function offerStartedEmailTemplate(offer: Offer): EmailTemplate {
  return {
    subject: `⏳ Disponible maintenant : ${offer.title}`,
    html: emailShell(
      `${offer.title} est maintenant disponible`,
      `<p style="margin:0;font-size:15px;color:#f5f5ed;">L'offre que tu attendais vient de démarrer :</p>${offerBlock(offer)}`,
    ),
  };
}

export function offerEndingSoonEmailTemplate(offer: Offer): EmailTemplate {
  return {
    subject: `⚠️ Bientôt fini : ${offer.title}`,
    html: emailShell(
      `${offer.title} expire bientôt`,
      `<p style="margin:0;font-size:15px;color:#f5f5ed;">Dernière chance avant que cette offre disparaisse :</p>${offerBlock(offer)}`,
    ),
  };
}
