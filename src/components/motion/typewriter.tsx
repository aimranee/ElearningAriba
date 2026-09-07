"use client";
/* why (D-08/D-09/D-10/D-101/D-104): whole-word crossfade, not per-character
   typing — the old caret-typing cadence left a fragment or a blank word a
   measured 41.8% of the time. Two stacked spans occupy the same grid cell;
   only their opacity/transform are mutated directly via refs (D-08), never
   React state per frame. The width lock (D-09) is no longer just useful, it
   is required (D-104): both words coexist during the 180ms overlap, so an
   unlocked box would reflow mid-crossfade. `words` always arrives as a
   prop; this island never holds its own copy of the competencies
   (D-25/PUB-13). */

import { useEffect, useRef } from "react";

const HOLD_MS = 2200;
const OVERLAP_MS = 180;
const RESIZE_DEBOUNCE_MS = 180;

interface TypewriterProps {
  words: readonly string[];
}

function Typewriter({ words }: TypewriterProps) {
  const boxRef = useRef<HTMLSpanElement>(null);
  const frontRef = useRef<HTMLSpanElement>(null);
  const backRef = useRef<HTMLSpanElement>(null);
  const sizerRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const box = boxRef.current;
    const front = frontRef.current;
    const back = backRef.current;
    const sizer = sizerRef.current;
    if (!box || !front || !back || !sizer || words.length === 0) {
      return;
    }

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let index = 0;
    let activeIsFront = true;
    let timer: ReturnType<typeof setTimeout> | null = null;
    let resizeTimer: ReturnType<typeof setTimeout> | null = null;

    function clearTimer() {
      if (timer !== null) {
        clearTimeout(timer);
        timer = null;
      }
    }

    // D-09/D-104: measure every word through the hidden sizer span, then fix
    // the box at the widest + 4px so the H1 never reflows (CLS) while the
    // two spans coexist during the crossfade.
    function lockWidth() {
      let max = 0;
      for (const word of words) {
        sizer!.textContent = word;
        max = Math.max(max, sizer!.offsetWidth);
      }
      sizer!.textContent = "";
      if (max) {
        box!.style.width = `${Math.ceil(max) + 4}px`;
      }
    }

    // instantly (no transition) place a span at its fully-visible resting
    // position, showing `word`.
    function settleEntered(el: HTMLSpanElement, word: string) {
      el.style.transitionDuration = "0s";
      el.textContent = word;
      el.style.opacity = "1";
      el.style.transform = "translateY(0)";
      void el.offsetWidth;
      el.style.transitionDuration = "";
    }

    // instantly (no transition) place a span at its hidden, below-baseline
    // resting position, ready to enter.
    function settleIdle(el: HTMLSpanElement) {
      el.style.transitionDuration = "0s";
      el.style.opacity = "0";
      el.style.transform = "translateY(0.22em)";
      void el.offsetWidth;
      el.style.transitionDuration = "";
    }

    function crossfadeToNext() {
      const nextIndex = (index + 1) % words.length;
      const outgoing = activeIsFront ? front! : back!;
      const incoming = activeIsFront ? back! : front!;

      incoming.textContent = words[nextIndex];
      settleIdle(incoming);

      requestAnimationFrame(() => {
        outgoing.style.opacity = "0";
        outgoing.style.transform = "translateY(-0.22em)";
        incoming.style.opacity = "1";
        incoming.style.transform = "translateY(0)";
      });

      timer = setTimeout(() => {
        index = nextIndex;
        activeIsFront = !activeIsFront;
        settleIdle(outgoing);
        timer = setTimeout(crossfadeToNext, HOLD_MS);
      }, OVERLAP_MS);
    }

    // D-10: resync on visibilitychange — background tabs throttle timers, so
    // on return we restore the WHOLE current word (never mid-crossfade) and
    // restart the cycle from the hold.
    function onVisibilityChange() {
      if (document.visibilityState !== "visible" || reduce) {
        return;
      }
      clearTimer();
      const activeEl = activeIsFront ? front! : back!;
      const idleEl = activeIsFront ? back! : front!;
      settleEntered(activeEl, words[index]);
      settleIdle(idleEl);
      timer = setTimeout(crossfadeToNext, HOLD_MS);
    }

    function onResize() {
      if (resizeTimer !== null) {
        clearTimeout(resizeTimer);
      }
      resizeTimer = setTimeout(lockWidth, RESIZE_DEBOUNCE_MS);
    }

    document.addEventListener("visibilitychange", onVisibilityChange);
    window.addEventListener("resize", onResize, { passive: true });

    lockWidth();
    // display:swap can shift the measurement — relock once fonts are ready.
    if (document.fonts?.ready) {
      document.fonts.ready.then(lockWidth);
    }

    settleEntered(front, words[0]);
    settleIdle(back);
    if (!reduce) {
      timer = setTimeout(crossfadeToNext, HOLD_MS);
    }

    return () => {
      clearTimer();
      if (resizeTimer !== null) {
        clearTimeout(resizeTimer);
      }
      document.removeEventListener("visibilitychange", onVisibilityChange);
      window.removeEventListener("resize", onResize);
    };
  }, [words]);

  return (
    <span
      ref={boxRef}
      className="inline-grid align-baseline whitespace-nowrap text-left"
    >
      <span
        ref={frontRef}
        className="[grid-area:1/1] bg-[linear-gradient(100deg,var(--violet)_0%,var(--deep)_42%,var(--blue)_100%)] bg-clip-text text-transparent transition-[opacity,transform] duration-[180ms] ease-[var(--ease-brand)]"
      />
      <span
        ref={backRef}
        className="[grid-area:1/1] bg-[linear-gradient(100deg,var(--violet)_0%,var(--deep)_42%,var(--blue)_100%)] bg-clip-text text-transparent transition-[opacity,transform] duration-[180ms] ease-[var(--ease-brand)]"
      />
      <span
        ref={sizerRef}
        aria-hidden="true"
        className="pointer-events-none invisible absolute top-0 left-0 whitespace-nowrap"
      />
    </span>
  );
}

export { Typewriter };
