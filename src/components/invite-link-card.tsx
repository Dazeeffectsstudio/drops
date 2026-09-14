"use client";

import { useState } from "react";
import { ShareMenu } from "./share-menu";

export function InviteLinkCard({ url }: { url: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch { /* clipboard indisponible */ }
  }

  return <div className="invite-link-card">
    <span className="filter-label">TON LIEN D&apos;INVITATION</span>
    <div className="invite-link-row">
      <input type="text" readOnly value={url} onFocus={(e) => e.target.select()} />
      <button type="button" className="claim-button" onClick={copy}>{copied ? "COPIÉ ✓" : "COPIER"}</button>
    </div>
    <div className="invite-share"><ShareMenu url={url} title="Rejoins-moi sur DROPS" text="Je récupère des jeux gratuits sur DROPS, viens jeter un œil 🎮" /></div>
  </div>;
}
