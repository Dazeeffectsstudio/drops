import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { OfferForm } from "@/components/admin/offer-form";
import { getOfferById } from "@/lib/offers-repository";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const offer = await getOfferById(id);
  return { title: offer ? `Modifier ${offer.title} — Admin DROPS` : "Admin DROPS" };
}

export default async function EditOfferPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const offer = await getOfferById(id);
  if (!offer) notFound();

  return <div className="admin-page">
    <div className="admin-page-heading">
      <div><span className="section-index">MODIFIER</span><h1>{offer.title}</h1></div>
    </div>
    <OfferForm offer={offer} />
  </div>;
}
