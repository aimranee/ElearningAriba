"use client";
/* why: the assembly card's 3 connectors are literal, hand-written paths —
   never computed from element positions, never recomputed on resize
   (rejected 2026-08-28, reaffirmed 2026-08-31). Per the 2026-08-31
   mechanics brief, cables now stop short of the card at x≈47.8 and
   terminate on a small static node instead of crossing onto the card's
   surface — the white-at-40% gradient stop that once let them survive
   that crossing is now dead code, removed rather than preserved. This
   island only adds a progressive stroke-trace on viewport entry
   (IntersectionObserver, once) plus a small comet per path, modeled on
   typewriter.tsx's pattern: refs + a single useEffect, direct DOM style
   writes, matchMedia reduced-motion check, no useState-driven per-frame
   writes. */

import { useEffect, useRef } from "react";

const PATHS = [
  { id: "asm-w1", d: "M40.9 18 C 46.8 18, 46.8 50, 52.7 50", accent: "var(--violet)", cy: 18 },
  { id: "asm-w2", d: "M40.9 50 L 52.7 50", accent: "var(--amber)", cy: 50 },
  { id: "asm-w3", d: "M40.9 82 C 46.8 82, 46.8 50, 52.7 50", accent: "var(--mint)", cy: 82 },
] as const;

const TRACE_STAGGER_MS = 140;
const COMET_STAGGER_S = 0.5;

function AssemblyConnectors() {
  const svgRef = useRef<SVGSVGElement>(null);
  const pathRefs = useRef<(SVGPathElement | null)[]>([]);
  const cometRefs = useRef<(SVGCircleElement | null)[]>([]);

  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) {
      return;
    }

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (reduce) {
      pathRefs.current.forEach((path) => {
        if (!path) return;
        path.style.strokeDasharray = "none";
        path.style.strokeDashoffset = "0";
      });
      cometRefs.current.forEach((comet) => {
        if (!comet) return;
        comet.style.display = "none";
      });
      return;
    }

    const lengths = pathRefs.current.map((path) => (path ? path.getTotalLength() : 0));
    pathRefs.current.forEach((path, index) => {
      if (!path) return;
      const length = lengths[index];
      path.style.strokeDasharray = `${length}`;
      path.style.strokeDashoffset = `${length}`;
      path.style.transition = `stroke-dashoffset 1.1s var(--ease-brand)`;
      path.style.transitionDelay = `${index * TRACE_STAGGER_MS}ms`;
    });

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          pathRefs.current.forEach((path) => {
            if (!path) return;
            path.style.strokeDashoffset = "0";
          });
          cometRefs.current.forEach((comet) => {
            if (!comet) return;
            comet.style.opacity = "1";
          });
          observer.disconnect();
        });
      },
      { threshold: 0.4 }
    );

    observer.observe(svg);

    return () => {
      observer.disconnect();
    };
  }, []);

  return (
    <svg
      ref={svgRef}
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 hidden size-full sm:block"
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
    >
      {PATHS.map((path, index) => (
        <path
          key={path.id}
          ref={(el) => {
            pathRefs.current[index] = el;
          }}
          d={path.d}
          fill="none"
          stroke={path.accent}
          strokeWidth="2"
          vectorEffect="non-scaling-stroke"
        />
      ))}
      <circle cx={52.7} cy={50} r="1.6" fill="var(--violet)" />
      {PATHS.map((path, index) => (
        <circle
          key={`${path.id}-comet`}
          ref={(el) => {
            cometRefs.current[index] = el;
          }}
          r="1.4"
          fill={path.accent}
          style={{
            offsetPath: `path("${path.d}")`,
            animation: "comet 2.6s var(--ease-brand) infinite",
            animationDelay: `${index * COMET_STAGGER_S}s`,
            opacity: 0,
          }}
        />
      ))}
    </svg>
  );
}

export { AssemblyConnectors };
