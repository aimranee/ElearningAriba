"use client";
/* why: the six parcours rows are selectable (au clic et au clavier) — a
   real <button> per row keeps Enter/Space activation for free, no extra
   key handling. Correspondence with the aside's companion rows is by
   `cle` (a slug), never by array index: the parcours rows come from
   Supabase in DB order, the aside rows are static JSON in a different
   order (D-19's sibling constraint, see PLAN.md Task 3). */

import { useState } from "react";
import { Check, GraduationCap, Layers } from "lucide-react";

import { Card } from "@/components/ui/card";
import { Reveal } from "@/components/motion/reveal";
import type { ContentItem } from "@/lib/content/queries";

/* why: mockup .step-n gradients are keyed by position, not by the item's
   domain (there is no domain picto column for this section) — six literal
   gradients, matched verbatim from the maquette (`#B4771A`/`#0E9F6E` have no
   token equivalent, same exception class as the "futur" badge below). */
const STEP_GRADIENTS = [
  "linear-gradient(135deg,var(--violet),var(--indigo))",
  "linear-gradient(135deg,var(--blue),var(--deep))",
  "linear-gradient(135deg,var(--amber),#B4771A)",
  "linear-gradient(135deg,var(--sky),var(--blue))",
  "linear-gradient(135deg,var(--mint),#0E9F6E)",
  "linear-gradient(135deg,var(--violet-l),var(--violet))",
] as const;

interface AsideRow {
  cle: string;
  label: string;
}

interface FormatParcoursProps {
  items: ContentItem[];
  aside: {
    titre: string;
    items: AsideRow[];
    itemFutur: AsideRow;
    resume: string;
  };
}

function FormatParcours({ items, aside }: FormatParcoursProps) {
  const [selected, setSelected] = useState(0);
  const asideRows: (AsideRow & { futur: boolean })[] = [
    ...aside.items.map((row) => ({ ...row, futur: false })),
    { ...aside.itemFutur, futur: true },
  ];
  const selectedCle = items[selected]?.cle;

  return (
    <div className="mt-10 grid items-start gap-[clamp(2rem,4vw,3.5rem)] lg:grid-cols-[1.02fr_.98fr]">
      <div>
        <ol className="flex flex-col gap-[0.3rem]">
          {items.map((item, index) => {
            const isSelected = selected === index;
            const isFutur = item.statut === "futur";
            return (
              <Reveal key={item.id} as="li" dataD={((index % 5) + 1) as 1 | 2 | 3 | 4 | 5}>
                <button
                  type="button"
                  onClick={() => setSelected(index)}
                  className={
                    isSelected
                      ? "group relative grid w-full grid-cols-[auto_1fr] gap-[1.1rem] rounded-[18px] border border-[var(--hairline)] bg-[var(--tint-violet)] p-[1.3rem_1.4rem] text-left transition-[background-color,border-color] duration-[var(--duration-base)] ease-[var(--ease-brand)]"
                      : "group relative grid w-full grid-cols-[auto_1fr] gap-[1.1rem] rounded-[18px] border border-transparent bg-transparent p-[1.3rem_1.4rem] text-left transition-[background-color,border-color] duration-[var(--duration-base)] ease-[var(--ease-brand)] hover:border-[var(--hairline)] hover:bg-[var(--tint-violet)]"
                  }
                >
                  <span
                    aria-hidden="true"
                    className={
                      isSelected
                        ? "absolute top-4 bottom-4 left-0 w-[3px] rounded-full bg-[linear-gradient(180deg,var(--violet),var(--blue))] opacity-100"
                        : "absolute top-4 bottom-4 left-0 w-[3px] rounded-full bg-[linear-gradient(180deg,var(--violet),var(--blue))] opacity-0 transition-opacity duration-[var(--duration-base)] ease-[var(--ease-brand)] group-hover:opacity-100"
                    }
                  />
                  <span
                    aria-hidden="true"
                    style={{ background: STEP_GRADIENTS[index] }}
                    className="flex size-[42px] shrink-0 items-center justify-center rounded-[14px] text-[0.8rem] font-extrabold tabular-nums text-white"
                  >
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <div className="flex flex-col gap-[0.3rem]">
                    <h3 className="text-[1.04rem] leading-[1.3] font-bold tracking-[-0.02em]">
                      {item.titre}
                      {isFutur ? (
                        <span className="ml-2 inline-flex items-center rounded-full bg-[#FFF4E3] px-[0.55rem] py-[0.22rem] align-middle text-[0.68rem] font-bold tracking-[0.06em] text-[#B4771A] uppercase">
                          À venir
                        </span>
                      ) : null}
                    </h3>
                    {item.description ? (
                      <p className="text-[0.94rem] leading-[1.6] text-[var(--muted-ink)]">
                        {item.description}
                      </p>
                    ) : null}
                  </div>
                </button>
              </Reveal>
            );
          })}
        </ol>
        <div aria-hidden="true" className="mt-9 flex items-center px-[0.4rem]">
          {[1, 2, 3, 4, 5, 6].map((n, index) => (
            <div key={n} className="flex flex-1 items-center last:flex-none">
              <span
                className={
                  selected === index
                    ? "flex size-[30px] shrink-0 items-center justify-center rounded-full border border-[var(--ink)] bg-[var(--ink)] text-[0.68rem] font-bold tabular-nums text-white"
                    : "flex size-[30px] shrink-0 items-center justify-center rounded-full border border-[var(--hairline)] bg-white text-[0.68rem] font-bold tabular-nums text-[var(--muted2)]"
                }
              >
                {String(n).padStart(2, "0")}
              </span>
              {index < 5 ? (
                <span
                  className={
                    index < selected
                      ? "h-[2px] flex-1 rounded-full bg-[linear-gradient(90deg,var(--violet),var(--mint))]"
                      : "h-[2px] flex-1 rounded-full bg-[var(--border)]"
                  }
                />
              ) : null}
            </div>
          ))}
        </div>
      </div>

      <Reveal dataD={2} className="lg:sticky lg:top-[104px]">
        <Card variant="default" className="p-[1.15rem]">
          <div className="mb-[0.9rem] flex items-center gap-2">
            <Layers aria-hidden="true" className="size-4 text-[var(--deep)]" />
            <strong className="text-[0.88rem] tracking-[-0.01em]">{aside.titre}</strong>
          </div>
          <div className="flex flex-col gap-2">
            {asideRows.map((row) => {
              const isCurrent = row.cle === selectedCle;
              return (
                <div
                  key={row.cle}
                  aria-current={isCurrent ? "true" : undefined}
                  className={
                    row.futur
                      ? `flex items-center gap-[0.65rem] rounded-[13px] bg-[var(--tint)] px-[0.85rem] py-[0.7rem] text-[0.88rem] font-semibold text-[var(--muted-ink)]${isCurrent ? " border border-[var(--violet)] bg-[var(--tint-violet)]" : ""}`
                      : `flex items-center gap-[0.65rem] rounded-[13px] border border-[var(--hairline)] bg-white px-[0.85rem] py-[0.7rem] text-[0.88rem] font-semibold${isCurrent ? " border-[var(--violet)] bg-[var(--tint-violet)]" : ""}`
                  }
                >
                  {row.futur ? (
                    <span
                      aria-hidden="true"
                      className="size-5 shrink-0 rounded-full border-2 border-[#D6D3F0]"
                    />
                  ) : (
                    <span
                      aria-hidden="true"
                      className="flex size-5 shrink-0 items-center justify-center rounded-full bg-[var(--mint)] text-white"
                    >
                      <Check className="size-[11px]" />
                    </span>
                  )}
                  {row.label}
                </div>
              );
            })}
          </div>
          <div className="mt-4 flex items-center gap-2 border-t border-[var(--hairline)] pt-[0.9rem] text-[0.8rem] text-[var(--muted-ink)]">
            <GraduationCap aria-hidden="true" className="size-[14px] text-[var(--violet)]" />
            <span>{aside.resume}</span>
          </div>
        </Card>
      </Reveal>
    </div>
  );
}

export { FormatParcours };
