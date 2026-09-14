"use client";

import { useActionState } from "react";
import { signInAction, type AuthFormState } from "@/app/auth-actions";

const initialState: AuthFormState = {};

export function LoginForm({ next }: { next: string }) {
  const [state, formAction, pending] = useActionState(signInAction, initialState);

  return <form action={formAction} className="auth-form">
    <input type="hidden" name="next" value={next} />
    <label>Email<input type="email" name="email" required autoComplete="email" /></label>
    <label>Mot de passe<input type="password" name="password" required autoComplete="current-password" /></label>
    {state.error && <p className="auth-error">{state.error}</p>}
    <button type="submit" className="claim-button" disabled={pending}>{pending ? "CONNEXION…" : "SE CONNECTER"}</button>
  </form>;
}
