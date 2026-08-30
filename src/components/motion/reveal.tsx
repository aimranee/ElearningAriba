"use client";
/* why: elements marked `.reveal` rise on scroll (D-14), and must stay
   visible under prefers-reduced-motion (D-16) — a single IntersectionObserver
   island does this without turning any route into a client component; only
   this scope observer is a client component, RevealScope's directive above
   is the only one in this file. */

import { useEffect, type ComponentProps, type ElementType } from "react";
import { cn } from "@/lib/utils";

export function RevealScope() {
  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const elements = document.querySelectorAll<HTMLElement>(".reveal");

    if (reduce) {
      elements.forEach((el) => el.classList.add("in"));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("in");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
    );

    elements.forEach((el) => observer.observe(el));

    return () => {
      observer.disconnect();
    };
  }, []);

  return null;
}

type RevealProps = ComponentProps<"div"> & {
  as?: ElementType;
  dataD?: 1 | 2 | 3 | 4 | 5;
};

export function Reveal({ as: Component = "div", dataD, className, children, ...props }: RevealProps) {
  return (
    <Component className={cn("reveal", className)} data-d={dataD} {...props}>
      {children}
    </Component>
  );
}
