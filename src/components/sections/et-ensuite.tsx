import Link from "next/link";
import { ArrowRight, CalendarCheck, PhoneCall, Users } from "lucide-react";

import { Section } from "@/components/sections/section";
import { Reveal } from "@/components/motion/reveal";
import common from "@/locales/fr/common.json";
import landing from "@/locales/fr/landing.json";

// why (brief §J3, maquette `.step .pic`): decorative step pictograms, paired
// 1:1 by index with `landing.ctaFinal.etapes.items` — chrome only, no new
// string.
const STEP_ICONS = [PhoneCall, CalendarCheck, Users] as const;

/**
 * "Ce qui se passe ensuite" (brief §C-01b, maquette `.next`): a white
 * hairline card sitting directly under the hero, reading the exact same
 * `landing.ctaFinal.etapes` object the final CTA panel already renders — no
 * second copy of the three steps is authored here (cta-final.tsx keeps its
 * own render for now; a later run removes the duplication). No Supabase
 * query of its own: this section is pure locale-driven chrome, same as
 * `formatModalites.apercu` elsewhere on the page.
 */
function EtEnsuite() {
  const etapes = landing.ctaFinal.etapes;

  return (
    <Section tone="default" className="pt-0 pb-[clamp(2rem,4vw,3rem)]">
      <Reveal className="relative rounded-[24px] border border-[var(--hairline)] bg-white p-6 shadow-[var(--contact),var(--inset-hi)]">
        <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-3">
          <h2 className="font-heading text-[length:var(--text-card)] leading-[var(--text-card--line-height)] font-bold tracking-[-0.02em]">
            {etapes.titre}
          </h2>
          <Link
            href="/reservation"
            className="group inline-flex items-center gap-[0.4rem] text-[length:var(--text-small)] leading-[var(--text-small--line-height)] font-bold text-[var(--deep)]"
          >
            {common.actions.prendreRdv}
            <ArrowRight
              aria-hidden="true"
              className="size-[15px] transition-transform duration-[var(--duration-base)] ease-[var(--ease-brand)] group-hover:translate-x-[3px]"
            />
          </Link>
        </div>

        <div className="relative mt-[1.4rem]">
          <span
            aria-hidden="true"
            className="pointer-events-none absolute top-[22px] right-[calc(16.66%+22px)] left-[calc(16.66%+22px)] hidden h-0.5 [background:repeating-linear-gradient(90deg,var(--violet-soft)_0_8px,transparent_8px_16px)] md:block"
          />
          <ol className="grid gap-5 md:grid-cols-3 md:gap-8">
            {etapes.items.map((item, index) => {
              const Icon = STEP_ICONS[index];
              return (
              <li
                key={item.titre}
                className="relative flex gap-4 md:flex-col md:items-center md:text-center"
              >
                <span className="relative z-[1] flex size-11 shrink-0 items-center justify-center rounded-full bg-[linear-gradient(135deg,var(--violet),var(--indigo))] font-heading text-[1rem] font-extrabold text-white shadow-[0_10px_22px_-10px_rgba(99,91,255,.8)]">
                  {index + 1}
                </span>
                {Icon ? (
                  <span
                    aria-hidden="true"
                    className="mt-3 hidden size-16 items-center justify-center rounded-[20px] bg-[var(--lav)] text-[var(--deep)] md:flex"
                  >
                    <Icon className="size-[30px]" strokeWidth={1.6} />
                  </span>
                ) : null}
                <div>
                  <strong className="block font-heading text-[length:var(--text-body)] leading-[var(--text-body--line-height)] font-bold tracking-[-0.015em]">
                    {item.titre}
                  </strong>
                  <span className="mt-1 block max-w-[30ch] text-[length:var(--text-small)] leading-[var(--text-small--line-height)] text-[var(--muted-ink)] md:mx-auto">
                    {item.description}
                  </span>
                </div>
              </li>
              );
            })}
          </ol>
        </div>
      </Reveal>
    </Section>
  );
}

export { EtEnsuite };
