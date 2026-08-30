"use client";
/* why (D-11/D-39): the 600px violet radial glow tracks the cursor only
   inside the hero — the listener is resolved via the hero's own
   data-slot="hero" element (closest()), never `window`, so this stays one of
   exactly two pointer listeners the motion budget allows site-wide (the
   other is the root mesh drift, plan 02-03). AC-7 requires the spotlight
   ABSENT under reduced motion, not merely frozen — the effect never attaches
   a listener, and globals.css hides the node outright via display:none. */

import { useEffect, useRef } from "react";

function HeroSpotlight() {
  const spotRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    const spot = spotRef.current;
    const hero = spot?.closest<HTMLElement>('[data-slot="hero"]');
    if (!spot || !hero) {
      return;
    }

    const onMouseMove = (event: MouseEvent) => {
      const rect = hero.getBoundingClientRect();
      spot.style.left = `${event.clientX - rect.left}px`;
      spot.style.top = `${event.clientY - rect.top}px`;
      spot.style.opacity = "1";
    };
    const onMouseLeave = () => {
      spot.style.opacity = "0";
    };

    hero.addEventListener("mousemove", onMouseMove, { passive: true });
    hero.addEventListener("mouseleave", onMouseLeave);
    return () => {
      hero.removeEventListener("mousemove", onMouseMove);
      hero.removeEventListener("mouseleave", onMouseLeave);
    };
  }, []);

  return (
    <span
      ref={spotRef}
      aria-hidden="true"
      data-slot="hero-spotlight"
      className="pointer-events-none absolute z-0 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-0 transition-opacity duration-[400ms] ease-[var(--ease-brand)]"
      style={{
        background: "radial-gradient(circle, rgba(99,91,255,.16), transparent 60%)",
      }}
    />
  );
}

export { HeroSpotlight };
