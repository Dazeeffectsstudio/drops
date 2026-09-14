"use client";

import { useEffect, useState, type ReactNode } from "react";

function hashMessage(value: string): string {
  let hash = 0;
  for (let i = 0; i < value.length; i++) hash = (hash * 31 + value.charCodeAt(i)) | 0;
  return hash.toString(36);
}

// Une bannière fermée reste fermée pour ce visiteur (localStorage) — mais
// une NOUVELLE bannière (texte différent, donc hash différent) réapparaît
// automatiquement même si une ancienne avait été fermée.
export function BetaBannerDismiss({ message, children }: { message: string; children: ReactNode }) {
  const key = `drops-beta-banner-${hashMessage(message)}`;
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    try { setDismissed(localStorage.getItem(key) === "1"); } catch { /* localStorage indisponible : on laisse la bannière visible */ }
  }, [key]);

  if (dismissed) return null;
  return <div className="beta-banner" role="status">
    <div className="beta-banner-content">{children}</div>
    <button type="button" onClick={() => { try { localStorage.setItem(key, "1"); } catch { /* ignore */ } setDismissed(true); }} aria-label="Fermer la bannière">×</button>
  </div>;
}
