import Image from "next/image";
import type { OfferStore } from "@/types/offer";

// Vrais logos officiels par plateforme (récupérés depuis Wikimedia Commons,
// qui héberge les fichiers de marque officiels de chaque entreprise —
// utilisés ici à titre informatif pour identifier la source de l'offre,
// DROPS n'étant affilié à aucune de ces plateformes).
const logos: Record<OfferStore, string> = {
  "Epic Games": "/images/logos/epic-games.svg",
  Steam: "/images/logos/steam.svg",
  PlayStation: "/images/logos/playstation.svg",
  Xbox: "/images/logos/xbox.svg",
  Twitch: "/images/logos/twitch.svg",
  Roblox: "/images/logos/roblox.svg",
  "Prime Gaming": "/images/logos/prime-gaming.svg",
};

export function PlatformBadge({ store, compact = false }: { store: OfferStore; compact?: boolean }) {
  return <span className={`platform-badge platform-badge--${store.toLowerCase().replaceAll(" ", "-")} ${compact ? "platform-badge--compact" : ""}`} title={store}>
    <span className="platform-mark"><Image src={logos[store]} alt="" width={32} height={32} className="platform-mark-icon" unoptimized /></span>
    <span>{store}</span>
  </span>;
}
