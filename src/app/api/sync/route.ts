import { NextResponse, type NextRequest } from "next/server";
import { syncAllOffers } from "@/lib/sync-offers";

// Route de synchronisation. Planifiée automatiquement en production via
// vercel.json (voir DEPLOYMENT.md pour changer la fréquence ou basculer
// sur GitHub Actions).
//
// Sécurité : si SYNC_SECRET (ou CRON_SECRET — Vercel Cron l'envoie
// automatiquement si une variable d'environnement nommée exactement
// CRON_SECRET existe) est défini, la route exige l'en-tête
// `Authorization: Bearer <secret>` et refuse tout appel sans lui. Si aucun
// des deux n'est défini (ex. développement local), la route reste ouverte
// — comme pour /admin (voir src/lib/admin-auth.ts), la sécurité est prête
// mais pas obligatoire tant qu'elle n'est pas configurée.

function isAuthorized(request: NextRequest): boolean {
  const secret = process.env.SYNC_SECRET || process.env.CRON_SECRET;
  if (!secret) return true;
  const header = request.headers.get("authorization");
  return header === `Bearer ${secret}`;
}

async function handleSync(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Non autorisé." }, { status: 401 });
  }
  const summary = await syncAllOffers();
  return NextResponse.json(summary);
}

export async function POST(request: NextRequest) {
  return handleSync(request);
}

export async function GET(request: NextRequest) {
  return handleSync(request);
}
