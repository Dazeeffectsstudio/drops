"use client";

import { platforms } from "@/lib/catalog";
import type { OfferStore } from "@/types/offer";

export function PlatformQuickNav({ active, onSelect }: { active: OfferStore | "TOUT"; onSelect: (store: OfferStore) => void }) {
  return <nav className="platform-quicknav" aria-label="Filtrer par plateforme">
    {platforms.map((platform) => <button
      key={platform.slug}
      type="button"
      className={`platform-chip ${active === platform.store ? "selected" : ""}`}
      onClick={() => onSelect(platform.store)}
      aria-pressed={active === platform.store}
    >
      <span className={`platform-chip-icon platform-chip-icon--${platform.color}`} aria-hidden="true">{platform.logo}</span>
      {platform.label}
    </button>)}
  </nav>;
}
