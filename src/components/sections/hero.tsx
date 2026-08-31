import Link from "next/link";
import { Check, FileText, GraduationCap, Radio, Shield, UserCheck } from "lucide-react";

import { Button } from "@/components/ui/button";
import { EmptyState, EmptyStateDescription } from "@/components/ui/empty-state";
import { Reveal } from "@/components/motion/reveal";
import { Typewriter } from "@/components/motion/typewriter";
import { AssemblyConnectors } from "@/components/motion/assembly-connectors";
import { HeroSpotlight } from "@/components/motion/hero-spotlight";
import { Magnetic } from "@/components/motion/magnetic";
import { getModules, getSection, getSectionItems } from "@/lib/content/queries";
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

// why: the H1 typewriter cycles the maquette's own short-form competency
// labels (quoted verbatim from the founder-approved maquette's word-cycler
// constant, D-04) — the "competences" section stores the full descriptive
// sentences the "Ce que vous allez apprendre" cards render, which are too
// long for a zero-CLS H1 word-cycler. Keyed by content_item.cle (not array
// index) so a reorder in the database can't silently mismatch, mirroring
// the COMPETENCE_PICTOS positional-mapping precedent in src/app/page.tsx.
const TYPEWRITER_WORDS: Record<string, string> = {
  "ecosysteme-ariba": "SAP Ariba",
  "procure-to-pay": "Procure-to-Pay",
  "source-to-pay": "Source-to-Pay",
  "rfq-rfp": "les RFQ et RFP",
  "gestion-catalogues": "les catalogues",
  "contrats-workflows": "les workflows",
};

/**
 * The founder-approved maquette hero, read end to end from Supabase (D-24):
 * eyebrow, H1 (typewriter-cycled competencies over the signed accroche),
 * lead, two CTAs, three chips, and the console frame naming a live module.
 * The root visual layer (mounted once in layout.tsx, plan 02-03) shows
 * through — this section carries no per-section wash of its own (D-20).
 */
async function Hero() {
  const [sectionResult, competencesResult, modulesResult] = await Promise.all([
    getSection("hero"),
    getSectionItems("competences"),
    getModules(),
  ]);

  if (!sectionResult.ok || !competencesResult.ok || !modulesResult.ok) {
    return (
      <section data-slot="hero" className="relative overflow-hidden">
        <div className="mx-auto max-w-6xl px-4 py-24 sm:px-6 lg:px-8">
          <EmptyState tone="error">
            <EmptyStateDescription>{common.etats.erreurGenerique}</EmptyStateDescription>
          </EmptyState>
        </div>
      </section>
    );
  }

  const accroche = sectionResult.data.titre;
  const sousTitre = sectionResult.data.lead ?? "";
  const words = competencesResult.data
    .map((item) => TYPEWRITER_WORDS[item.cle])
    .filter((word): word is string => Boolean(word));

  // Split the signed accroche around its own resting word so the fixed
  // sentence text is derived from the database string, never hand-typed
  // (D-25) — only the split points are computed here. Two cuts: first the
  // lead sentence at its own period (tinted --violet, per maquette v2 · 3),
  // then the remainder around the resting word so the typewriter can sit on
  // its own line below "Maîtrisez".
  const leadSplit = accroche.indexOf(".");
  const accrocheLead = leadSplit >= 0 ? accroche.slice(0, leadSplit + 1) : accroche;
  const accrocheRest = leadSplit >= 0 ? accroche.slice(leadSplit + 1).trimStart() : "";

  const restingWord = words[0] ?? "";
  const splitIndex = restingWord ? accrocheRest.indexOf(restingWord) : -1;
  const accrochePrefix = splitIndex >= 0 ? accrocheRest.slice(0, splitIndex) : accrocheRest;
  const accrocheSuffix =
    splitIndex >= 0 ? accrocheRest.slice(splitIndex + restingWord.length) : "";

  const moduleCount = modulesResult.data.length;
  const totalHours = modulesResult.data.reduce((sum, module) => sum + module.dureeHeures, 0);
  const assemblage = common.assemblage;
  const resume = assemblage.resume
    .replace("{modules}", formatNumber(moduleCount))
    .replace("{heures}", formatHours(totalHours));

  return (
    <section
      data-slot="hero"
      className="relative overflow-hidden py-[clamp(7.5rem,13vw,10.5rem)]"
    >
      <HeroSpotlight />
      <Magnetic />
      <div className="relative z-[1] mx-auto grid max-w-6xl gap-[clamp(2rem,5vw,4.5rem)] px-4 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:px-8">
        <div className="flex flex-col gap-[1.6rem]">
          <Reveal
            as="span"
            className="inline-flex w-fit items-center gap-[0.55rem] text-[0.72rem] font-bold tracking-[0.18em] text-[var(--deep)] uppercase"
          >
            <span
              aria-hidden="true"
              className="h-0.5 w-[22px] shrink-0 rounded-full bg-[linear-gradient(90deg,var(--violet),var(--blue))]"
            />
            {common.hero.eyebrow}
          </Reveal>

          <Reveal
            as="h1"
            dataD={1}
            className="relative font-heading text-[clamp(2.5rem,4.6vw,3.9rem)] leading-[1.04] font-extrabold tracking-[-0.032em] text-balance"
          >
            <span className="sr-only">{accroche}</span>
            <span aria-hidden="true">
              <span className="text-[var(--violet)]">{accrocheLead}</span>{" "}
              {accrochePrefix}
              <br />
              <Typewriter words={words} />
              {accrocheSuffix}
            </span>
          </Reveal>

          <Reveal
            as="p"
            dataD={2}
            className="max-w-[62ch] text-[var(--text-lead)] leading-[var(--text-lead--line-height)] text-[var(--muted-ink)]"
          >
            {sousTitre}
          </Reveal>

          <Reveal as="div" dataD={3} className="flex flex-wrap gap-[0.8rem]">
            <Button
              render={<Link href="/inscription" />}
              nativeButton={false}
              size="lg"
              data-magnetic="true"
            >
              {common.actions.demarrer}
            </Button>
            <Button
              render={<Link href="/programme" />}
              nativeButton={false}
              variant="outline"
              size="lg"
            >
              <FileText />
              {common.actions.voirProgramme}
            </Button>
          </Reveal>

          <Reveal as="ul" dataD={4} className="flex flex-wrap gap-[0.6rem]">
            {common.hero.chips.map((chip) => (
              <li
                key={chip}
                className="inline-flex items-center gap-[0.45rem] rounded-full border border-[var(--border)] bg-white px-[0.9rem] py-[0.45rem] text-[0.82rem] font-semibold text-[var(--ink-soft)] shadow-[var(--shadow-1)]"
              >
                <Check className="size-3.5 text-[var(--mint)]" />
                {chip}
              </li>
            ))}
          </Reveal>
        </div>

        <Reveal as="div" dataD={2} className="relative">
          <div
            aria-hidden="true"
            className="absolute -top-[18px] -left-[14px] z-[2] flex animate-[bob_6.5s_var(--ease-brand)_infinite] items-center gap-[0.55rem] rounded-[14px] border border-white/70 bg-white/72 px-[0.9rem] py-[0.6rem] text-[0.8rem] font-semibold text-[var(--ink-soft)] shadow-[var(--shadow-2)] backdrop-blur-[18px]"
          >
            <Shield className="size-4 text-[var(--mint)]" />
            {common.hero.badges.pdf}
          </div>
          <div
            aria-hidden="true"
            className="absolute -right-[10px] -bottom-[16px] z-[2] flex animate-[bob2_7.5s_var(--ease-brand)_infinite] items-center gap-[0.55rem] rounded-[14px] border border-white/70 bg-white/72 px-[0.9rem] py-[0.6rem] text-[0.8rem] font-semibold text-[var(--ink-soft)] shadow-[var(--shadow-2)] backdrop-blur-[18px]"
          >
            <GraduationCap className="size-4 text-[var(--violet)]" />
            {common.hero.badges.certification}
          </div>

          <div
            data-slot="hero-assembly"
            className="relative overflow-hidden rounded-[22px] bg-white text-[var(--ink)] shadow-[var(--shadow-4),var(--inset-hi)]"
          >
            <div className="flex items-center gap-1.5 border-b border-[var(--border2)] bg-white px-[14px] py-[11px]">
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
              <AssemblyConnectors />

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
        </Reveal>
      </div>
    </section>
  );
}

export { Hero };
