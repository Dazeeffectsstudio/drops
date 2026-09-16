"use client";

import Image from "next/image";
import Link from "next/link";
import type { Offer } from "@/types/offer";
import { useTilt } from "@/lib/use-tilt";
import { PlatformBadge } from "./platform-badge";

export function RelatedOfferCard({ offer }: { offer: Offer }) {
  const { tiltStyle, onMove, onLeave } = useTilt(6);
  return <Link href={`/offres/${offer.id}`} className="related-offer-card">
    <span className="related-offer-image" onMouseMove={onMove} onMouseLeave={onLeave} style={tiltStyle}>
      <Image src={offer.image} alt={offer.imageAlt} fill sizes="(max-width: 700px) 50vw, 25vw" />
    </span>
    <span className="related-offer-content"><PlatformBadge store={offer.store} /><strong>{offer.title}</strong></span>
  </Link>;
}
