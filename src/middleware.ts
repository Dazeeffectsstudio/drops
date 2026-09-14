import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { isAdminEmail } from "@/lib/auth";
import { updateSession } from "@/lib/supabase/middleware";

const supabaseConfigured = Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

// Rafraîchit la session Supabase Auth sur (presque) chaque navigation — sans
// ça, la session expire silencieusement côté serveur. Protège aussi /admin
// et /admin/sync : seuls les comptes listés dans ADMIN_EMAILS (voir
// src/lib/auth.ts) peuvent passer, comme demandé pour cette mission.
export async function middleware(request: NextRequest) {
  const { response, user } = await updateSession(request);

  if (supabaseConfigured && request.nextUrl.pathname.startsWith("/admin")) {
    if (!isAdminEmail(user?.email)) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("next", request.nextUrl.pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return response;
}

export const config = {
  // Tout sauf les fichiers statiques (assets Next.js, favicon, images) et
  // les routes API (qui gèrent leur propre auth, ex. SYNC_SECRET).
  matcher: ["/((?!_next/static|_next/image|favicon.ico|api|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)"],
};
