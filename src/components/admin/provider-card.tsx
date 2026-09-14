"use client";

import { useState, useTransition } from "react";
import { testProviderAction } from "@/app/admin/actions";

export type ProviderCardData = {
  key: string;
  label: string;
  mode: "real" | "simulated";
  unavailableReason?: string;
  lastStatus: "success" | "error" | null;
  lastOffersFound: number | null;
  lastDurationMs: number | null;
  lastSyncAt: string | null;
};

export function ProviderCard({ data }: { data: ProviderCardData }) {
  const [pending, startTransition] = useTransition();
  const [testResult, setTestResult] = useState<{ success: boolean; offersFound: number; durationMs: number; error?: string } | null>(null);

  function handleTest() {
    setTestResult(null);
    startTransition(async () => {
      const result = await testProviderAction(data.key);
      setTestResult(result);
    });
  }

  const state = data.mode === "simulated" ? "simulated" : data.lastStatus === "error" ? "error" : data.lastStatus === "success" ? "active" : "unknown";
  const stateLabel: Record<typeof state, string> = { simulated: "Simulé", error: "Erreur", active: "Actif", unknown: "Jamais synchronisé" };
  const stateTone: Record<typeof state, "gray" | "orange" | "lime" | "blue"> = { simulated: "blue", error: "orange", active: "lime", unknown: "gray" };

  return <div className="provider-card">
    <div className="provider-card-head">
      <strong>{data.label}</strong>
      <span className={`admin-status admin-status--${stateTone[state]}`}>{stateLabel[state]}</span>
    </div>
    {data.mode === "simulated" && data.unavailableReason && <p className="provider-card-reason">{data.unavailableReason}</p>}
    <div className="provider-card-stats">
      <div><span className="micro-label">DERNIÈRE SYNCHRO</span><strong>{data.lastSyncAt ? new Intl.DateTimeFormat("fr-BE", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }).format(new Date(data.lastSyncAt)) : "—"}</strong></div>
      <div><span className="micro-label">OFFRES RÉCUPÉRÉES</span><strong>{data.lastOffersFound ?? "—"}</strong></div>
      <div><span className="micro-label">TEMPS DE RÉPONSE</span><strong>{data.lastDurationMs !== null ? `${data.lastDurationMs} ms` : "—"}</strong></div>
    </div>
    <button type="button" className="admin-test-button" onClick={handleTest} disabled={pending}>
      {pending ? "TEST EN COURS…" : "TESTER LE PROVIDER"}
    </button>
    {testResult && <p className={`provider-card-result ${testResult.success ? "" : "provider-card-result--error"}`}>
      {testResult.success ? `✓ ${testResult.offersFound} offre(s) en ${testResult.durationMs} ms` : `✗ ${testResult.error}`}
    </p>}
  </div>;
}
