import { NextResponse } from "next/server";
import { syncAllOffers } from "@/lib/sync-offers";

// Route de synchronisation, prête pour la production mais PAS planifiée
// automatiquement pour l'instant (voir la mission : "ne pas activer la
// planification automatiquement").
//
// Pour brancher un cron plus tard :
//   - Vercel Cron : ajouter dans vercel.json
//       { "crons": [{ "path": "/api/sync", "schedule": "0 */6 * * *" }] }
//     Vercel Cron appelle la route en GET, d'où le handler GET ci-dessous.
//   - GitHub Actions : un workflow planifié (cron) qui fait juste
//       curl -X POST https://ton-domaine/api/sync
//
// Si cette route devient publique sur internet, pense à la protéger (ex.
// vérifier un header secret) avant d'activer un vrai cron en production.

export async function POST() {
  const summary = await syncAllOffers();
  return NextResponse.json(summary);
}

export async function GET() {
  const summary = await syncAllOffers();
  return NextResponse.json(summary);
}
