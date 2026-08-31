"use client";
/* why: the assembly card's 3 bezier connectors are literal, hand-written
   paths — never computed from element positions, never recomputed on
   resize (rejected 2026-08-28, reaffirmed 2026-08-31). Re-anchored
   2026-08-31 onto the pastilles' right edge and the violet card's left
   edge as measured at 1440px, after the original coordinates were found
   ported unchanged from cta-final.tsx's old column split. This island
   only adds a progressive stroke-trace on viewport entry
   (IntersectionObserver, once) plus a small comet per path, modeled on
   typewriter.tsx's pattern: refs + a single useEffect, direct DOM style
   writes, matchMedia reduced-motion check, no useState-driven per-frame
   writes. */

import { useEffect, useRef } from "react";

const PATHS = [
  { id: "asm-w1", d: "M44.6 18 C 49.2 18, 48 50, 52 50", from: "var(--violet)" },
  { id: "asm-w2", d: "M44.6 50 C 48.6 50, 48.6 50, 52 50", from: "var(--amber)" },
  { id: "asm-w3", d: "M44.6 82 C 49.2 82, 48 50, 52 50", from: "var(--mint)" },
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
      className="pointer-events-none absolute inset-0 z-[2] size-full"
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
    >
      <defs>
        {PATHS.map((path) => (
          <linearGradient key={path.id} id={path.id} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor={path.from} stopOpacity=".9" />
            <stop offset="40%" stopColor="var(--card)" stopOpacity=".95" />
            <stop offset="100%" stopColor="var(--card)" stopOpacity=".95" />
          </linearGradient>
        ))}
      </defs>
      {PATHS.map((path, index) => (
        <path
          key={path.id}
          ref={(el) => {
            pathRefs.current[index] = el;
          }}
          d={path.d}
          fill="none"
          stroke={`url(#${path.id})`}
          strokeWidth="2"
          vectorEffect="non-scaling-stroke"
        />
      ))}
      {PATHS.map((path, index) => (
        <circle
          key={`${path.id}-comet`}
          ref={(el) => {
            cometRefs.current[index] = el;
          }}
          r="1.4"
          fill="var(--card)"
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
