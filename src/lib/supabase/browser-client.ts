import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "@/types/database";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(url && anonKey);

// Client Supabase pour les Client Components — utilisé uniquement là où une
// interaction ne peut pas passer par une Server Action.
export function createSupabaseBrowserClient() {
  if (!url || !anonKey) return null;
  return createBrowserClient<Database>(url, anonKey);
}
