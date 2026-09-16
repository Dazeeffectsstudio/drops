"use client";

import { useEffect, useState } from "react";
import { trackEvent } from "@/lib/analytics/track";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

// Bouton "Installer DROPS" — n'apparaît que si une installation est
// réellement possible :
// - Android / Chrome / Edge desktop : le navigateur émet
//   `beforeinstallprompt` quand les critères PWA sont remplis (manifest +
//   Service Worker actif, voir sw-register.tsx) ; on intercepte l'invite
//   native pour la déclencher nous-mêmes au clic.
// - iOS Safari ne déclenche jamais cet événement (pas d'API d'installation
//   programmatique) : on affiche à la place une instruction manuelle
//   ("Partager → Sur l'écran d'accueil").
// - Rien ne s'affiche si le site tourne déjà en mode installé
//   (display-mode: standalone) ou si aucun des deux cas ci-dessus ne
//   s'applique (ex. navigateur qui ne supporte pas les PWA).
export function InstallPwaButton({ variant = "default" }: { variant?: "default" | "compact" }) {
  const [installEvent, setInstallEvent] = useState<BeforeInstallPromptEvent | null>(null);
  const [isIos, setIsIos] = useState(false);
  const [installed, setInstalled] = useState(true);
  const [showIosHint, setShowIosHint] = useState(false);

  useEffect(() => {
    const standalone = window.matchMedia("(display-mode: standalone)").matches || (navigator as unknown as { standalone?: boolean }).standalone === true;
    setInstalled(standalone);
    setIsIos(/iphone|ipad|ipod/i.test(navigator.userAgent));

    function handlePrompt(event: Event) {
      event.preventDefault();
      setInstallEvent(event as BeforeInstallPromptEvent);
    }
    function handleInstalled() {
      setInstalled(true);
      setInstallEvent(null);
      trackEvent("pwa_install", { outcome: "installed" });
    }
    window.addEventListener("beforeinstallprompt", handlePrompt);
    window.addEventListener("appinstalled", handleInstalled);
    return () => { window.removeEventListener("beforeinstallprompt", handlePrompt); window.removeEventListener("appinstalled", handleInstalled); };
  }, []);

  if (installed) return null;
  if (!installEvent && !isIos) return null;

  async function handleClick() {
    if (isIos) { setShowIosHint((current) => !current); return; }
    if (!installEvent) return;
    trackEvent("pwa_install", { outcome: "prompted" });
    await installEvent.prompt();
    const choice = await installEvent.userChoice;
    trackEvent("pwa_install", { outcome: choice.outcome });
    setInstallEvent(null);
  }

  return <div className={`install-pwa ${variant === "compact" ? "install-pwa--compact" : ""}`}>
    <button type="button" className="install-pwa-button" onClick={handleClick} aria-label="Installer DROPS">
      {variant === "compact" ? "📲" : "📲 Installer DROPS"}
    </button>
    {showIosHint && <p className="install-pwa-hint">Appuie sur <strong>Partager</strong> puis <strong>« Sur l&apos;écran d&apos;accueil »</strong>.</p>}
  </div>;
}
