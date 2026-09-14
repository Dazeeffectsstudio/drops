import type { Metadata } from "next";
import Link from "next/link";
import { signInWithOAuthAction } from "@/app/auth-actions";
import { isSupabaseConfigured } from "@/lib/supabase/server-client";
import { LoginForm } from "./login-form";

export const metadata: Metadata = { title: "Connexion — DROPS" };

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string; error?: string }> }) {
  const params = await searchParams;
  const next = params.next && params.next.startsWith("/") ? params.next : "/";

  return <main className="subpage site-shell auth-page">
    <header className="subpage-header">
      <Link href="/" className="brand">DROPS<span className="brand-period">.</span></Link>
      <Link href="/" className="back-link">← RETOUR AU SITE</Link>
    </header>
    <section className="auth-panel">
      <span className="section-index">CONNEXION</span>
      <h1>Content de te <em>revoir</em></h1>
      {!isSupabaseConfigured
        ? <p className="admin-notice">Supabase n&apos;est pas encore configuré — les comptes ne sont pas disponibles pour l&apos;instant.</p>
        : <>
          {params.error && <p className="auth-error">Une erreur est survenue, réessaie.</p>}
          <div className="oauth-buttons">
            <form action={signInWithOAuthAction.bind(null, "google")}>
              <input type="hidden" name="next" value={next} />
              <button type="submit" className="oauth-button">Continuer avec Google</button>
            </form>
            <form action={signInWithOAuthAction.bind(null, "github")}>
              <input type="hidden" name="next" value={next} />
              <button type="submit" className="oauth-button">Continuer avec GitHub</button>
            </form>
          </div>
          <div className="auth-divider"><span>ou</span></div>
          <LoginForm next={next} />
          <p className="auth-switch">Pas encore de compte ? <Link href="/register">Créer un compte</Link></p>
        </>}
    </section>
  </main>;
}
