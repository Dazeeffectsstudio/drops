"use client";

import { useEffect, useState } from "react";
import type { AuthUser } from "@/lib/auth";
import type { Offer } from "@/types/offer";
import { useFavorites } from "@/lib/favorites";
import { offerExpiresAt } from "@/lib/offers";
import { OfferCard } from "./offer-card";

// Grille interactive (favoris fonctionnels) pour /free-games-this-week —
// isolée dans son propre Client Component car les gestionnaires d'événements
// de OfferCard ne peuvent pas être définis dans le Server Component parent
// (les fonctions ne traversent pas la frontière serveur/client, sauf les
// Server Actions).
export function WeekOfferGrid({ offers, user, initialFavorites }: { offers: Offer[]; user: AuthUser | null; initialFavorites: string[] }) {
  const { favorites, toggleFavorite } = useFavorites(user?.id ?? null, initialFavorites);
  const [notice, setNotice] = useState<string | null>(null);
  // `now` démarre à null pour que le premier rendu client corresponde
  // exactement au rendu serveur (voir le même pattern dans drops-home.tsx) :
  // appeler Date.now() directement pendant le rendu causait un hydration
  // mismatch, l'horodatage serveur et client différant de quelques ms.
  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    setNow(Date.now());
    const interval = window.setInterval(() => setNow(Date.now()), 30_000);
    return () => window.clearInterval(interval);
  }, []);

  return <>
    <div className="offer-grid">
      {offers.map((offer) => <OfferCard
        key={offer.id}
        offer={offer}
        expiresAt={offerExpiresAt(offer)}
        now={now}
        favorite={favorites.includes(offer.id)}
        onFavorite={() => toggleFavorite(offer.id)}
        onClaim={() => setNotice(`${offer.title} est une offre de démonstration. Aucun lien de récupération n’est encore disponible.`)}
      />)}
    </div>
    {notice && <div className="notice" role="status"><p>{notice}</p><button type="button" onClick={() => setNotice(null)} aria-label="Fermer le message">×</button></div>}
  </>;
}
