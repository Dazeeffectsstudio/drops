// Structure prête à protéger /admin avec une vraie authentification —
// désactivée pour l'instant, comme demandé pour cette mission.
//
// Pour l'activer plus tard :
//   1. Active Supabase Auth (email/mot de passe ou lien magique) dans le
//      tableau de bord Supabase du projet.
//   2. Remplace le corps de `isAdminAuthenticated` ci-dessous par une
//      vérification de session réelle (lire le cookie de session Supabase
//      côté serveur et vérifier qu'il correspond à un compte autorisé).
//   3. Dans src/middleware.ts, décommente le bloc qui redirige les
//      visiteurs non authentifiés loin de /admin.

export async function isAdminAuthenticated(): Promise<boolean> {
  return true;
}
