import Link from "next/link";
import type { AuthUser } from "@/lib/auth";

// Lien de connexion/compte réutilisé dans tous les en-têtes du site
// (accueil, favoris, détail d'offre, pages plateforme/catégorie).
export function AccountNavLink({ user }: { user: AuthUser | null }) {
  if (!user) return <Link href="/login" className="account-link">CONNEXION</Link>;
  const initial = (user.email ?? "?").charAt(0).toUpperCase();
  return <Link href="/account" className="account-link account-link--connected" aria-label="Mon compte">
    {user.avatarUrl ? <img src={user.avatarUrl} alt="" className="account-avatar" /> : <span className="account-avatar account-avatar--fallback">{initial}</span>}
  </Link>;
}
