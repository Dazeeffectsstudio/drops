import QRCode from "qrcode";

// Génère le QR code entièrement côté serveur (aucun appel à un service
// tiers, aucune donnée envoyée en dehors de l'infrastructure DROPS) — le
// résultat est une image PNG encodée en base64, prête à être utilisée
// directement dans un <img src="..."> depuis un Server Component.
export async function generateQrCodeDataUrl(text: string): Promise<string> {
  return QRCode.toDataURL(text, { width: 320, margin: 1, color: { dark: "#10120f", light: "#5ec4b4" } });
}
