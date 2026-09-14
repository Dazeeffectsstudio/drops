const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export type OAuthProviderStatus = { google: boolean; github: boolean };

// GoTrue expose ses providers actifs sur un endpoint public non
// authentifié côté utilisateur (utilisé par supabase-js lui-même) — ça
// permet de savoir si Google/GitHub sont réellement configurés côté
// Supabase sans essayer une vraie connexion. Il exige quand même l'en-tête
// "apikey" (la clé anonyme publique, pas un secret) sur toutes les routes
// /auth/v1/*, sans quoi il répond 401 "No API key found in request". Si
// l'appel échoue pour une autre raison, on masque les deux boutons par
// prudence plutôt que d'afficher un bouton cassé.
export async function getOAuthProviderStatus(): Promise<OAuthProviderStatus> {
  if (!url || !anonKey) return { google: false, github: false };
  try {
    const response = await fetch(`${url}/auth/v1/settings`, { cache: "no-store", headers: { apikey: anonKey } });
    if (!response.ok) return { google: false, github: false };
    const data = (await response.json()) as { external?: Record<string, boolean> };
    return { google: Boolean(data.external?.google), github: Boolean(data.external?.github) };
  } catch {
    return { google: false, github: false };
  }
}
