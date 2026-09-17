"use client";

import { useEffect, useRef, useState } from "react";

export function Reveal({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    // threshold bas + rootMargin négatif : se déclenche dès que le HAUT de
    // la section entre dans le viewport, plutôt qu'un pourcentage de sa
    // propre hauteur totale. Un seuil comme 0.15 (15% de la hauteur de
    // l'élément visible) ne se déclenche JAMAIS pour une section très haute
    // (ex. la grille complète des offres, des milliers de px) puisque ce
    // pourcentage ne peut pas tenir dans un viewport normal — bug réel
    // observé en prod, la section restait invisible en permanence.
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0, rootMargin: "0px 0px -10% 0px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return <div ref={ref} className={`scroll-reveal ${visible ? "scroll-reveal--visible" : ""} ${className}`}>{children}</div>;
}
