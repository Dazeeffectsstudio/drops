import Link from "next/link";
import { ArrowIcon } from "@/components/icons";

export const metadata = { title: "Page introuvable" };

export default function NotFound() {
  return <main className="subpage site-shell">
    <header className="subpage-header">
      <Link href="/" className="brand">DROPS<span className="brand-period">.</span></Link>
      <Link href="/" className="back-link">← RETOUR AUX OFFRES</Link>
    </header>
    <section className="subpage-intro">
      <span className="section-index">ERREUR 404</span>
      <h1>Cette page a <em>expiré</em>.</h1>
      <p>Le lien que tu as suivi ne mène nulle part — comme une offre récupérée trop tard.</p>
    </section>
    <div className="empty-state">
      <span>∅</span>
      <h3>Rien à voir ici.</h3>
      <p>Mais il y a sûrement de vraies offres gratuites qui t&apos;attendent sur l&apos;accueil.</p>
      <Link href="/" className="empty-link">RETOUR À L&apos;ACCUEIL <ArrowIcon /></Link>
    </div>
  </main>;
}
