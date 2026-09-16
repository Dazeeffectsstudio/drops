import type { CSSProperties } from "react";

// Petite explosion de particules affichée quand on clique "Récupérer" — la
// même sur la bannière vedette et la page de détail, d'où l'extraction ici
// plutôt que de dupliquer le calcul trigonométrique dans chaque composant.
export function buildBurstDots(count = 10): CSSProperties[] {
  return Array.from({ length: count }, (_, index) => {
    const angle = (Math.PI * 2 * index) / count;
    const distance = 40 + (index % 3) * 9;
    return { "--bx": `${Math.cos(angle) * distance}px`, "--by": `${Math.sin(angle) * distance}px` } as CSSProperties;
  });
}
