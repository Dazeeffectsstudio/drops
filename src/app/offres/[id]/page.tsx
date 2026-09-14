import { notFound } from "next/navigation";
import { OfferDetail } from "@/components/offer-detail";
import { getOfferById } from "@/lib/offers-repository";

export default async function OfferPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const offer = await getOfferById(id);
  if (!offer) notFound();
  return <OfferDetail offer={offer} />;
}
