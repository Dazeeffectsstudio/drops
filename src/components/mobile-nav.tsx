"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BellIcon, HeartIcon, HomeIcon, SearchIcon, UserIcon } from "./icons";

// Barre de navigation mobile fixe (Accueil / Recherche / Favoris /
// Notifications / Compte) — cachée sur desktop (CSS) et sur /admin (déjà
// sa propre navigation dédiée, pas d'espace pour une barre en plus).
//
// Volontairement sans état de connexion ici : ce composant est monté dans
// le layout racine, donc lire la session (cookies()) à cet endroit
// forcerait TOUT le site en rendu dynamique et casserait la génération
// statique des pages plateforme/catégorie. "Compte" pointe simplement vers
// /account, qui redirige déjà vers /login si besoin.
export function MobileNav() {
  const pathname = usePathname();
  if (pathname.startsWith("/admin")) return null;

  const isActive = (href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href));

  return <nav className="mobile-nav" aria-label="Navigation mobile">
    <Link href="/" className={isActive("/") ? "active" : ""}>
      <span className="mobile-nav-icon"><HomeIcon /></span>
      <span>Accueil</span>
    </Link>
    <Link href="/#offer-search" className={isActive("/categories") ? "active" : ""}>
      <span className="mobile-nav-icon"><SearchIcon /></span>
      <span>Recherche</span>
    </Link>
    <Link href="/favoris" className={isActive("/favoris") ? "active" : ""}>
      <span className="mobile-nav-icon"><HeartIcon /></span>
      <span>Favoris</span>
    </Link>
    <Link href="/notifications" className={isActive("/notifications") ? "active" : ""}>
      <span className="mobile-nav-icon"><BellIcon /></span>
      <span>Alertes</span>
    </Link>
    <Link href="/account" className={isActive("/account") || isActive("/login") ? "active" : ""}>
      <span className="mobile-nav-icon"><UserIcon /></span>
      <span>Compte</span>
    </Link>
  </nav>;
}
