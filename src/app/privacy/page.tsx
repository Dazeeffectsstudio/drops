import type { Metadata } from "next";
import Link from "next/link";
import { siteConfig } from "@/lib/site-config";

export const metadata: Metadata = { title: "Politique de confidentialité", description: "Comment DROPS collecte, utilise et protège tes données personnelles." };

export default function PrivacyPage() {
  return <main className="subpage site-shell legal-page">
    <header className="subpage-header"><Link href="/" className="brand">DROPS<span className="brand-period">.</span></Link><Link href="/" className="back-link">← Retour au site</Link></header>
    <section className="subpage-intro"><h1>Politique de <em>confidentialité</em></h1><p>Dernière mise à jour : {new Date().toLocaleDateString("fr-BE", { year: "numeric", month: "long" })}.</p></section>
    <div className="legal-content">
      <h2>1. Qui sommes-nous ?</h2>
      <p>{siteConfig.name} ({siteConfig.tagline}) est un service qui recense des offres de jeux et contenus gratuits publiées par des plateformes tierces (Epic Games, Steam, PlayStation, Xbox, Twitch, Roblox, Prime Gaming). Nous sommes basés en {siteConfig.country} et cette politique est conçue pour respecter le Règlement Général sur la Protection des Données (RGPD).</p>

      <h2>2. Quelles données collectons-nous ?</h2>
      <p>Si tu ne crées pas de compte, nous ne collectons aucune donnée personnelle : tes favoris sont stockés uniquement dans ton navigateur (localStorage), jamais transmis à nos serveurs.</p>
      <p>Si tu crées un compte (email/mot de passe, Google), nous collectons&nbsp;: ton adresse email, un identifiant de compte, et — si tu les renseignes — tes préférences de plateformes/catégories et de notifications. Si tu actives les notifications push, ton navigateur nous transmet un identifiant d&apos;abonnement push technique (aucune donnée personnelle supplémentaire).</p>

      <h2>3. Pourquoi utilisons-nous ces données ?</h2>
      <ul>
        <li>Te permettre de te connecter et de retrouver tes favoris sur tous tes appareils.</li>
        <li>T&apos;envoyer les notifications que tu as explicitement activées (nouvelles offres, rappels d&apos;expiration).</li>
        <li>Assurer la sécurité du service (empêcher les abus, protéger le tableau de bord administrateur).</li>
      </ul>
      <p>Nous ne vendons ni ne partageons jamais tes données avec des tiers à des fins publicitaires.</p>

      <h2>4. Qui traite ces données pour nous ?</h2>
      <ul>
        <li><strong>Supabase</strong> (hébergement de la base de données et authentification).</li>
        <li><strong>Resend</strong> (envoi des emails de notification, uniquement si tu les as activés).</li>
      </ul>

      <h2>5. Combien de temps conservons-nous tes données ?</h2>
      <p>Tant que ton compte existe. Tu peux demander la suppression de ton compte et de toutes les données associées à tout moment en nous contactant (voir <Link href="/contact">la page contact</Link>).</p>

      <h2>6. Tes droits</h2>
      <p>Conformément au RGPD, tu disposes d&apos;un droit d&apos;accès, de rectification, d&apos;effacement, de limitation et de portabilité de tes données, ainsi que du droit de retirer ton consentement à tout moment (par exemple en désactivant les notifications dans tes réglages). Pour exercer ces droits, contacte-nous à <a href={`mailto:${siteConfig.contactEmail}`}>{siteConfig.contactEmail}</a>.</p>

      <h2>7. Cookies et stockage local</h2>
      <p>{siteConfig.name} utilise uniquement le stockage local de ton navigateur (localStorage) pour retenir tes favoris si tu n&apos;as pas de compte, et un cookie de session technique si tu es connecté (nécessaire au fonctionnement du compte, pas de traçage publicitaire). Si des outils de mesure d&apos;audience sont activés, ils ne fonctionnent qu&apos;avec ton consentement implicite d&apos;usage du site et ne collectent pas de données personnelles identifiables.</p>

      <p className="legal-note">Ce document est un modèle général et ne constitue pas un avis juridique — avant un lancement public, fais-le relire par un professionnel du droit pour t&apos;assurer qu&apos;il correspond exactement à ton usage réel des données.</p>
    </div>
  </main>;
}
