import { isAdminEmail } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server-client";

// Protège /admin et /admin/sync : seuls les comptes listés dans la variable
// d'environnement ADMIN_EMAILS (adresses séparées par des virgules) passent.
// Si Supabase n'est pas configuré du tout, l'accès reste ouvert — comme
// avant V7 — pour ne pas bloquer le développement local sans base de
// données. Dès que Supabase est configuré, seuls les emails listés dans
// ADMIN_EMAILS peuvent entrer : pense à t'y ajouter toi-même avant de
// déployer, sinon tu seras bloqué·e hors de ton propre tableau de bord.
export async function isAdminAuthenticated(): Promise<boolean> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return true;
  const { data: { user } } = await supabase.auth.getUser();
  return isAdminEmail(user?.email);
}
