import Link from "next/link";
import { Calendar, Check, FileText, GraduationCap, Radio, UserCheck } from "lucide-react";

import { Section } from "@/components/sections/section";
import { Button } from "@/components/ui/button";
import { EmptyState, EmptyStateDescription } from "@/components/ui/empty-state";
import { Reveal } from "@/components/motion/reveal";
import { getModules, getSection } from "@/lib/content/queries";
import { formatHours, formatNumber } from "@/lib/i18n/fr";
import common from "@/locales/fr/common.json";

/* why: the three pills/checklist rows share icon + gradient, indexed the
   same way as format-modalites' STEP_GRADIENTS — matched verbatim from the
   mockup (`#B4771A`/`#0E9F6E` are the same two raw-hex exceptions). */
const ASM_PILL_ICONS = [UserCheck, Radio, FileText] as const;
const ASM_PILL_GRADIENTS = [
  "linear-gradient(135deg,var(--violet),var(--indigo))",
  "linear-gradient(135deg,var(--amber),#B4771A)",
  "linear-gradient(135deg,var(--mint),#0E9F6E)",
] as const;

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
  const moduleCount = modulesResult.data.length;
  const totalHours = modulesResult.data.reduce((sum, module) => sum + module.dureeHeures, 0);
  const assemblage = common.assemblage;
  const resume = assemblage.resume
    .replace("{modules}", formatNumber(moduleCount))
    .replace("{heures}", formatHours(totalHours));

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
            className="relative overflow-hidden rounded-[22px] bg-white text-[var(--ink)] shadow-[var(--shadow-4),var(--inset-hi)]"
          >
            <div className="flex items-center gap-1.5 border-b border-[var(--border2)] bg-[linear-gradient(180deg,#fff,#FBFBFE)] px-[14px] py-[11px]">
              <span className="size-2.5 rounded-full" style={{ background: "#FF5F57" }} />
              <span className="size-2.5 rounded-full" style={{ background: "#FEBC2E" }} />
              <span className="size-2.5 rounded-full" style={{ background: "#28C840" }} />
              <span className="ml-2 truncate text-[0.72rem] font-semibold text-[var(--muted-ink)]">
                {assemblage.frameLabel}
              </span>
              <span className="ml-auto inline-flex items-center gap-[0.35rem] rounded-full bg-[var(--success-muted)] px-[0.55rem] py-[0.2rem] text-[0.68rem] font-bold text-[var(--mint)]">
                {assemblage.statut}
              </span>
            </div>

            <div className="relative grid grid-cols-[.92fr_1.08fr] items-center gap-[1.1rem] p-[1.15rem]">
              <svg
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 z-0 size-full"
                viewBox="0 0 100 100"
                preserveAspectRatio="none"
              >
                <defs>
                  <linearGradient id="asm-w1" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="var(--violet)" stopOpacity=".25" />
                    <stop offset="100%" stopColor="var(--violet)" stopOpacity=".95" />
                  </linearGradient>
                  <linearGradient id="asm-w2" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="var(--amber)" stopOpacity=".25" />
                    <stop offset="100%" stopColor="var(--violet)" stopOpacity=".95" />
                  </linearGradient>
                  <linearGradient id="asm-w3" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="var(--mint)" stopOpacity=".25" />
                    <stop offset="100%" stopColor="var(--violet)" stopOpacity=".95" />
                  </linearGradient>
                </defs>
                <path
                  d="M40 18 C 56 18, 52 50, 66 50"
                  fill="none"
                  stroke="url(#asm-w1)"
                  strokeWidth="1.6"
                  vectorEffect="non-scaling-stroke"
                />
                <path
                  d="M40 50 C 54 50, 54 50, 66 50"
                  fill="none"
                  stroke="url(#asm-w2)"
                  strokeWidth="1.6"
                  vectorEffect="non-scaling-stroke"
                />
                <path
                  d="M40 82 C 56 82, 52 50, 66 50"
                  fill="none"
                  stroke="url(#asm-w3)"
                  strokeWidth="1.6"
                  vectorEffect="non-scaling-stroke"
                />
              </svg>

              <div className="relative z-[1] flex flex-col gap-[0.6rem]">
                {assemblage.pills.map((pill, index) => {
                  const Icon = ASM_PILL_ICONS[index];
                  return (
                    <div
                      key={pill.cle}
                      className="flex items-center gap-[0.6rem] rounded-[14px] border border-[var(--hairline)] bg-white px-[0.8rem] py-[0.65rem] text-[0.84rem] font-bold tracking-[-0.01em] text-[var(--ink)] shadow-[var(--contact),var(--inset-hi)]"
                    >
                      <span
                        aria-hidden="true"
                        style={{ background: ASM_PILL_GRADIENTS[index] }}
                        className="flex size-7 shrink-0 items-center justify-center rounded-[9px] text-white"
                      >
                        {Icon ? <Icon className="size-[15px]" /> : null}
                      </span>
                      {pill.label}
                    </div>
                  );
                })}
              </div>

              <div
                className="relative z-[1] rounded-[18px] p-[1.15rem] text-white shadow-[var(--shadow-brand)]"
                style={{ background: "linear-gradient(135deg,var(--violet),var(--indigo))" }}
              >
                <span className="mb-[0.7rem] inline-flex items-center gap-[0.35rem] rounded-full bg-white/18 px-[0.6rem] py-[0.28rem] text-[0.6rem] font-extrabold tracking-[0.1em] uppercase">
                  <GraduationCap aria-hidden="true" className="size-[10px]" />
                  {assemblage.badge}
                </span>
                <h4 className="font-heading text-[1.3rem] leading-[1.1] font-extrabold tracking-[-0.025em]">
                  {assemblage.moduleTitre}
                </h4>
                <div className="mt-[0.2rem] text-[0.78rem] text-white/78">{resume}</div>
                <div className="my-[0.75rem] h-[5px] overflow-hidden rounded-full bg-white/24">
                  <span className="block h-full w-full rounded-full bg-white" />
                </div>
                {assemblage.pills.map((pill) => (
                  <div key={pill.cle} className="flex items-center gap-[0.45rem] py-[0.16rem] text-[0.78rem] font-semibold">
                    <span
                      aria-hidden="true"
                      className="flex size-4 shrink-0 items-center justify-center rounded-full bg-[var(--mint)] text-white"
                    >
                      <Check className="size-[9px]" />
                    </span>
                    {pill.label}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </Reveal>
    </Section>
  );
}

export { CtaFinal };
