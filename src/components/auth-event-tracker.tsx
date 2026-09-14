"use client";

import { useEffect } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { trackEvent } from "@/lib/analytics/track";

// Les Server Actions de connexion/inscription (src/app/auth-actions.ts)
// redirigent avec un paramètre "_evt" sur succès — c'est le seul moment
// fiable pour savoir que ça a marché (redirect() coupe l'exécution avant
// qu'un composant client puisse réagir). Ce composant lit ce paramètre une
// fois, envoie l'événement, puis nettoie l'URL pour ne jamais le renvoyer
// deux fois (rechargement de page, retour arrière, etc.).
const EVENT_NAMES: Record<string, string> = { login: "login", signup: "sign_up" };

export function AuthEventTracker() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const evt = searchParams.get("_evt");

  useEffect(() => {
    if (!evt || !EVENT_NAMES[evt]) return;
    trackEvent(EVENT_NAMES[evt]);
    const params = new URLSearchParams(searchParams);
    params.delete("_evt");
    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [evt]);

  return null;
}
