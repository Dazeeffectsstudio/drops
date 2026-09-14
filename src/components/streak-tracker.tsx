"use client";

import { useEffect, useState } from "react";
import { recordDailyVisitAction } from "@/app/streak-actions";

const CHECKED_KEY = "drops-streak-checked";

// Enregistre une visite par jour et par appareil (pas de lecture de session
// ici : la Server Action recordDailyVisitAction() vérifie elle-même la
// connexion et ne fait rien pour un visiteur anonyme — voir la note dans
// src/components/mobile-nav.tsx sur pourquoi la session ne se lit jamais
// dans un composant monté au niveau du layout racine).
export function StreakTracker() {
  const [streak, setStreak] = useState<number | null>(null);

  useEffect(() => {
    const today = new Date().toISOString().slice(0, 10);
    if (localStorage.getItem(CHECKED_KEY) === today) return;
    recordDailyVisitAction()
      .then((result) => {
        localStorage.setItem(CHECKED_KEY, today);
        if (result?.increased && result.currentStreak > 1) setStreak(result.currentStreak);
      })
      .catch(() => { /* échec silencieux : le streak n'est pas une fonctionnalité critique */ });
  }, []);

  if (streak === null) return null;
  return <div className="streak-toast" role="status">
    🔥 <strong>{streak}</strong> jours de suite sur DROPS !
    <button type="button" onClick={() => setStreak(null)} aria-label="Fermer">×</button>
  </div>;
}
