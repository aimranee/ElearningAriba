import Link from "next/link";
import { Calendar } from "lucide-react";

import { Section } from "@/components/sections/section";
import { Button } from "@/components/ui/button";
import { EmptyState, EmptyStateDescription } from "@/components/ui/empty-state";
import { Reveal } from "@/components/motion/reveal";
import { getSection } from "@/lib/content/queries";
import common from "@/locales/fr/common.json";
import landing from "@/locales/fr/landing.json";

/**
 * PUB-07 (final CTA half) — the outer gradient panel keeps `--shadow-brand`
 * only; the hero's assembly card is the page's sole `--shadow-4` consumer
 * (D-68 caps niveau 3 at one persistent surface). The right column is
 * "Ce qui se passe ensuite" (D-67): three steps built entirely from content
 * already signed elsewhere on the page — no new fact is authored. The
 * former console (invented dates, place counts, video placeholder) is
 * retired for good (D-66): no price, no formula, no payment provider name
 * (D-45).
 */
async function CtaFinal() {
  const sectionResult = await getSection("cta-final");

  if (!sectionResult.ok) {
    return (
      <Section tone="default">
        <EmptyState tone="error">
          <EmptyStateDescription>{common.etats.erreurGenerique}</EmptyStateDescription>
        </EmptyState>
      </Section>
    );
  }

  const section = sectionResult.data;
  const etapes = landing.ctaFinal.etapes;

  return (
    <Section tone="default">
      <Reveal
        className="relative overflow-hidden rounded-[34px] px-[clamp(1.5rem,5vw,4rem)] py-[clamp(3rem,6vw,5rem)] text-white shadow-[var(--shadow-brand)]"
        style={{
          background: "linear-gradient(125deg, var(--indigo), var(--deep) 45%, var(--violet))",
        }}
      >
        <span
          aria-hidden="true"
          className="absolute inset-0 [background-image:linear-gradient(rgba(255,255,255,.06)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.06)_1px,transparent_1px)] [background-size:52px_52px] [mask-image:radial-gradient(ellipse_80%_70%_at_50%_0%,#000,transparent_70%)] [-webkit-mask-image:radial-gradient(ellipse_80%_70%_at_50%_0%,#000,transparent_70%)]"
        />
        <div className="relative z-[1] grid items-center gap-[clamp(2rem,4vw,3.5rem)] text-left lg:grid-cols-[1.02fr_.98fr]">
          <div>
            {section.eyebrow ? (
              <span
                data-eyebrow={section.eyebrow}
                className="inline-flex items-center gap-2 text-[length:var(--text-micro)] leading-none font-bold tracking-[0.18em] text-white/85 uppercase"
              >
                {section.eyebrow}
              </span>
            ) : null}
            <h2 className="mt-4 font-heading text-[length:var(--text-title)] leading-[var(--text-title--line-height)] font-extrabold tracking-[-0.028em] text-balance">
              {section.titre}
              {section.titre_accent ? <> {section.titre_accent}</> : null}
            </h2>
            {section.lead ? (
              <p className="mt-[0.9rem] max-w-[52ch] text-[length:var(--text-lead)] leading-[var(--text-lead--line-height)] text-white/82">
                {section.lead}
              </p>
            ) : null}
            <div className="mt-8 flex flex-wrap gap-[0.85rem]">
              <Button
                render={<Link href="/reservation" />}
                nativeButton={false}
                size="lg"
                data-magnetic="true"
                className="bg-white text-[var(--deep)] shadow-[0_20px_40px_-18px_rgba(0,0,0,.45)] hover:bg-white hover:shadow-[0_28px_54px_-20px_rgba(0,0,0,.5)] hover:-translate-y-[2px]"
              >
                <Calendar aria-hidden="true" />
                {common.actions.reserver}
              </Button>
              <Button
                render={<Link href="/programme" />}
                nativeButton={false}
                variant="outline"
                size="lg"
                className="border-white/40 bg-white/8 text-white backdrop-blur-[8px] hover:bg-white/16 hover:text-white hover:-translate-y-[2px]"
              >
                {common.actions.voirProgramme}
              </Button>
            </div>
          </div>

          <div>
            <h3 className="text-[length:var(--text-body)] leading-[var(--text-body--line-height)] font-bold tracking-[-0.01em] text-white">
              {etapes.titre}
            </h3>
            <div className="mt-4 flex flex-col gap-[0.75rem]">
              {etapes.items.map((etape, index) => (
                <div
                  key={etape.titre}
                  className="flex items-start gap-[0.85rem] rounded-[15px] border border-white/15 bg-black/10 px-[1rem] py-[0.9rem]"
                >
                  <span className="flex size-[34px] shrink-0 items-center justify-center rounded-full bg-white text-[length:var(--text-small)] font-bold text-[var(--deep)]">
                    {index + 1}
                  </span>
                  <div className="flex flex-col gap-[0.15rem] pt-[0.1rem]">
                    <strong className="text-[length:var(--text-small)] leading-[var(--text-small--line-height)] font-bold text-white">{etape.titre}</strong>
                    <span className="text-[length:var(--text-small)] leading-[var(--text-small--line-height)] text-white/82">
                      {etape.description}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Reveal>
    </Section>
  );
}

export { CtaFinal };
