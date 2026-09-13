import type { Offer } from "@/types/offer";

export function formatPrice(value: number): string {
  return new Intl.NumberFormat("fr-BE", { style: "currency", currency: "EUR" }).format(value);
}

export function formatRemaining(milliseconds: number): string {
  if (milliseconds <= 0) return "Expirée";
  const minutes = Math.ceil(milliseconds / 60_000);
  const days = Math.floor(minutes / 1_440);
  const hours = Math.floor((minutes % 1_440) / 60);
  const mins = minutes % 60;
  return days > 0 ? `${days}j ${hours}h ${mins}m` : `${hours}h ${mins}m`;
}

export function totalFreeValue(items: Offer[]): number {
  return items.reduce((total, offer) => total + (offer.originalPrice ?? 0), 0);
}

export function offerExpiresAt(offer: Offer): number {
  return new Date(offer.expiresAt).getTime();
}

export function expiryProgress(remaining: number | null): number {
  if (remaining === null) return 100;
  return Math.max(0, Math.min(100, (remaining / (7 * 24 * 3_600_000)) * 100));
}

export function isOfferActive(offer: Offer, now = Date.now()): boolean {
  return offerExpiresAt(offer) > now;
}
