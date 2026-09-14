"use client";

import { useState, useTransition } from "react";
import { sendTestEmailAction } from "@/app/admin/actions";

export function TestEmailButton() {
  const [pending, startTransition] = useTransition();
  const [result, setResult] = useState<{ sent: boolean; error?: string } | null>(null);

  function handleClick() {
    setResult(null);
    startTransition(async () => {
      setResult(await sendTestEmailAction());
    });
  }

  return <div>
    <button type="button" className="admin-test-button" onClick={handleClick} disabled={pending}>
      {pending ? "ENVOI…" : "ENVOYER UN EMAIL DE TEST"}
    </button>
    {result && <p className={`provider-card-result ${result.sent ? "" : "provider-card-result--error"}`}>
      {result.sent ? "✓ Email envoyé à ton adresse." : result.error ? `✗ ${result.error}` : "Mode développement : aucun envoi réel (RESEND_API_KEY absente), voir les logs du serveur."}
    </p>}
  </div>;
}
