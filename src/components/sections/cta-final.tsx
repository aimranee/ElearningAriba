import Link from "next/link";
import { Calendar, Play } from "lucide-react";

import { Section } from "@/components/sections/section";
import { Button } from "@/components/ui/button";
import { EmptyState, EmptyStateDescription } from "@/components/ui/empty-state";
import { Reveal } from "@/components/motion/reveal";
import { getModules, getSection } from "@/lib/content/queries";
import { formatHours } from "@/lib/i18n/fr";
import common from "@/locales/fr/common.json";

/**
 * PUB-07 (final CTA half) — the outer gradient panel keeps `--shadow-brand`
 * only; the `.asm` assembly card (right column) is now the section's sole
 * `--shadow-4` consumer, so the page-wide niveau-3 count stays at exactly
 * two persistent surfaces (hero console, this card — D-23/AC-2). No price,
 * no formula, no payment provider name (D-45) — the closing support line
 * and the assembly card both restate the left column's own signed content,
 * nothing new is authored.
 */
async function CtaFinal() {
  const [sectionResult, modulesResult] = await Promise.all([getSection("cta-final"), getModules()]);

  if (!sectionResult.ok || !modulesResult.ok) {
    return (
      <Section tone="default">
        <EmptyState tone="error">
          <EmptyStateDescription>{common.etats.erreurGenerique}</EmptyStateDescription>
        </EmptyState>
      </Section>
    );
  }

  const section = sectionResult.data;
  const liveModule = modulesResult.data[1] ?? modulesResult.data[0];

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
                className="inline-flex items-center gap-2 text-[0.72rem] leading-none font-bold tracking-[0.18em] text-white/85 uppercase"
              >
                {section.eyebrow}
              </span>
            ) : null}
            <h2 className="mt-4 font-heading text-[clamp(2rem,4vw,3rem)] leading-[1.08] font-extrabold tracking-[-0.028em] text-balance">
              {section.titre}
              {section.titre_accent ? <> {section.titre_accent}</> : null}
            </h2>
            {section.lead ? (
              <p className="mt-[0.9rem] max-w-[52ch] text-[1.1rem] leading-[1.6] text-white/82">
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
            <p className="mt-6 text-[0.87rem] text-white/68">{common.hero.chips.join(" · ")}</p>
          </div>

          <div
            aria-hidden="true"
            className="relative overflow-hidden rounded-[20px] bg-white text-[var(--ink)] shadow-[var(--shadow-4)]"
          >
            <div className="flex items-center gap-[6px] border-b border-[var(--border2)] bg-[linear-gradient(180deg,#fff,#FBFBFE)] px-[14px] py-[11px]">
              <span className="size-[10px] shrink-0 rounded-full bg-[#FF5F57]" />
              <span className="size-[10px] shrink-0 rounded-full bg-[#FEBC2E]" />
              <span className="size-[10px] shrink-0 rounded-full bg-[#28C840]" />
              <span className="ml-[0.6rem] font-sans text-[0.72rem] text-[var(--muted2)]">
                {common.hero.console.url}
              </span>
            </div>
            <div className="flex flex-col gap-[0.85rem] p-[1.15rem]">
              <div className="flex items-center gap-[0.7rem] rounded-[13px] bg-[var(--lav2)] px-[0.85rem] py-[0.7rem]">
                <span
                  aria-hidden="true"
                  className="size-2 shrink-0 animate-pulse rounded-full bg-[#EF4444]"
                />
                <div className="flex flex-1 flex-col gap-[0.1rem]">
                  <strong className="text-[0.9rem] tracking-[-0.015em]">
                    {liveModule.titre}
                  </strong>
                  <span className="text-[0.78rem] text-[var(--muted-ink)]">
                    {common.hero.console.liveLabel} · {formatHours(liveModule.dureeHeures)} ·{" "}
                    {common.hero.console.liveAnimator}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-[0.5rem] pt-[0.15rem]">
                <Calendar className="size-[15px] text-[var(--deep)]" />
                <span className="text-[0.78rem] font-bold tracking-[0.1em] text-[var(--deep)] uppercase">
                  {common.hero.console.slotsLabel}
                </span>
              </div>
              {common.hero.console.slots.map((slot) => (
                <div
                  key={slot.date}
                  className="flex items-center justify-between gap-[0.75rem] rounded-[13px] border-[1.5px] border-[var(--border)] bg-white px-[0.85rem] py-[0.7rem]"
                >
                  <div className="flex flex-1 flex-col gap-[0.05rem]">
                    <span className="text-[0.92rem] font-bold tabular-nums">{slot.date}</span>
                    <span className="text-[0.76rem] text-[var(--muted-ink)]">{slot.places}</span>
                  </div>
                  {"tag" in slot && slot.tag ? (
                    <span className="text-[0.72rem] font-semibold text-[var(--mint)]">
                      {slot.tag}
                    </span>
                  ) : null}
                </div>
              ))}
              <div className="flex items-center gap-[0.6rem] rounded-[13px] border-[1.5px] border-dashed border-[#D6D3F0] px-[0.85rem] py-[0.75rem] text-[0.82rem] text-[var(--muted-ink)]">
                <Play className="size-4 shrink-0 text-[var(--violet)]" />
                {common.hero.console.videoPlaceholder}
              </div>
            </div>
          </div>
        </div>
      </Reveal>
    </Section>
  );
}

export { CtaFinal };
