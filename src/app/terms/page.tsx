import type { Metadata } from "next";
import Link from "next/link";
import { siteConfig } from "@/lib/site-config";

export const metadata: Metadata = { title: "Conditions d'utilisation", description: "Les règles d'utilisation du site DROPS." };

export default function TermsPage() {
  return <main className="subpage site-shell legal-page">
    <header className="subpage-header"><Link href="/" className="brand">DROPS<span className="brand-period">.</span></Link><Link href="/" className="back-link">← RETOUR AU SITE</Link></header>
    <section className="subpage-intro"><span className="section-index">LÉGAL</span><h1>Conditions <em>d&apos;utilisation</em></h1><p>Dernière mise à jour : {new Date().toLocaleDateString("fr-BE", { year: "numeric", month: "long" })}.</p></section>
    <div className="legal-content">
      <h2>1. Objet du service</h2>
      <p>{siteConfig.name} est un annuaire qui recense des offres de jeux et contenus gratuits publiées par des plateformes tierces. {siteConfig.name} ne vend, n&apos;héberge et ne distribue aucun jeu : chaque offre redirige vers le site officiel de la plateforme concernée pour la récupérer.</p>

      <h2>2. Exactitude des offres</h2>
      <p>Nous mettons tout en œuvre pour que les informations affichées (prix, disponibilité, date d&apos;expiration) soient exactes et à jour, mais elles peuvent changer sans préavis du côté des plateformes tierces. {siteConfig.name} ne peut être tenu responsable d&apos;une offre expirée, modifiée ou indisponible au moment où tu cliques sur &quot;RÉCUPÉRER&quot;.</p>

      <h2>3. Comptes utilisateurs</h2>
      <p>La création d&apos;un compte est optionnelle et gratuite. Tu es responsable de la confidentialité de ton mot de passe. Nous nous réservons le droit de suspendre un compte en cas d&apos;usage abusif (tentatives d&apos;intrusion, spam, etc.).</p>

      <h2>4. Propriété intellectuelle</h2>
      <p>Les noms, logos et images des jeux et plateformes référencées appartiennent à leurs propriétaires respectifs et sont utilisés à titre purement informatif, pour identifier les offres. {siteConfig.name}, son logo et son design vous appartiennent en tant qu&apos;éditeur du site.</p>

      <h2>5. Limitation de responsabilité</h2>
      <p>{siteConfig.name} est fourni &quot;en l&apos;état&quot;, sans garantie d&apos;aucune sorte. Nous ne sommes pas responsables des dommages résultant de l&apos;utilisation du site ou de l&apos;indisponibilité d&apos;une offre listée.</p>

      <h2>6. Modification des présentes conditions</h2>
      <p>Ces conditions peuvent être mises à jour ; la date de dernière mise à jour est indiquée en haut de cette page.</p>

      <h2>7. Droit applicable</h2>
      <p>Ces conditions sont régies par le droit belge. Tout litige relève de la compétence des tribunaux belges.</p>

      <p className="legal-note">Ce document est un modèle général et ne constitue pas un avis juridique — avant un lancement public, fais-le relire par un professionnel du droit.</p>
    </div>
  </main>;
}
