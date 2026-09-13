import type { OfferStore } from "@/types/offer";
import { findPlatformByStore } from "@/lib/catalog";

export function PlatformBadge({ store, compact = false }: { store: OfferStore; compact?: boolean }) {
  const logo = findPlatformByStore(store)?.logo ?? store.charAt(0);
  return <span className={`platform-badge platform-badge--${store.toLowerCase().replaceAll(" ", "-")} ${compact ? "platform-badge--compact" : ""}`} title={store}>
    <span className="platform-mark" aria-hidden="true">{logo}</span>
    <span>{store}</span>
  </span>;
}
