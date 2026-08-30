"use client";
/* why (D-08/D-09/D-10): timings and the width-lock/resync mechanics are
   measured verbatim from the founder-approved maquette's own script — direct
   DOM node mutation (refs), not React state per keystroke, keeps every
   interval exactly on the measured cadence and avoids a parent re-render on
   every character. `words` always arrives as a prop; this island never holds
   its own copy of the competencies (D-25/PUB-13). */

import { useEffect, useRef } from "react";

const TYPE_MS = 26;
const HOLD_MS = 1050;
const ERASE_MS = 15;
const BETWEEN_WORDS_MS = 140;
const FIRST_ERASE_DELAY_MS = 1400;
const RESIZE_DEBOUNCE_MS = 180;

interface TypewriterProps {
  words: readonly string[];
}

function Typewriter({ words }: TypewriterProps) {
  const boxRef = useRef<HTMLSpanElement>(null);
  const textRef = useRef<HTMLSpanElement>(null);
  const sizerRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const box = boxRef.current;
    const text = textRef.current;
    const sizer = sizerRef.current;
    if (!box || !text || !sizer || words.length === 0) {
      return;
    }

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let index = 0;
    let timer: ReturnType<typeof setTimeout> | null = null;
    let resizeTimer: ReturnType<typeof setTimeout> | null = null;

    function clearTimer() {
      if (timer !== null) {
        clearTimeout(timer);
        timer = null;
      }
    }

    // D-09: width lock — measure every word through the hidden sizer span,
    // then fix the box at the widest + 4px so the H1 never reflows (CLS).
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

    function typeWord(i: number) {
      index = i;
      const word = words[i];
      if (reduce) {
        text!.textContent = word;
        return;
      }
      text!.textContent = "";
      let c = 1;
      const add = () => {
        text!.textContent = word.slice(0, c);
        if (c < word.length) {
          c++;
          timer = setTimeout(add, TYPE_MS);
        } else {
          timer = setTimeout(eraseWord, HOLD_MS);
        }
      };
      add();
    }

    function eraseWord() {
      const current = text!.textContent ?? "";
      let c = current.length;
      const del = () => {
        text!.textContent = current.slice(0, c);
        if (c > 0) {
          c--;
          timer = setTimeout(del, ERASE_MS);
        } else {
          timer = setTimeout(nextWord, BETWEEN_WORDS_MS);
        }
      };
      del();
    }

    function nextWord() {
      typeWord((index + 1) % words.length);
    }

    // D-10: resync on visibilitychange — background tabs throttle
    // setTimeout, so on return we restore the WHOLE current word (never a
    // slice) and restart the cycle from the hold, not mid-letter.
    function onVisibilityChange() {
      if (document.visibilityState !== "visible" || reduce) {
        return;
      }
      clearTimer();
      text!.textContent = words[index];
      timer = setTimeout(eraseWord, HOLD_MS);
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

    text.textContent = words[0];
    if (!reduce) {
      timer = setTimeout(eraseWord, FIRST_ERASE_DELAY_MS);
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
      className="inline-block align-baseline whitespace-nowrap text-left"
    >
      <span
        ref={textRef}
        className="bg-[linear-gradient(100deg,var(--violet)_0%,var(--deep)_42%,var(--blue)_100%)] bg-clip-text text-transparent"
      />
      <span
        aria-hidden="true"
        className="ml-[3px] inline-block h-[0.86em] w-[3px] animate-[blink_1.05s_steps(1)_infinite] rounded-[2px] bg-[var(--violet)] align-[-0.06em]"
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
