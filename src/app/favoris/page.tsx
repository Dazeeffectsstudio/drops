import type { Metadata } from "next";
import { FavoritesPage } from "@/components/favorites-page";
import { getAllOffers } from "@/lib/offers-repository";

export const metadata: Metadata = { title: "Mes favoris — DROPS" };

export default async function Favorites() {
  const offers = await getAllOffers();
  return <FavoritesPage offers={offers} />;
}
