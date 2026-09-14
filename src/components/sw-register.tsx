"use client";

import { useEffect } from "react";

// Enregistre le Service Worker pour tout le monde (pas seulement les
// personnes qui activent les notifications push, contrairement à avant) :
// c'est ce qui rend le site installable et consultable hors ligne (voir
// public/sw.js). push-notification-toggle.tsx appelle aussi register("/sw.js")
// de son côté — un second appel avec la même URL est sans effet, il
// réutilise l'enregistrement existant. public/sw.js désactive lui-même tout
// le cache hors ligne sur localhost (voir la note dans ce fichier) : rien à
// gérer ici, l'enregistrement est identique en dev et en production.
export function ServiceWorkerRegister() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;
    navigator.serviceWorker.register("/sw.js").catch(() => { /* PWA non critique : échec silencieux (ex. navigation privée) */ });
  }, []);

  return null;
}
