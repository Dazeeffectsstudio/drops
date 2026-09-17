"use client";

import { useEffect, useRef, useState } from "react";

// Anime un nombre de 0 vers sa valeur cible au montage — utilisé pour les
// quelques chiffres les plus visibles du site (compteurs du hero) plutôt
// que partout, pour que l'effet reste un moment plutôt qu'un tic générique.
export function useCountUp(target: number, durationMs = 1100): number {
  const [value, setValue] = useState(0);
  const targetRef = useRef(target);
  targetRef.current = target;

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setValue(targetRef.current);
      return;
    }
    let frame: number;
    let start: number | null = null;
    function tick(timestamp: number) {
      if (start === null) start = timestamp;
      const progress = Math.min(1, (timestamp - start) / durationMs);
      const eased = 1 - (1 - progress) ** 3;
      setValue(Math.round(targetRef.current * eased));
      if (progress < 1) frame = requestAnimationFrame(tick);
    }
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [target, durationMs]);

  return value;
}
