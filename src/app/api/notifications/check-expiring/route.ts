import { NextResponse, type NextRequest } from "next/server";
import { runNotificationDispatch } from "@/lib/notification-dispatch";

// Route dédiée aux notifications "offre disponible" / "expire dans 24h" /
// "expire dans 2h" (voir src/lib/notification-dispatch.ts), qui ne dépendent
// PAS d'une synchronisation (une offre peut franchir le seuil des 2h
// n'importe quand, pas seulement pendant un sync). syncAllOffers() appelle
// déjà ce même service à chaque synchronisation — cette route sert à
// planifier des vérifications plus fréquentes et régulières.
//
// Planifiée automatiquement en production via vercel.json (voir
// DEPLOYMENT.md). Protégée par SYNC_SECRET/CRON_SECRET, même pattern que
// /api/sync.

function isAuthorized(request: NextRequest): boolean {
  const secret = process.env.SYNC_SECRET || process.env.CRON_SECRET;
  if (!secret) return true;
  return request.headers.get("authorization") === `Bearer ${secret}`;
}

async function handle(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Non autorisé." }, { status: 401 });
  }
  await runNotificationDispatch([]);
  return NextResponse.json({ ok: true });
}

export async function GET(request: NextRequest) {
  return handle(request);
}

export async function POST(request: NextRequest) {
  return handle(request);
}
