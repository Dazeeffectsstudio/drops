import type { OfferStore } from "@/types/offer";

const initials: Record<OfferStore, string> = {
  Steam: "S",
  "Epic Games": "E",
  PlayStation: "PS",
  Xbox: "X",
  Twitch: "T",
  Roblox: "R",
};

export function PlatformBadge({ store, compact = false }: { store: OfferStore; compact?: boolean }) {
  return <span className={`platform-badge platform-badge--${store.toLowerCase().replaceAll(" ", "-")} ${compact ? "platform-badge--compact" : ""}`} title={store}>
    <span className="platform-mark" aria-hidden="true">{initials[store]}</span>
    <span>{store}</span>
  </span>;
}
