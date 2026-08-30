"use client";
/* why: the mesh layer drifts with the cursor through exactly one
   rAF-throttled `mousemove` listener (D-13, D-39) — this is one of only two
   pointer listeners the motion budget allows site-wide, the other being the
   hero spotlight (plan 02-05). Renders nothing; it only mutates the DOM node
   the server-rendered AtmosphereLayer already produced. */

import { useEffect } from "react";

export function MeshDrift() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    const meshLayer = document.querySelector<HTMLElement>('[data-slot="mesh-layer"]');
    if (!meshLayer) {
      return;
    }

    let mx = 0;
    let my = 0;
    let pending = false;
    let frameId = 0;

    const onMouseMove = (e: MouseEvent) => {
      mx = (e.clientX / window.innerWidth - 0.5) * 34;
      my = (e.clientY / window.innerHeight - 0.5) * 34;
      if (!pending) {
        pending = true;
        frameId = requestAnimationFrame(() => {
          meshLayer.style.transform = `translate(${mx}px, ${my}px)`;
          pending = false;
        });
      }
    };

    window.addEventListener("mousemove", onMouseMove, { passive: true });
    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      cancelAnimationFrame(frameId);
    };
  }, []);

  return null;
}
