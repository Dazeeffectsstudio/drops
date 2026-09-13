import { notFound } from "next/navigation";
import { offers } from "@/data/offers";
import { OfferDetail } from "@/components/offer-detail";

export function generateStaticParams() { return offers.map((offer) => ({ id: offer.id })); }
export default async function OfferPage({ params }: { params: Promise<{ id: string }> }) { const { id } = await params; const offer = offers.find((item) => item.id === id); if (!offer) notFound(); return <OfferDetail offer={offer} />; }
