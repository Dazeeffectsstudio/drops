import { signInWithOAuthAction } from "@/app/auth-actions";
import { getOAuthProviderStatus } from "@/lib/supabase/oauth-status";

// Server Component asynchrone : masque chaque bouton tant que le provider
// correspondant n'est pas activé côté Supabase (voir oauth-status.ts), pour
// ne jamais afficher un bouton qui échouerait au clic.
export async function OAuthButtons({ next }: { next: string }) {
  const status = await getOAuthProviderStatus();
  if (!status.google && !status.github) {
    return process.env.NODE_ENV === "development"
      ? <p className="oauth-dev-notice">Google et GitHub ne sont pas encore activés dans Supabase (Authentication → Providers) — ce message n&apos;apparaît qu&apos;en développement.</p>
      : null;
  }

  return <div className="oauth-buttons">
    {status.google && <form action={signInWithOAuthAction.bind(null, "google")}>
      <input type="hidden" name="next" value={next} />
      <button type="submit" className="oauth-button">Continuer avec Google</button>
    </form>}
    {status.github && <form action={signInWithOAuthAction.bind(null, "github")}>
      <input type="hidden" name="next" value={next} />
      <button type="submit" className="oauth-button">Continuer avec GitHub</button>
    </form>}
    {process.env.NODE_ENV === "development" && (!status.google || !status.github) && <p className="oauth-dev-notice">
      {!status.google && "Google"}{!status.google && !status.github && " et "}{!status.github && "GitHub"} pas encore activé{!status.google && !status.github ? "s" : ""} dans Supabase — message visible en développement uniquement.
    </p>}
  </div>;
}
