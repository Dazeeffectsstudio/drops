import Image from "next/image";
import type { OfferStore } from "@/types/offer";
import { platformLogos } from "@/lib/platform-logos";

export function PlatformBadge({ store, compact = false }: { store: OfferStore; compact?: boolean }) {
  return <span className={`platform-badge platform-badge--${store.toLowerCase().replaceAll(" ", "-")} ${compact ? "platform-badge--compact" : ""}`} title={store}>
    <span className="platform-mark"><Image src={platformLogos[store]} alt="" width={32} height={32} className="platform-mark-icon" unoptimized /></span>
    <span>{store}</span>
  </span>;
}
