import { createSupabaseServerClient } from "@/lib/supabase/server-client";

export type AuthUser = { id: string; email: string | null; avatarUrl: string | null; pseudo: string | null; createdAt: string };

function parsedAdminEmails(): string[] {
  return (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((entry) => entry.trim().toLowerCase())
    .filter(Boolean);
}

// ADMIN_EMAILS liste les adresses autorisées à accéder à /admin — voir
// .env.local.example. Si la variable est vide, personne n'est admin (accès
// fermé par défaut, jamais ouvert par défaut).
export function isAdminEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  return parsedAdminEmails().includes(email.toLowerCase());
}

export async function getCurrentUser(): Promise<AuthUser | null> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return null;
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  return {
    id: user.id,
    email: user.email ?? null,
    avatarUrl: (user.user_metadata?.avatar_url as string | undefined) ?? null,
    pseudo: (user.user_metadata?.display_name as string | undefined) ?? null,
    createdAt: user.created_at,
  };
}
