import Link from "next/link";
import { Calendar, Check, FileText, UserCheck, Users } from "lucide-react";

import { Button } from "@/components/ui/button";
import { EmptyState, EmptyStateDescription } from "@/components/ui/empty-state";
import { Reveal } from "@/components/motion/reveal";
import { Typewriter } from "@/components/motion/typewriter";
import { Magnetic } from "@/components/motion/magnetic";
import { FluxAchat } from "@/components/illustrations/flux-achat";
import { getModules, getSection, getSectionItems } from "@/lib/content/queries";
import { formatHours, formatNumber } from "@/lib/i18n/fr";
import { getMessages } from "@/lib/i18n/messages";
import type { Locale } from "@/lib/i18n/locale";
import { localizedPath } from "@/lib/i18n/routes";

/* why: the three proof-line facts (D-103) now render as an icon list
   (brief §C-01) — one lucide icon per fact, matched 1:1 by array index to
   `preuve` below (modules count, formateur, groupe). */
const PROOF_ICONS = [Calendar, UserCheck, Users] as const;

// why: post-2026-09-01, "Ce que vous allez apprendre" carries six
// verb-first result headlines plus a permanently-visible sentence
// (content_item.description) — the typewriter here cycles the short form of
// the same competency term, not the sentence. Keyed by content_item.cle (not
// array index) so a reorder in the database can't silently mismatch. The
// first item's cle ("ecosysteme-ariba") is load-bearing: the hero takes
// words[0] as the resting word that splits the signed accroche around
// "SAP Ariba" — changing that item's cle or dropping its word regresses the
// H1 split silently. (#22) The words are copy, in landing.json
// `hero.typewriter`, one set per language.

/**
 * The v3 "Le parcours" hero (brief §C-01), read end to end from Supabase
 * (D-24): two chips above the H1, the typewriter-cycled accroche, lead, two
 * CTAs, a three-fact icon proof line, and the `FluxAchat` illustration
 * replacing the old assembly-card console. The primary CTA now points at
 * `/reservation` (brief §D) — the visitor picks a slot before creating an
 * account. Own dot-grid + glow pseudo-layers on `data-slot="hero"` (no
 * per-section wash elsewhere, D-20).
 */
async function Hero({ locale }: { locale: Locale }) {
  const common = getMessages(locale, "common");
  const landing = getMessages(locale, "landing");
  const typewriterWords: Record<string, string> = landing.hero.typewriter;
  const [sectionResult, competencesResult, modulesResult] = await Promise.all([
    getSection("hero", locale),
    getSectionItems("competences", locale),
    getModules(locale),
  ]);

  if (!sectionResult.ok || !competencesResult.ok || !modulesResult.ok) {
    return (
      <section data-slot="hero" data-section="top" className="relative overflow-hidden">
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
    .map((item) => typewriterWords[item.cle])
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
  const hasValidSplit = leadSplit >= 0 && splitIndex >= 0;

  // D-103: entry 1 is derived from the database (never hand-typed); entry 2
  // (formateur) is a registered placeholder (CADR-03); entry 3 (groupe) is
  // the client's fact (§ 4.1, 6 participants maximum, 2026-09-14) — the
  // mocks registry is what keeps entry 2 from shipping unseen at go-live.
  const moduleCount = modulesResult.data.length;
  const totalHours = modulesResult.data.reduce((sum, module) => sum + module.dureeHeures, 0);
  const preuveModules = landing.hero.preuve.modules
    .replace("{modules}", formatNumber(moduleCount, locale))
    .replace("{heures}", formatHours(totalHours, locale));
  const preuve = [preuveModules, landing.hero.preuve.formateur, landing.hero.preuve.groupe];

  return (
    <section
      data-slot="hero"
      data-section="top"
      className={
        "relative overflow-hidden py-[clamp(5rem,9vw,7rem)] " +
        "after:pointer-events-none after:absolute after:inset-0 after:content-[''] " +
        "after:[background:radial-gradient(55%_45%_at_12%_8%,rgba(99,91,255,.13),transparent_70%),radial-gradient(40%_40%_at_100%_45%,rgba(15,126,166,.07),transparent_70%)]"
      }
    >
      <Magnetic />
      <div className="relative z-[1] mx-auto grid max-w-6xl gap-[clamp(2rem,5vw,4.5rem)] px-4 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:px-8">
        <div className="flex flex-col gap-[1.6rem]">
          <Reveal as="ul" dataD={1} className="flex flex-wrap gap-[0.6rem]">
            {common.hero.chips.map((chip) => (
              <li
                key={chip}
                className="inline-flex items-center gap-[0.45rem] rounded-full border border-[var(--border)] bg-white px-[0.9rem] py-[0.45rem] text-[length:var(--text-small)] leading-[var(--text-small--line-height)] font-semibold text-[var(--ink-soft)] shadow-[var(--shadow-1)]"
              >
                <Check className="size-3.5 text-[var(--mint)]" />
                {chip}
              </li>
            ))}
          </Reveal>

          <Reveal
            as="h1"
            dataD={2}
            className="relative font-heading text-[length:var(--text-display)] leading-[var(--text-display--line-height)] font-extrabold tracking-[-0.032em] text-balance"
          >
            <span className="sr-only">{accroche}</span>
            {hasValidSplit ? (
              <span aria-hidden="true">
                <span className="text-[var(--ink)]">{accrocheLead}</span>{" "}
                {accrochePrefix}
                <br />
                <Typewriter words={words} />
                {accrocheSuffix}
              </span>
            ) : (
              <span aria-hidden="true">{accroche}</span>
            )}
          </Reveal>

          <Reveal
            as="p"
            dataD={3}
            className="max-w-[62ch] text-[length:var(--text-lead)] leading-[var(--text-lead--line-height)] text-[var(--muted-ink)]"
          >
            {sousTitre}
          </Reveal>

          <Reveal as="div" dataD={4} className="flex flex-wrap gap-[0.8rem]">
            <Button
              render={<Link href="/reservation" />}
              nativeButton={false}
              size="lg"
              data-magnetic="true"
              className="min-h-11"
            >
              {common.actions.prendreRdv}
            </Button>
            <Button
              render={<Link href={`${localizedPath("/formation", locale)}#programme`} />}
              nativeButton={false}
              variant="outline"
              size="lg"
              className="min-h-11"
            >
              <FileText />
              {common.actions.voirProgramme}
            </Button>
          </Reveal>

          <Reveal
            as="ul"
            dataD={5}
            className="flex flex-wrap gap-[0.6rem] gap-y-[0.6rem] text-[length:var(--text-small)] text-[var(--muted-ink)]"
          >
            {preuve.map((fait, index) => {
              const Icon = PROOF_ICONS[index];
              return (
                <li key={fait} className="inline-flex items-center gap-[0.5rem] pr-[1.4rem]">
                  {Icon ? <Icon className="size-4 text-[var(--deep)]" /> : null}
                  {fait}
                </li>
              );
            })}
          </Reveal>
        </div>

        <Reveal as="div" dataD={2} className="relative min-w-0">
          <FluxAchat locale={locale} />
        </Reveal>
      </div>
    </section>
  );
}

export { Hero };
