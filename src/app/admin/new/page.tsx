import type { Metadata } from "next";
import { OfferForm } from "@/components/admin/offer-form";

export const metadata: Metadata = { title: "Ajouter une offre — Admin DROPS" };

export default function NewOfferPage() {
  return <div className="admin-page">
    <div className="admin-page-heading">
      <div><span className="section-index">NOUVELLE OFFRE</span><h1>Ajouter une <em>offre</em></h1></div>
    </div>
    <OfferForm />
  </div>;
}
