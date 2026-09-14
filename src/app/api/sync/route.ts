import { NextResponse, type NextRequest } from "next/server";
import { syncAllOffers } from "@/lib/sync-offers";

// Route de synchronisation, prête pour la production. Planification
// automatique volontairement PAS activée (voir la mission : "ne pas
// activer la planification automatiquement").
//
// Sécurité : si SYNC_SECRET est défini dans les variables d'environnement,
// la route exige l'en-tête `Authorization: Bearer <SYNC_SECRET>` et refuse
// tout appel sans ce secret. Si SYNC_SECRET n'est PAS défini (ex. en
// développement local sans configuration particulière), la route reste
// ouverte — comme pour /admin (voir src/lib/admin-auth.ts), la sécurité
// est prête mais pas obligatoire tant qu'elle n'est pas configurée.
//
// Pour brancher un vrai cron plus tard :
//   - Vercel Cron : ajouter dans vercel.json
//       { "crons": [{ "path": "/api/sync", "schedule": "0 */6 * * *" }] }
//     et définir SYNC_SECRET dans les variables d'environnement du projet
//     Vercel. Vercel Cron appelle la route en GET avec
//     `Authorization: Bearer $CRON_SECRET` si tu nommes la variable
//     CRON_SECRET — sinon, ajoute manuellement l'en-tête dans la config.
//   - GitHub Actions : un workflow planifié qui fait
//       curl -H "Authorization: Bearer $SYNC_SECRET" https://ton-domaine/api/sync

function isAuthorized(request: NextRequest): boolean {
  const secret = process.env.SYNC_SECRET;
  if (!secret) return true; // pas encore configuré : ouvert, comme /admin.
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
