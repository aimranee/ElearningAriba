"use client";
/* why: each card swaps description/preuve on click — a real <button> per
   card keeps Enter/Space activation for free (D-64), same pattern as
   format-deroule.tsx's selectable rows. */

import { useState } from "react";
import Link from "next/link";

import { Reveal } from "@/components/motion/reveal";
import { Card } from "@/components/ui/card";

interface ConfianceFaitItem {
  id: string;
  cle: string;
  titre: string;
  description: string;
  preuveTexte: string;
  preuveLienHref?: string;
  preuveLienLabel?: string;
  icon: React.ReactNode;
}

interface ConfianceFaitsLabels {
  voir: string;
  masquer: string;
}

interface ConfianceFaitsProps {
  items: ConfianceFaitItem[];
  labels: ConfianceFaitsLabels;
}

function ConfianceFaits({ items, labels }: ConfianceFaitsProps) {
  const [open, setOpen] = useState<Record<string, boolean>>({});

  return (
    <ul className="mt-[3.25rem] grid grid-cols-1 gap-[1.35rem] sm:grid-cols-2 lg:grid-cols-3">
      {items.map((item, index) => {
        const isOpen = Boolean(open[item.id]);
        const preuveId = `confiance-preuve-${item.cle}`;
        return (
          <Reveal key={item.id} as="li" dataD={((index % 5) + 1) as 1 | 2 | 3 | 4 | 5}>
            <Card variant="default" className="group flex h-full flex-col p-[1.7rem]">
              <span
                aria-hidden="true"
                className="flex size-[52px] shrink-0 items-center justify-center rounded-[16px] bg-[linear-gradient(135deg,var(--violet),var(--deep))] text-white shadow-[0_12px_24px_-10px_rgba(99,91,255,.6)] transition-transform duration-[500ms] ease-[var(--ease-brand)] group-hover:scale-[1.08] group-hover:-rotate-[4deg]"
              >
                {item.icon}
              </span>
              <button
                type="button"
                aria-expanded={isOpen}
                aria-controls={preuveId}
                onClick={() => setOpen((prev) => ({ ...prev, [item.id]: !prev[item.id] }))}
                className="w-full text-left"
              >
                <span className="mt-3 block text-[1.08rem] leading-[1.3] font-bold tracking-[-0.02em]">
                  {item.titre}
                </span>
                <span className="mt-2 inline-block text-[0.78rem] font-semibold text-[var(--violet)] underline underline-offset-2">
                  {isOpen ? labels.masquer : labels.voir}
                </span>
              </button>
              <div id={preuveId} className="mt-2">
                <div
                  aria-hidden={isOpen}
                  className="grid overflow-hidden"
                  style={{
                    gridTemplateRows: !isOpen ? "1fr" : "0fr",
                    visibility: !isOpen ? "visible" : "hidden",
                    transition:
                      "grid-template-rows var(--duration-base) var(--ease-brand), visibility 0s linear var(--duration-base)",
                  }}
                >
                  <div className="min-h-0">
                    <p className="text-[0.94rem] leading-[1.6] text-[var(--muted-ink)]">
                      {item.description}
                    </p>
                  </div>
                </div>
                <div
                  aria-hidden={!isOpen}
                  className="grid overflow-hidden"
                  style={{
                    gridTemplateRows: isOpen ? "1fr" : "0fr",
                    visibility: isOpen ? "visible" : "hidden",
                    transition:
                      "grid-template-rows var(--duration-base) var(--ease-brand), visibility 0s linear var(--duration-base)",
                  }}
                >
                  <div className="min-h-0">
                    <p className="text-[0.94rem] leading-[1.6] text-[var(--muted-ink)]">
                      {item.preuveTexte}
                    </p>
                    {item.preuveLienHref && item.preuveLienLabel ? (
                      <Link
                        href={item.preuveLienHref}
                        className="mt-2 inline-block text-[0.85rem] font-semibold text-[var(--violet)] underline underline-offset-2"
                      >
                        {item.preuveLienLabel}
                      </Link>
                    ) : null}
                  </div>
                </div>
              </div>
            </Card>
          </Reveal>
        );
      })}
    </ul>
  );
}

export { ConfianceFaits };
