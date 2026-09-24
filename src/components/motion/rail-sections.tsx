"use client";
/* why (D-39/brief §C): a fixed left rail of section "stations", visible only
   at xl (>=1280px) via a hidden/xl:block class — never a JS width check.
   The line-fill reads `--scroll-p`, the custom property ScrollProgress's
   existing single scroll listener now also sets (scroll-progress.tsx), so
   this island mounts zero scroll listeners of its own. Active station comes
   from an IntersectionObserver over every `[data-section]` element, mirrored
   1:1 from the maquette's mechanism. Every write below is a direct DOM
   mutation via refs, matching the rest of the motion kit's convention
   (assembly-card.tsx, hero-spotlight.tsx) — no useState-driven re-render on
   scroll/observer ticks. Labels are read from the DOM at mount (each
   section's own eyebrow text) rather than duplicated in code — the first
   station has no eyebrow and uses the site title, already an approved
   string. (#22) The rail's own two strings — its accessible name and the
   first station's label — arrive from the server parent in the page's
   language. */

import { useEffect, useRef } from "react";

import { cn, FOCUS_RING } from "@/lib/utils";

interface RailSectionsProps {
  /** Accessible name of the rail. */
  label: string;
  /** Label of the first station, which has no eyebrow: the site title. */
  topLabel: string;
}

const SECTION_KEYS = [
  "top",
  "pour-qui",
  "competences",
  "programme",
  "format",
  "confiance",
  "reservation",
  "faq",
] as const;

function RailSections({ label, topLabel }: RailSectionsProps) {
  const navRef = useRef<HTMLElement>(null);
  const dotRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const labelRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const buttonRefs = useRef<(HTMLButtonElement | null)[]>([]);

  useEffect(() => {
    const nav = navRef.current;
    if (!nav) {
      return;
    }

    const elements = SECTION_KEYS.map((key) =>
      document.querySelector<HTMLElement>(`[data-section="${key}"]`)
    );

    elements.forEach((el, index) => {
      const labelEl = labelRefs.current[index];
      if (!labelEl || !el) return;
      if (SECTION_KEYS[index] === "top") {
        labelEl.textContent = topLabel;
        return;
      }
      const eyebrow = el.querySelector<HTMLElement>('[data-slot="eyebrow"], [data-eyebrow]');
      labelEl.textContent = eyebrow?.textContent?.trim() ?? "";
    });

    const present = elements
      .map((el, index) => (el ? { el, index } : null))
      .filter((entry): entry is { el: HTMLElement; index: number } => entry !== null);

    if (present.length === 0) {
      return;
    }

    function applyState(activeIndex: number, isNight: boolean) {
      nav!.classList.toggle("on-night", isNight);

      buttonRefs.current.forEach((button, index) => {
        if (!button) return;
        const isActive = index === activeIndex;

        button.classList.toggle("text-[var(--deep)]", isActive && !isNight);
        button.classList.toggle("text-white", isActive && isNight);
        button.classList.toggle("text-[var(--muted-ink)]", !isActive && !isNight);
        button.classList.toggle("text-white/65", !isActive && isNight);

        const dot = dotRefs.current[index];
        if (dot) {
          dot.classList.toggle("scale-125", isActive);
          dot.classList.toggle("border-[var(--violet)]", isActive && !isNight);
          dot.classList.toggle("bg-[var(--violet)]", isActive && !isNight);
          dot.classList.toggle("shadow-[0_0_0_5px_rgba(99,91,255,.18)]", isActive && !isNight);
          dot.classList.toggle("border-[var(--violet-l)]", isActive && isNight);
          dot.classList.toggle("bg-[var(--violet-l)]", isActive && isNight);
          dot.classList.toggle("border-[var(--muted2)]", !isActive && !isNight);
          dot.classList.toggle("bg-white", !isActive && !isNight);
          dot.classList.toggle("border-white/40", !isActive && isNight);
          dot.classList.toggle("bg-[var(--night)]", !isActive && isNight);
        }

        const label = labelRefs.current[index];
        if (label) {
          label.classList.toggle("bg-white", !isNight);
          label.classList.toggle("bg-[var(--night-2)]", isNight);
        }
      });
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const key = entry.target.getAttribute("data-section");
          const activeIndex = SECTION_KEYS.findIndex((sectionKey) => sectionKey === key);
          const isNight = entry.target.getAttribute("data-tone") === "night";
          applyState(activeIndex, isNight);
        });
      },
      { rootMargin: "-45% 0px -45% 0px" }
    );

    present.forEach(({ el }) => observer.observe(el));
    return () => observer.disconnect();
  }, [topLabel]);

  return (
    <nav
      ref={navRef}
      aria-label={label}
      className="fixed top-1/2 left-[22px] z-40 hidden -translate-y-1/2 xl:block"
    >
      <ul className="relative flex flex-col gap-[18px] py-1.5">
        <span aria-hidden="true" className="absolute top-0 left-[5px] h-full w-0.5 bg-[var(--hairline)]" />
        <span
          aria-hidden="true"
          className="absolute top-0 left-[5px] w-0.5 [background:linear-gradient(180deg,var(--violet),var(--sky-ink))] transition-[height] duration-[120ms] ease-[var(--ease-brand)]"
          style={{ height: "var(--scroll-p, 0%)" }}
        />
        {SECTION_KEYS.map((key, index) => (
          <li key={key} className="relative">
            <button
              ref={(el) => {
                buttonRefs.current[index] = el;
              }}
              type="button"
              onClick={() => {
                document
                  .querySelector(`[data-section="${key}"]`)
                  ?.scrollIntoView({ behavior: "smooth", block: "start" });
              }}
              className={cn(
                "group/rail flex min-h-[44px] items-center gap-3 text-[length:var(--text-micro)] font-semibold tracking-[0.06em] text-[var(--muted-ink)] uppercase",
                FOCUS_RING
              )}
            >
              <span
                ref={(el) => {
                  dotRefs.current[index] = el;
                }}
                aria-hidden="true"
                className="relative z-[1] size-3 rounded-full border-2 border-[var(--muted2)] bg-white transition-[transform,border-color,background-color] duration-[var(--duration-base)] ease-[var(--ease-brand)]"
              />
              <span
                ref={(el) => {
                  labelRefs.current[index] = el;
                }}
                className="-translate-x-1.5 rounded-full bg-white px-[0.6rem] py-[0.35rem] text-inherit opacity-0 shadow-[var(--shadow-1)] transition-[opacity,transform] duration-[var(--duration-base)] ease-[var(--ease-brand)] group-hover/rail:translate-x-0 group-hover/rail:opacity-100 group-focus-visible/rail:translate-x-0 group-focus-visible/rail:opacity-100"
              />
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );
}

export { RailSections };
