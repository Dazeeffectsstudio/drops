"use client";

import { useState, type MouseEvent } from "react";

// Bascule 3D légère au survol (cartes d'offres, bannière de détail) —
// centralisé ici pour éviter de dupliquer la même logique de calcul
// d'angle dans chaque composant qui l'utilise.
export function useTilt(strength = 8) {
  const [tilt, setTilt] = useState({ rx: 0, ry: 0 });

  function onMove(event: MouseEvent<HTMLElement>) {
    const rect = event.currentTarget.getBoundingClientRect();
    const px = (event.clientX - rect.left) / rect.width - 0.5;
    const py = (event.clientY - rect.top) / rect.height - 0.5;
    setTilt({ rx: py * -strength, ry: px * strength });
  }

  function onLeave() {
    setTilt({ rx: 0, ry: 0 });
  }

  return { tiltStyle: { transform: `perspective(700px) rotateX(${tilt.rx}deg) rotateY(${tilt.ry}deg)` }, onMove, onLeave };
}
