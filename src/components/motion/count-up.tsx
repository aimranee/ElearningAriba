"use client";
/* why (D-30/D-16): the server-rendered HTML already carries the correctly
   formatted `display` string (a crawler and prefers-reduced-motion both see
   the real figure immediately) — the observer only re-paints the visible
   text node from 0 up to the target once, on first intersection, then
   restores the formatted string and stops observing. */

import { useEffect, useRef } from "react";

const DURATION_MS = 1400;

interface CountUpProps {
  target: number;
  display: string;
}

function CountUp({ target, display }: CountUpProps) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) {
      return;
    }

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce || target === 0) {
      el.textContent = display;
      return;
    }

    let frameId = 0;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) {
            return;
          }
          observer.unobserve(entry.target);
          const start = performance.now();
          const step = (now: number) => {
            const progress = Math.min((now - start) / DURATION_MS, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            el.textContent = String(Math.round(target * eased));
            if (progress < 1) {
              frameId = requestAnimationFrame(step);
            } else {
              el.textContent = display;
            }
          };
          frameId = requestAnimationFrame(step);
        });
      },
      { threshold: 0.5 },
    );

    observer.observe(el);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(frameId);
    };
  }, [target, display]);

  return <span ref={ref}>{display}</span>;
}

export { CountUp };
