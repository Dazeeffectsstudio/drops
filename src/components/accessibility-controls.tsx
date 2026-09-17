"use client";

import { useEffect, useState } from "react";
import { isHighContrastEnabled, isReduceMotionEnabled, setHighContrast, setReduceMotion } from "@/lib/accessibility-prefs";

export function AccessibilityControls() {
  const [reduceMotion, setReduceMotionState] = useState(false);
  const [highContrast, setHighContrastState] = useState(false);

  useEffect(() => {
    setReduceMotionState(isReduceMotionEnabled());
    setHighContrastState(isHighContrastEnabled());
  }, []);

  return <div className="accessibility-controls">
    <button type="button" className={reduceMotion ? "active" : ""} aria-pressed={reduceMotion} onClick={() => { const next = !reduceMotion; setReduceMotion(next); setReduceMotionState(next); }}>
      Réduire les animations
    </button>
    <button type="button" className={highContrast ? "active" : ""} aria-pressed={highContrast} onClick={() => { const next = !highContrast; setHighContrast(next); setHighContrastState(next); }}>
      Contraste élevé
    </button>
  </div>;
}
