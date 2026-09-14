"use client";

import { useEffect, useState } from "react";

// Bandeau discret affiché quand le navigateur détecte une perte de
// connexion — les pages consultées restent visibles (servies par le
// Service Worker, voir public/sw.js) mais peuvent ne plus être à jour.
// `offline` démarre à false pour que le premier rendu client corresponde
// au rendu serveur (toujours "en ligne" côté serveur) — voir la même
// technique dans drops-home.tsx pour `now`.
export function OfflineBanner() {
  const [offline, setOffline] = useState(false);

  useEffect(() => {
    setOffline(!navigator.onLine);
    const goOffline = () => setOffline(true);
    const goOnline = () => setOffline(false);
    window.addEventListener("offline", goOffline);
    window.addEventListener("online", goOnline);
    return () => { window.removeEventListener("offline", goOffline); window.removeEventListener("online", goOnline); };
  }, []);

  if (!offline) return null;
  return <div className="offline-banner" role="status">
    📡 Tu es hors ligne — ce que tu vois peut ne plus être à jour.
  </div>;
}
