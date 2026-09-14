"use client";

import { useActionState } from "react";
import { updatePseudoAction, type PseudoFormState } from "@/app/account/actions";

const initialState: PseudoFormState = {};

export function PseudoForm({ currentPseudo }: { currentPseudo: string | null }) {
  const [state, formAction, pending] = useActionState(updatePseudoAction, initialState);

  return <form action={formAction} className="pseudo-form">
    <label>
      <span className="filter-label">PSEUDO</span>
      <input type="text" name="pseudo" defaultValue={currentPseudo ?? ""} placeholder="Ton pseudo public" maxLength={32} />
    </label>
    {state.error && <p className="auth-error">{state.error}</p>}
    {state.success && <p className="auth-message">Pseudo enregistré.</p>}
    <button type="submit" className="admin-test-button" disabled={pending}>{pending ? "…" : "ENREGISTRER LE PSEUDO"}</button>
  </form>;
}
