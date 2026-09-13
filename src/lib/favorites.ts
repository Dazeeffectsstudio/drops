"use client";

import { useEffect, useState } from "react";

export const favoriteStorageKey = "drops-demo-favorites";

export function useFavorites() {
  const [favorites, setFavorites] = useState<string[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(favoriteStorageKey) ?? "[]");
      if (Array.isArray(saved)) setFavorites(saved.filter((item): item is string => typeof item === "string"));
    } catch { /* Les données locales invalides sont ignorées. */ }
    setReady(true);
  }, []);

  function toggleFavorite(id: string) {
    setFavorites((current) => {
      const next = current.includes(id) ? current.filter((item) => item !== id) : [...current, id];
      localStorage.setItem(favoriteStorageKey, JSON.stringify(next));
      return next;
    });
  }

  return { favorites, ready, toggleFavorite };
}
