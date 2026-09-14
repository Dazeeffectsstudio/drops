"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { attributeReferral } from "@/lib/referrals-repository";
import { siteConfig } from "@/lib/site-config";
import { createSupabaseServerClient, isSupabaseConfigured } from "@/lib/supabase/server-client";

export type AuthFormState = { error?: string; message?: string };

async function getSiteOrigin(): Promise<string> {
  const headersList = await headers();
  const origin = headersList.get("origin");
  if (origin) return origin;
  const host = headersList.get("x-forwarded-host") ?? headersList.get("host");
  const protocol = headersList.get("x-forwarded-proto") ?? "https";
  if (host) return `${protocol}://${host}`;
  return siteConfig.url;
}

function safeNext(next: FormDataEntryValue | null): string {
  const value = String(next ?? "/");
  return value.startsWith("/") ? value : "/";
}

// Ajoute un marqueur "_evt" lu par AuthEventTracker (src/components/auth-event-tracker.tsx)
// pour déclencher un événement analytics juste après la redirection — le
// seul moment fiable, puisque redirect() coupe l'exécution du serveur.
function withEvent(path: string, evt: "login" | "signup"): string {
  return `${path}${path.includes("?") ? "&" : "?"}_evt=${evt}`;
}

export async function signInAction(_prevState: AuthFormState, formData: FormData): Promise<AuthFormState> {
  if (!isSupabaseConfigured) return { error: "Supabase n'est pas encore configuré." };
  const supabase = await createSupabaseServerClient();
  if (!supabase) return { error: "Supabase n'est pas encore configuré." };

  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  if (!email || !password) return { error: "Email et mot de passe sont obligatoires." };

  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { error: "Email ou mot de passe incorrect." };

  redirect(withEvent(safeNext(formData.get("next")), "login"));
}

export async function signUpAction(_prevState: AuthFormState, formData: FormData): Promise<AuthFormState> {
  if (!isSupabaseConfigured) return { error: "Supabase n'est pas encore configuré." };
  const supabase = await createSupabaseServerClient();
  if (!supabase) return { error: "Supabase n'est pas encore configuré." };

  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  if (!email || !password) return { error: "Email et mot de passe sont obligatoires." };
  if (password.length < 6) return { error: "Le mot de passe doit contenir au moins 6 caractères." };

  const { data, error } = await supabase.auth.signUp({ email, password });
  if (error) return { error: error.message.includes("already registered") ? "Un compte existe déjà avec cet email." : "Impossible de créer le compte." };
  if (data.user) await attributeReferral(data.user.id);
  if (!data.session) return { message: "Compte créé ! Vérifie ta boîte mail pour confirmer ton adresse avant de te connecter." };

  redirect(withEvent("/account", "signup"));
}

export async function signOutAction(): Promise<void> {
  const supabase = await createSupabaseServerClient();
  await supabase?.auth.signOut();
  redirect("/");
}

export async function signInWithOAuthAction(provider: "google" | "github", formData: FormData): Promise<void> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return;

  const next = safeNext(formData.get("next"));
  const origin = await getSiteOrigin();
  const { data } = await supabase.auth.signInWithOAuth({
    provider,
    options: { redirectTo: `${origin}/auth/callback?next=${encodeURIComponent(next)}` },
  });
  if (data?.url) redirect(data.url);
}
