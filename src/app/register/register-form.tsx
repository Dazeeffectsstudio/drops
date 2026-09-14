"use client";

import { useActionState } from "react";
import { signUpAction, type AuthFormState } from "@/app/auth-actions";

const initialState: AuthFormState = {};

export function RegisterForm() {
  const [state, formAction, pending] = useActionState(signUpAction, initialState);

  return <form action={formAction} className="auth-form">
    <label>Email<input type="email" name="email" required autoComplete="email" /></label>
    <label>Mot de passe<input type="password" name="password" required autoComplete="new-password" minLength={6} /></label>
    {state.error && <p className="auth-error">{state.error}</p>}
    {state.message && <p className="auth-message">{state.message}</p>}
    <button type="submit" className="claim-button" disabled={pending}>{pending ? "CRÉATION…" : "CRÉER MON COMPTE"}</button>
  </form>;
}
