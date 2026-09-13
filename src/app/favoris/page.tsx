import type { Metadata } from "next";
import { FavoritesPage } from "@/components/favorites-page";

export const metadata: Metadata = { title: "Mes favoris — DROPS" };
export default function Favorites() { return <FavoritesPage />; }
