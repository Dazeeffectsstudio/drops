import type { Metadata } from "next";
import Link from "next/link";
import { siteConfig } from "@/lib/site-config";

export const metadata: Metadata = { title: "Contact", description: `Contacter l'équipe ${siteConfig.name}.` };

export default function ContactPage() {
  return <main className="subpage site-shell legal-page">
    <header className="subpage-header"><Link href="/" className="brand">DROPS<span className="brand-period">.</span></Link><Link href="/" className="back-link">← RETOUR AU SITE</Link></header>
    <section className="subpage-intro"><span className="section-index">CONTACT</span><h1>Une <em>question</em> ?</h1><p>Signalement d&apos;offre expirée, question sur ton compte, partenariat — écris-nous.</p></section>
    <div className="legal-content">
      <h2>Nous contacter</h2>
      <p>Pour toute question générale, demande liée à ton compte ou à tes données personnelles, écris-nous à :</p>
      <p><a className="contact-email" href={`mailto:${siteConfig.contactEmail}`}>{siteConfig.contactEmail}</a></p>

      <h2>Signaler une offre</h2>
      <p>Une offre affichée sur {siteConfig.name} est expirée, incorrecte ou cassée ? Précise le nom de l&apos;offre et la plateforme concernée dans ton email, on corrige au plus vite.</p>

      <h2>Presse &amp; partenariats</h2>
      <p>Pour toute demande de partenariat ou presse, utilise la même adresse en précisant l&apos;objet de ta demande.</p>
    </div>
  </main>;
}
