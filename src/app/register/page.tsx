import type { Metadata } from "next";
import Link from "next/link";
import { OAuthButtons } from "@/components/auth/oauth-buttons";
import { isSupabaseConfigured } from "@/lib/supabase/server-client";
import { RegisterForm } from "./register-form";

export const metadata: Metadata = { title: "Créer un compte — DROPS" };

export default async function RegisterPage() {
  return <main className="subpage site-shell auth-page">
    <header className="subpage-header">
      <Link href="/" className="brand">DROPS<span className="brand-period">.</span></Link>
      <Link href="/" className="back-link">← RETOUR AU SITE</Link>
    </header>
    <section className="auth-panel">
      <span className="section-index">CRÉER UN COMPTE</span>
      <h1>Rejoins <em>DROPS</em></h1>
      {!isSupabaseConfigured
        ? <p className="admin-notice">Supabase n&apos;est pas encore configuré — les comptes ne sont pas disponibles pour l&apos;instant.</p>
        : <>
          <OAuthButtons next="/account" />
          <div className="auth-divider"><span>ou</span></div>
          <RegisterForm />
          <p className="auth-switch">Déjà un compte ? <Link href="/login">Se connecter</Link></p>
        </>}
    </section>
  </main>;
}
