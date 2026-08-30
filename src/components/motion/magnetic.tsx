"use client";
/* why (D-12/F-5): the maquette's magnetic hook targets a bare CSS class that
   does not exist in this codebase — the Button family is pure cva with a
   `data-slot="button"` idiom, and adding that stable class name here would
   fork a second button implementation (D-42). This island instead selects
   [data-slot="button"][data-magnetic="true"], an element-scoped listener
   attached only to buttons that opt in — it renders nothing and never
   touches `window`. */

import { useEffect } from "react";

const MAGNETIC_SELECTOR = '[data-slot="button"][data-magnetic="true"]';

function Magnetic() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    const buttons = document.querySelectorAll<HTMLElement>(MAGNETIC_SELECTOR);
    const cleanups: Array<() => void> = [];

    buttons.forEach((button) => {
      const onMouseMove = (event: MouseEvent) => {
        const rect = button.getBoundingClientRect();
        const tx = (event.clientX - rect.left - rect.width / 2) * 0.12;
        const ty = (event.clientY - rect.top - rect.height / 2) * 0.18 - 2;
        button.style.transform = `translate(${tx}px, ${ty}px)`;
      };
      const onMouseLeave = () => {
        button.style.transform = "";
      };

      button.addEventListener("mousemove", onMouseMove, { passive: true });
      button.addEventListener("mouseleave", onMouseLeave);
      cleanups.push(() => {
        button.removeEventListener("mousemove", onMouseMove);
        button.removeEventListener("mouseleave", onMouseLeave);
      });
    });

    return () => {
      cleanups.forEach((cleanup) => cleanup());
    };
  }, []);

  return null;
}

export { Magnetic };
