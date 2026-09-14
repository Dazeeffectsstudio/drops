"use client";

// Fine couche au-dessus de gtag/Plausible : n'envoie strictement rien si
// aucun des deux n'est chargé (voir config.ts et analytics-scripts.tsx).
// Le reste du code (ex: le clic sur "RÉCUPÉRER") appelle uniquement
// trackEvent, jamais gtag/plausible directement.

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    plausible?: (eventName: string, options?: { props?: Record<string, string | number> }) => void;
  }
}

export function trackPageView(url: string): void {
  if (typeof window === "undefined") return;
  window.gtag?.("event", "page_view", { page_path: url });
  window.plausible?.("pageview");
}

export function trackEvent(name: string, params: Record<string, string | number> = {}): void {
  if (typeof window === "undefined") return;
  window.gtag?.("event", name, params);
  window.plausible?.(name, { props: params });
}
