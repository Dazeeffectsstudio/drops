import type { Metadata } from "next";
import { FavoritesPage } from "@/components/favorites-page";
import { getCurrentUser } from "@/lib/auth";
import { getCurrentFavoritesState } from "@/lib/favorites-repository";
import { getAllOffers } from "@/lib/offers-repository";

export const metadata: Metadata = { title: "Mes favoris — DROPS" };

export default async function Favorites() {
  const [offers, user, { favorites }] = await Promise.all([getAllOffers(), getCurrentUser(), getCurrentFavoritesState()]);
  return <FavoritesPage offers={offers} user={user} initialFavorites={favorites} />;
}
