import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(url && anonKey);

// Client en lecture seule (clé anonyme) : utilisé par tout le site public.
// `null` tant que les variables d'environnement ne sont pas renseignées —
// voir src/lib/offers-repository.ts pour le comportement de repli.
export const supabasePublic = isSupabaseConfigured
  ? createClient<Database>(url as string, anonKey as string)
  : null;
