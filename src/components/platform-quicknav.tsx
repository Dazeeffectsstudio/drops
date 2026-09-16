"use client";

import Image from "next/image";
import { platforms } from "@/lib/catalog";
import { platformLogos } from "@/lib/platform-logos";
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
      <span className="platform-chip-icon"><Image src={platformLogos[platform.store]} alt="" width={24} height={24} unoptimized /></span>
      {platform.label}
    </button>)}
  </nav>;
}
