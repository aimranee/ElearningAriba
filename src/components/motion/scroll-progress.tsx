"use client";
/* why (D-18/D-39): the reading-position bar and the header's scrolled state
   share one rAF-throttled window scroll listener — D-39's Lighthouse budget
   caps the motion kit at one listener per effect, so both outputs ride the
   same throttle rather than each mounting their own. */

import { useEffect, useRef } from "react";

export function ScrollProgress() {
  const barRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const bar = barRef.current;
    const header = document.querySelector<HTMLElement>('[data-slot="site-header"]');
    if (!bar) return;

    let ticking = false;
    let frameId = 0;

    function apply() {
      const scrollableHeight = document.documentElement.scrollHeight - window.innerHeight;
      const percent = scrollableHeight > 0 ? (window.scrollY / scrollableHeight) * 100 : 0;
      bar!.style.width = `${percent}%`;

      // why (D-39): rail-sections.tsx's line-fill reads this custom property
      // instead of mounting its own scroll listener — one listener, two
      // consumers, same `percent` value.
      document.documentElement.style.setProperty("--scroll-p", `${percent}%`);

      // why: data-scrolled carries the value "true", not mere presence, so
      // Tailwind's data-[scrolled=true]: variant on the header can select it.
      if (window.scrollY > 12) {
        header?.setAttribute("data-scrolled", "true");
      } else {
        header?.removeAttribute("data-scrolled");
      }

      ticking = false;
    }

    function onScroll() {
      if (!ticking) {
        ticking = true;
        frameId = window.requestAnimationFrame(apply);
      }
    }

    // why: a restored scroll position (back-navigation, reload) must render
    // the correct bar width and header state on mount, not just on the next
    // scroll event.
    apply();
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.cancelAnimationFrame(frameId);
    };
  }, []);

  return (
    <div
      ref={barRef}
      aria-hidden="true"
      className="fixed top-0 left-0 z-[60] h-[3px] w-0"
      style={{
        background: "linear-gradient(90deg, var(--violet), var(--blue), var(--mint))",
        boxShadow: "0 1px 8px rgba(99,91,255,.5)",
      }}
    />
  );
}
