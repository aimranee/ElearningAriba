"use client";
/* why (brief §J1): the page-wide background layer — dot grid, two drifting
   auroras, and a cursor-following glow. Mounted once by page.tsx (the
   landing only), fixed behind every section's z-[1] content. The native
   cursor stays untouched (founder decision 2026-09-07) — only the glow
   follows the pointer, via a single passive `pointermove` listener on
   `window` feeding one rAF-driven lerp loop that stops itself once the glow
   is within half a pixel of its target. The transform is written straight
   to the glow's ref on every frame, never through React state, so the loop
   never re-renders. Auroras and the glow mount only under
   `(pointer: fine)` and outside `prefers-reduced-motion` — otherwise the
   dot grid renders alone, static, and no listener attaches (D-39 budget). */

import { useEffect, useRef, useState } from "react";

const LERP_FACTOR = 0.08;
const STOP_THRESHOLD = 0.5;

function Atmosphere() {
  const [motionEnabled, setMotionEnabled] = useState(false);
  const glowRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const fine = window.matchMedia("(pointer: fine)").matches;
    if (reduced || !fine) return;
    setMotionEnabled(true);
  }, []);

  useEffect(() => {
    if (!motionEnabled) return;
    const glow = glowRef.current;
    if (!glow) return;

    let tx = window.innerWidth / 2;
    let ty = window.innerHeight / 2;
    let gx = tx;
    let gy = ty;
    let frameId = 0;
    let seen = false;

    function tick() {
      gx += (tx - gx) * LERP_FACTOR;
      gy += (ty - gy) * LERP_FACTOR;
      glow!.style.transform = `translate(${gx}px, ${gy}px)`;
      if (Math.abs(tx - gx) + Math.abs(ty - gy) > STOP_THRESHOLD) {
        frameId = requestAnimationFrame(tick);
      } else {
        frameId = 0;
      }
    }

    function onPointerMove(event: PointerEvent) {
      tx = event.clientX;
      ty = event.clientY;
      if (!seen) {
        seen = true;
        gx = tx;
        gy = ty;
        glow!.style.opacity = "1";
      }
      if (!frameId) frameId = requestAnimationFrame(tick);
    }

    function onMouseLeave() {
      glow!.style.opacity = "0";
    }

    function onMouseEnter() {
      if (seen) glow!.style.opacity = "1";
    }

    window.addEventListener("pointermove", onPointerMove, { passive: true });
    document.documentElement.addEventListener("mouseleave", onMouseLeave);
    document.documentElement.addEventListener("mouseenter", onMouseEnter);

    return () => {
      window.removeEventListener("pointermove", onPointerMove);
      document.documentElement.removeEventListener("mouseleave", onMouseLeave);
      document.documentElement.removeEventListener("mouseenter", onMouseEnter);
      if (frameId) cancelAnimationFrame(frameId);
    };
  }, [motionEnabled]);

  return (
    <div
      data-slot="atmosphere"
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden"
    >
      <span
        data-slot="atmosphere-grid"
        className="absolute inset-0 opacity-[.55]"
        style={{
          backgroundImage: "radial-gradient(circle, var(--grid-dot) 1px, transparent 1.5px)",
          backgroundSize: "22px 22px",
        }}
      />
      {motionEnabled ? (
        <>
          <span
            data-slot="atmosphere-aurora-a1"
            className="absolute -top-[28vw] -left-[22vw] size-[70vw] max-h-[980px] max-w-[980px] rounded-full blur-[40px]"
            style={{
              background: "radial-gradient(circle, rgba(99,91,255,.14), transparent 62%)",
              animation: "drift1 34s var(--ease-brand) infinite alternate",
            }}
          />
          <span
            data-slot="atmosphere-aurora-a2"
            className="absolute -right-[26vw] -bottom-[30vw] size-[70vw] max-h-[980px] max-w-[980px] rounded-full blur-[40px]"
            style={{
              background: "radial-gradient(circle, rgba(15,126,166,.11), transparent 62%)",
              animation: "drift2 42s var(--ease-brand) infinite alternate",
            }}
          />
          <span
            ref={glowRef}
            data-slot="atmosphere-glow"
            className="absolute top-0 left-0 -m-[360px] size-[720px] rounded-full opacity-0 transition-opacity duration-[400ms] ease-[var(--ease-brand)]"
            style={{
              background: "radial-gradient(circle, rgba(99,91,255,.16), transparent 60%)",
            }}
          />
        </>
      ) : null}
    </div>
  );
}

export { Atmosphere };
