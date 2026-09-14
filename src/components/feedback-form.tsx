"use client";

import { useActionState } from "react";
import { submitFeedbackAction, type FeedbackFormState } from "@/app/feedback/actions";

const initialState: FeedbackFormState = {};

const types: Array<{ value: string; label: string }> = [
  { value: "bug", label: "Signaler un bug" },
  { value: "platform", label: "Proposer une plateforme" },
  { value: "feature", label: "Proposer une fonctionnalité" },
];

export function FeedbackForm() {
  const [state, formAction, pending] = useActionState(submitFeedbackAction, initialState);

  if (state.success) return <p className="auth-message">Merci ! Ton message a bien été envoyé.</p>;

  return <form action={formAction} className="auth-form">
    <label>
      <span className="filter-label">TYPE</span>
      <select name="type" defaultValue="feature" className="preferences-select">
        {types.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
      </select>
    </label>
    <label>Message<textarea name="message" required rows={5} maxLength={2000} placeholder="Décris ton retour en détail…" /></label>
    {state.error && <p className="auth-error">{state.error}</p>}
    <button type="submit" className="claim-button" disabled={pending}>{pending ? "ENVOI…" : "ENVOYER"}</button>
  </form>;
}
