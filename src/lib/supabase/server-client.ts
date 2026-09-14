import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import type { Database } from "@/types/database";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(url && anonKey);

// Client "session utilisateur" pour les Server Components / Server Actions /
// Route Handlers — lit et écrit les cookies de session Supabase Auth.
// `null` tant que les variables d'environnement ne sont pas renseignées,
// comme les autres clients Supabase du projet (voir public-client.ts).
export async function createSupabaseServerClient() {
  if (!url || !anonKey) return null;
  const cookieStore = await cookies();
  return createServerClient<Database>(url, anonKey, {
    cookies: {
      getAll: () => cookieStore.getAll(),
      setAll: (cookiesToSet) => {
        try {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
        } catch {
          // Appelé depuis un Server Component (cookies en lecture seule) :
          // le middleware (src/lib/supabase/middleware.ts) rafraîchit déjà
          // la session sur chaque navigation, donc ce n'est pas bloquant.
        }
      },
    },
  });
}
