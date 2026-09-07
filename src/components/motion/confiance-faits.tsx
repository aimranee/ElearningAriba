"use client";
/* why: each card swaps description/preuve on click — a real <button> per
   card keeps Enter/Space activation for free (D-64), same pattern as
   format-deroule.tsx's selectable rows. */

import { useState } from "react";
import Link from "next/link";

import { Reveal } from "@/components/motion/reveal";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { ChevronDown } from "lucide-react";

interface ConfianceFaitItem {
  id: string;
  cle: string;
  titre: string;
  description: string;
  preuveTexte: string;
  preuveLienHref?: string;
  preuveLienLabel?: string;
  icon: React.ReactNode;
  gradient: { ta: string; tb: string };
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
    <ul className="mt-[3.25rem] flex flex-col gap-4">
      {items.map((item, index) => {
        const isOpen = Boolean(open[item.id]);
        const preuveId = `confiance-preuve-${item.cle}`;
        return (
          <Reveal key={item.id} as="li" dataD={((index % 5) + 1) as 1 | 2 | 3 | 4 | 5}>
            <Card
              variant="default"
              className="group grid grid-cols-[52px_1fr] gap-4 rounded-[22px] p-[1.4rem]"
            >
              <span
                aria-hidden="true"
                style={
                  {
                    background: "linear-gradient(140deg, var(--ta), var(--tb))",
                    boxShadow: "0 12px 24px -12px var(--tb)",
                    ["--ta" as string]: item.gradient.ta,
                    ["--tb" as string]: item.gradient.tb,
                  } as React.CSSProperties
                }
                className="flex size-[52px] shrink-0 items-center justify-center rounded-[16px] text-white transition-transform duration-[500ms] ease-[var(--ease-brand)] group-hover:scale-[1.08] group-hover:-rotate-[4deg]"
              >
                {item.icon}
              </span>
              <div>
                <h3 className="text-[length:var(--text-card)] leading-[var(--text-card--line-height)] font-bold tracking-[-0.02em]">
                  {item.titre}
                </h3>
                <p className="mt-[0.3rem] text-[length:var(--text-small)] leading-[var(--text-small--line-height)] text-[var(--muted-ink)]">
                  {item.description}
                </p>
                <button
                  type="button"
                  aria-expanded={isOpen}
                  aria-controls={preuveId}
                  onClick={() => setOpen((prev) => ({ ...prev, [item.id]: !prev[item.id] }))}
                  className="mt-[0.35rem] inline-flex min-h-11 items-center gap-[0.4rem] text-[length:var(--text-small)] leading-[var(--text-small--line-height)] font-bold text-[var(--deep)]"
                >
                  {isOpen ? labels.masquer : labels.voir}
                  <ChevronDown
                    aria-hidden="true"
                    className={cn(
                      "size-[15px] transition-transform duration-[var(--duration-base)] ease-[var(--ease-brand)]",
                      isOpen && "rotate-180"
                    )}
                  />
                </button>
                <div
                  id={preuveId}
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
                    <div className="mt-2 rounded-[14px] border border-[var(--hairline-2)] bg-[var(--tint-violet)] px-[1.1rem] py-[1rem]">
                      <p className="text-[length:var(--text-body)] leading-[var(--text-body--line-height)] text-[var(--muted-ink)]">
                        {item.preuveTexte}
                      </p>
                      {item.preuveLienHref && item.preuveLienLabel ? (
                        <Link
                          href={item.preuveLienHref}
                          className="mt-2 inline-flex min-h-11 items-center text-[length:var(--text-small)] leading-[var(--text-small--line-height)] font-semibold text-[var(--violet)] underline underline-offset-2"
                        >
                          {item.preuveLienLabel}
                        </Link>
                      ) : null}
                    </div>
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
