const url = process.env.NEXT_PUBLIC_SUPABASE_URL;

export type OAuthProviderStatus = { google: boolean; github: boolean };

// GoTrue expose ses providers actifs sur un endpoint public non
// authentifié (utilisé par supabase-js lui-même) — ça permet de savoir si
// Google/GitHub sont réellement configurés côté Supabase sans essayer une
// vraie connexion. Si l'appel échoue pour une raison ou une autre, on
// masque les deux boutons par prudence plutôt que d'afficher un bouton
// cassé.
export async function getOAuthProviderStatus(): Promise<OAuthProviderStatus> {
  if (!url) return { google: false, github: false };
  try {
    const response = await fetch(`${url}/auth/v1/settings`, { cache: "no-store" });
    if (!response.ok) return { google: false, github: false };
    const data = (await response.json()) as { external?: Record<string, boolean> };
    return { google: Boolean(data.external?.google), github: Boolean(data.external?.github) };
  } catch {
    return { google: false, github: false };
  }
}
