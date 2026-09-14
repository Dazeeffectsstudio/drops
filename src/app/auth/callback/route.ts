import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server-client";

// Point d'arrivée après une connexion Google/GitHub (redirectTo passé à
// signInWithOAuth dans src/app/auth-actions.ts) : échange le code contre une
// session, puis renvoie vers `next` (ou /account par défaut).
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/account";

  if (code) {
    const supabase = await createSupabaseServerClient();
    if (supabase) {
      const { error } = await supabase.auth.exchangeCodeForSession(code);
      if (!error) return NextResponse.redirect(`${origin}${next.startsWith("/") ? next : "/account"}`);
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth`);
}
