"use client";

import { useEffect } from "react";
import { applyStoredAccessibilityPrefs } from "@/lib/accessibility-prefs";

// Réapplique les préférences choisies via les interrupteurs du pied de
// page (réduire les animations / contraste élevé) au montage de chaque
// page — sans ça, un réglage fait depuis l'accueil ne s'appliquerait pas
// si le visiteur revient plus tard directement sur une autre page.
export function AccessibilityInit() {
  useEffect(() => {
    applyStoredAccessibilityPrefs();
  }, []);

  return null;
}
