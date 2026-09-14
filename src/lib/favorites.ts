"use client";

import { useEffect, useState } from "react";
import { toggleFavoriteAction } from "@/app/favorites-actions";
import { trackEvent } from "@/lib/analytics/track";

export const favoriteStorageKey = "drops-demo-favorites";

// Deux modes : compte connecté → favoris en base (Supabase), sinon →
// localStorage comme avant V7. `userId`/`initialFavorites` viennent du
// Server Component parent (voir src/app/page.tsx) ; sans eux, le hook se
// comporte exactement comme avant (localStorage uniquement).
export function useFavorites(userId: string | null = null, initialFavorites: string[] = []) {
  const [favorites, setFavorites] = useState<string[]>(initialFavorites);
  const [ready, setReady] = useState(Boolean(userId));

  useEffect(() => {
    if (userId) {
      setFavorites(initialFavorites);
      setReady(true);
      return;
    }
    try {
      const saved = JSON.parse(localStorage.getItem(favoriteStorageKey) ?? "[]");
      if (Array.isArray(saved)) setFavorites(saved.filter((item): item is string => typeof item === "string"));
    } catch { /* Les données locales invalides sont ignorées. */ }
    setReady(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  function toggleFavorite(id: string) {
    setFavorites((current) => {
      const adding = !current.includes(id);
      const next = adding ? [...current, id] : current.filter((item) => item !== id);
      trackEvent("favorite_toggle", { offerId: id, action: adding ? "add" : "remove" });
      if (userId) {
        toggleFavoriteAction(id).catch(() => { /* échec silencieux : l'état local reste optimiste */ });
      } else {
        localStorage.setItem(favoriteStorageKey, JSON.stringify(next));
      }
      return next;
    });
  }

  return { favorites, ready, toggleFavorite };
}
