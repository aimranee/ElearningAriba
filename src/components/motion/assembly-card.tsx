"use client";
/* why: mirrors typewriter.tsx's pattern (refs, one useEffect, direct DOM
   writes, matchMedia checked once) and assembly-connectors.tsx's
   IntersectionObserver-driven one-shot entrance. The carousel (title/id-line/
   progress) loops independently of the checklist's single validation on
   viewport entry — explicit CTO arbitration in the 2026-08-31 brief, they
   are not coupled and the observer disconnects immediately after firing. */

import { useEffect, useRef } from "react";
import { Check } from "lucide-react";

import type { ModuleContent } from "@/lib/content/queries";
import { formatHours, formatNumber } from "@/lib/i18n/fr";

const CYCLE_MS = 3200;
const FADE_MS = 220;
const RESIZE_DEBOUNCE_MS = 180;
const CHECKLIST_STAGGER_MS = 260;

interface AssemblyCardProps {
  modules: ModuleContent[];
  moduleLigneTemplate: string;
  progressionTemplate: string;
  pills: readonly { cle: string; label: string }[];
}

function moduleLigne(template: string, module: ModuleContent): string {
  return template
    .replace("{n}", formatNumber(module.position))
    .replace("{heures}", formatHours(module.dureeHeures));
}

function progressionLabel(
  template: string,
  module: ModuleContent,
  total: number,
): string {
  return template
    .replace("{n}", formatNumber(module.position))
    .replace("{total}", formatNumber(total));
}

function AssemblyCard({
  modules,
  moduleLigneTemplate,
  progressionTemplate,
  pills,
}: AssemblyCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const titleBoxRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLParagraphElement>(null);
  const titleSizerRef = useRef<HTMLParagraphElement>(null);
  const idLineRef = useRef<HTMLDivElement>(null);
  const fillRef = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLSpanElement>(null);
  const rowRefs = useRef<(HTMLLIElement | null)[]>([]);
  const checkRefs = useRef<(HTMLSpanElement | null)[]>([]);

  useEffect(() => {
    const title = titleRef.current;
    const titleBox = titleBoxRef.current;
    const sizer = titleSizerRef.current;
    const idLine = idLineRef.current;
    const fill = fillRef.current;
    const label = labelRef.current;
    const card = cardRef.current;
    if (
      modules.length === 0 ||
      !title ||
      !titleBox ||
      !sizer ||
      !idLine ||
      !fill ||
      !label ||
      !card
    ) {
      return;
    }

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    function validateRow(
      row: HTMLLIElement | null,
      check: HTMLSpanElement | null,
      animate: boolean,
    ) {
      if (!row || !check) return;
      const labelEl = row.querySelector<HTMLSpanElement>("[data-role='label']");
      if (animate) {
        row.style.transition = `opacity 260ms var(--ease-brand)`;
      }
      if (labelEl) {
        labelEl.classList.remove("text-white/75");
        labelEl.classList.add("text-white");
      }
      check.classList.remove("border-white/40", "bg-transparent", "text-white/60");
      check.classList.add("bg-[var(--mint)]", "border-transparent", "text-white");
    }

    if (reduce) {
      rowRefs.current.forEach((row, i) => validateRow(row, checkRefs.current[i], false));
      return;
    }

    let index = 0;
    let intervalHandle: ReturnType<typeof setInterval> | null = null;
    let resizeTimer: ReturnType<typeof setTimeout> | null = null;
    const fadeTimeouts: ReturnType<typeof setTimeout>[] = [];
    const staggerTimeouts: ReturnType<typeof setTimeout>[] = [];

    function lockHeight() {
      let max = 0;
      for (const module of modules) {
        sizer!.textContent = module.titre;
        max = Math.max(max, sizer!.offsetHeight);
      }
      sizer!.textContent = "";
      if (max) {
        titleBox!.style.minHeight = `${Math.ceil(max)}px`;
      }
    }

    function applyFadeTransition() {
      [title, idLine, fill, label].forEach((el) => {
        el!.style.transition = `opacity ${FADE_MS}ms var(--ease-brand)`;
      });
    }

    function render(i: number) {
      const module = modules[i];
      title!.textContent = module.titre;
      idLine!.textContent = moduleLigne(moduleLigneTemplate, module);
      fill!.style.width = `${(module.position / modules.length) * 100}%`;
      label!.textContent = progressionLabel(progressionTemplate, module, modules.length);
    }

    function advance() {
      const next = (index + 1) % modules.length;
      [title, idLine, fill, label].forEach((el) => {
        el!.style.opacity = "0";
      });
      const fadeTimeout = setTimeout(() => {
        index = next;
        render(index);
        [title, idLine, fill, label].forEach((el) => {
          el!.style.opacity = "1";
        });
      }, FADE_MS);
      fadeTimeouts.push(fadeTimeout);
    }

    function onResize() {
      if (resizeTimer !== null) {
        clearTimeout(resizeTimer);
      }
      resizeTimer = setTimeout(lockHeight, RESIZE_DEBOUNCE_MS);
    }

    window.addEventListener("resize", onResize, { passive: true });

    lockHeight();
    if (document.fonts?.ready) {
      document.fonts.ready.then(lockHeight);
    }

    applyFadeTransition();
    render(0);
    intervalHandle = setInterval(advance, CYCLE_MS);

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          rowRefs.current.forEach((row, i) => {
            const staggerTimeout = setTimeout(() => {
              validateRow(row, checkRefs.current[i], true);
            }, i * CHECKLIST_STAGGER_MS);
            staggerTimeouts.push(staggerTimeout);
          });
          observer.disconnect();
        });
      },
      { threshold: 0.3 },
    );
    observer.observe(card);

    return () => {
      if (intervalHandle !== null) clearInterval(intervalHandle);
      if (resizeTimer !== null) clearTimeout(resizeTimer);
      fadeTimeouts.forEach((t) => clearTimeout(t));
      staggerTimeouts.forEach((t) => clearTimeout(t));
      window.removeEventListener("resize", onResize);
      observer.disconnect();
    };
  }, [modules, moduleLigneTemplate, progressionTemplate]);

  if (modules.length === 0) {
    return null;
  }

  const first = modules[0];

  return (
    <div ref={cardRef} className="flex flex-col gap-[0.7rem]">
      <div ref={titleBoxRef} className="relative">
        <p ref={titleRef} className="font-heading text-[1.05rem] leading-[1.2] font-bold">
          {first.titre}
        </p>
        <p
          ref={titleSizerRef}
          aria-hidden="true"
          className="invisible absolute inset-x-0 top-0 font-heading text-[1.05rem] leading-[1.2] font-bold"
        />
      </div>

      <div ref={idLineRef} className="text-[0.78rem] text-white/78">
        {moduleLigne(moduleLigneTemplate, first)}
      </div>

      <div className="flex flex-col gap-[0.3rem]">
        <div className="h-[6px] w-full overflow-hidden rounded-full bg-white/20">
          <div
            ref={fillRef}
            className="h-full rounded-full bg-white"
            style={{ width: `${(first.position / modules.length) * 100}%` }}
          />
        </div>
        <span ref={labelRef} className="text-[0.68rem] font-semibold text-white/70">
          {progressionLabel(progressionTemplate, first, modules.length)}
        </span>
      </div>

      <ul className="mt-[0.3rem] flex flex-col gap-[0.4rem]">
        {pills.map((pill, index) => (
          <li
            key={pill.cle}
            ref={(el) => {
              rowRefs.current[index] = el;
            }}
            className="flex items-center gap-[0.5rem]"
          >
            <span
              ref={(el) => {
                checkRefs.current[index] = el;
              }}
              aria-hidden="true"
              className="flex size-4 shrink-0 items-center justify-center rounded-full border border-white/40 bg-transparent text-white/60"
            >
              <Check className="size-[9px]" />
            </span>
            <span data-role="label" className="text-[0.78rem] font-semibold text-white/75">
              {pill.label}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export { AssemblyCard };
