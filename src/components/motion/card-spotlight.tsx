"use client";
/* why (D-100): mirrors hero-spotlight.tsx's pattern exactly — the halo tracks
   the cursor only inside its own card, resolved via `closest()`, never
   `window`. AC-7-style requirement: ABSENT under reduced motion, not merely
   frozen — the effect never attaches a listener and globals.css hides the
   node outright via display:none. rAF-throttled like mesh-drift.tsx so at
   most one style write happens per frame. */

import { useEffect, useRef } from "react";

function CardSpotlight() {
  const spotRef = useRef<HTMLSpanElement>(null);
  const glowRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    const spot = spotRef.current;
    const glow = glowRef.current;
    const card = spot?.closest<HTMLElement>('[data-slot="card"]');
    if (!spot || !glow || !card) {
      return;
    }

    let pending = false;
    let frameId = 0;

    const onMouseMove = (event: MouseEvent) => {
      if (!pending) {
        pending = true;
        frameId = requestAnimationFrame(() => {
          const rect = card.getBoundingClientRect();
          glow.style.left = `${event.clientX - rect.left}px`;
          glow.style.top = `${event.clientY - rect.top}px`;
          pending = false;
        });
      }
    };

    card.addEventListener("mousemove", onMouseMove, { passive: true });
    return () => {
      card.removeEventListener("mousemove", onMouseMove);
      cancelAnimationFrame(frameId);
    };
  }, []);

  return (
    <span
      ref={spotRef}
      aria-hidden="true"
      data-slot="card-spotlight"
      className="pointer-events-none absolute inset-0 overflow-hidden rounded-[22px]"
    >
      <span
        ref={glowRef}
        className="absolute size-[260px] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-10"
        style={{
          background: "radial-gradient(circle, var(--tuile-a) 0%, transparent 62%)",
        }}
      />
    </span>
  );
}

export { CardSpotlight };
