import { NextResponse, type NextRequest } from "next/server";
import { runNotificationDispatch } from "@/lib/notification-dispatch";

// Route dédiée aux notifications "offre disponible" / "expire dans 24h" /
// "expire dans 2h" (voir src/lib/notification-dispatch.ts), qui ne dépendent
// PAS d'une synchronisation (une offre peut franchir le seuil des 2h
// n'importe quand, pas seulement pendant un sync). syncAllOffers() appelle
// déjà ce même service à chaque synchronisation — cette route sert à
// planifier des vérifications plus fréquentes et régulières.
//
// Planification automatique volontairement PAS activée, même pattern que
// /api/sync : protégée par SYNC_SECRET si défini, sinon ouverte. Pour un
// vrai cron (Vercel Cron / GitHub Actions), appeler cette route toutes les
// 15-30 minutes, comme documenté dans src/app/api/sync/route.ts.

function isAuthorized(request: NextRequest): boolean {
  const secret = process.env.SYNC_SECRET;
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
