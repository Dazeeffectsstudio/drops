const REDUCE_MOTION_KEY = "drops-reduce-motion";
const HIGH_CONTRAST_KEY = "drops-high-contrast";

function readStored(key: string): boolean {
  try {
    return localStorage.getItem(key) === "1";
  } catch {
    return false;
  }
}

// Applique les deux préférences (stockées côté client) à <html> — appelé
// au montage sur chaque page pour que le réglage choisi une fois reste
// actif partout sur le site, pas seulement sur la page où se trouvent les
// interrupteurs.
export function applyStoredAccessibilityPrefs() {
  document.documentElement.toggleAttribute("data-reduce-motion", readStored(REDUCE_MOTION_KEY));
  document.documentElement.toggleAttribute("data-high-contrast", readStored(HIGH_CONTRAST_KEY));
}

export function isReduceMotionEnabled(): boolean {
  return readStored(REDUCE_MOTION_KEY);
}

export function isHighContrastEnabled(): boolean {
  return readStored(HIGH_CONTRAST_KEY);
}

export function setReduceMotion(enabled: boolean) {
  try { localStorage.setItem(REDUCE_MOTION_KEY, enabled ? "1" : "0"); } catch { /* stockage indisponible (navigation privée) : le reglage ne persiste juste pas */ }
  document.documentElement.toggleAttribute("data-reduce-motion", enabled);
}

export function setHighContrast(enabled: boolean) {
  try { localStorage.setItem(HIGH_CONTRAST_KEY, enabled ? "1" : "0"); } catch { /* idem */ }
  document.documentElement.toggleAttribute("data-high-contrast", enabled);
}
