import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Prêt à protéger /admin, mais désactivé pour l'instant : /admin reste
// accessible sans connexion, comme demandé pour cette mission.
// Voir src/lib/admin-auth.ts pour la marche à suivre pour l'activer.
export function middleware(request: NextRequest) {
  // if (request.nextUrl.pathname.startsWith("/admin")) {
  //   const authenticated = await isAdminAuthenticated(); // src/lib/admin-auth.ts
  //   if (!authenticated) {
  //     return NextResponse.redirect(new URL("/admin/login", request.url));
  //   }
  // }
  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
