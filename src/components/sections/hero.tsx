import Link from "next/link";
import { Calendar, Check, FileText, GraduationCap, Play, Shield } from "lucide-react";

import { Button } from "@/components/ui/button";
import { EmptyState, EmptyStateDescription } from "@/components/ui/empty-state";
import { Reveal } from "@/components/motion/reveal";
import { Typewriter } from "@/components/motion/typewriter";
import { HeroSpotlight } from "@/components/motion/hero-spotlight";
import { Magnetic } from "@/components/motion/magnetic";
import { getModules, getSection, getSectionItems } from "@/lib/content/queries";
import { formatHours } from "@/lib/i18n/fr";
import common from "@/locales/fr/common.json";

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
  // (D-25) — only the split point is computed here.
  const restingWord = words[0] ?? "";
  const splitIndex = restingWord ? accroche.indexOf(restingWord) : -1;
  const accrochePrefix = splitIndex >= 0 ? accroche.slice(0, splitIndex) : accroche;
  const accrocheSuffix =
    splitIndex >= 0 ? accroche.slice(splitIndex + restingWord.length) : "";

  const liveModule = modulesResult.data[1] ?? modulesResult.data[0];

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
              {accrochePrefix}
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
            data-slot="hero-console"
            className="relative overflow-hidden rounded-[20px] bg-white shadow-[var(--shadow-4)]"
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
        </Reveal>
      </div>
    </section>
  );
}

export { Hero };
