import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

// ATTENTION : ce client utilise la clé "service role", qui contourne toutes
// les règles de sécurité (RLS) de Supabase. Ne jamais l'importer depuis un
// composant client ni l'exposer au navigateur — uniquement depuis du code
// serveur (Server Actions, Route Handlers, Server Components) sous
// src/app/admin/.

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export const isSupabaseAdminConfigured = Boolean(url && serviceRoleKey);

export const supabaseAdmin = isSupabaseAdminConfigured
  ? createClient<Database>(url as string, serviceRoleKey as string, { auth: { persistSession: false } })
  : null;
