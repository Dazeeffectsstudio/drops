import type { Metadata } from "next";
import { BannerForm } from "@/components/admin/banner-form";
import { getBetaBanner } from "@/lib/beta-banner-repository";

export const metadata: Metadata = { title: "Bannière" };
export const dynamic = "force-dynamic";

export default async function AdminBannerPage() {
  const banner = (await getBetaBanner()) ?? { enabled: false, message: "🚀 DROPS est actuellement en bêta publique.", linkUrl: null, linkLabel: null };

  return <div className="admin-page">
    <div className="admin-page-heading">
      <div><span className="section-index">BÊTA PUBLIQUE</span><h1>Bannière du <em>site</em></h1></div>
    </div>
    <p className="admin-notice">Affichée en haut de toutes les pages publiques dès qu&apos;elle est activée. Chaque visiteur peut la fermer — elle réapparaît si tu changes le texte.</p>
    <BannerForm banner={banner} />
  </div>;
}
