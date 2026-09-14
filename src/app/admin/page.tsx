import Link from "next/link";
import { OffersTable } from "@/components/admin/offers-table";
import { getAllOffers, isSupabaseConfigured } from "@/lib/offers-repository";

export default async function AdminPage() {
  const offers = await getAllOffers();
  return <div className="admin-page">
    <div className="admin-page-heading">
      <div><span className="section-index">TABLEAU DE BORD</span><h1>Toutes les <em>offres</em></h1></div>
      <Link href="/admin/new" className="claim-button">+ AJOUTER UNE OFFRE</Link>
    </div>
    {!isSupabaseConfigured && <p className="admin-notice">
      Supabase n&apos;est pas encore configuré — copie <code>.env.local.example</code> en <code>.env.local</code> et renseigne tes clés.
      Aucune offre ne peut être lue ou modifiée tant que ce n&apos;est pas fait.
    </p>}
    <OffersTable offers={offers} />
  </div>;
}
