import Link from "next/link";
import { Calendar, CheckCircle2, Download, FileText, Video } from "lucide-react";
import { z } from "zod";

import common from "@/locales/fr/common.json";
import formation from "@/locales/fr/formation.json";
import { getSection, getSectionItems } from "@/lib/content/queries";
import { Section, SectionHeader } from "@/components/sections/section";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  EmptyState,
  EmptyStateTitle,
  EmptyStateDescription,
} from "@/components/ui/empty-state";
import { Reveal } from "@/components/motion/reveal";
import { CarteModule, type ModuleProgramme } from "@/components/formation/carte-module";
import { AideRdv, RDV_DECOUVERTE_HREF, texteAideRdv } from "@/components/formation/aide-rdv";
import { BarreRdv } from "@/components/formation/barre-rdv";
import { BandeauRdv } from "@/components/formation/bandeau-rdv";
import { Temoignages } from "@/components/formation/temoignages";
import { formatHours, formatNumber } from "@/lib/i18n/fr";

// why (D-38): keeps the route static/ISR through the cookieless public read
// client.
export const revalidate = 3600;

/* why: `donnees` is jsonb — validated at the read boundary (CLAUDE.md). */
const derouleDonneesSchema = z.object({
  deroule: z.array(z.string()).default([]),
});

const fourniDonneesSchema = z.object({
  fourni: z.array(z.string()).default([]),
  prerequis: z.string().optional(),
  dureeAcces: z.string().optional(),
});

/* why (#27): the § 4.1 facts ride a `chiffres` row; every key is optional so
   a database that predates the row still renders the header. */
const chiffresDonneesSchema = z.object({
  enDirect: z.string().optional(),
  pedagogie: z.string().optional(),
  seance: z.string().optional(),
});

/* why (Lot 2, #16 / #27): the five developed modules — same `page-programme`
   rows, same read-boundary schema; objectifPedagogique and casPratique are
   optional so rows that do not carry them yet still render. */
const moduleDonneesSchema = z.object({
  objectifs: z.array(z.string()).default([]),
  contenu: z.array(z.string()).default([]),
  objectifPedagogique: z.string().optional(),
  casPratique: z.string().optional(),
});

type Modalite = {
  id: string;
  titre: string;
  description: string | null;
  statut: string | null;
};

type Fait = { label: string; valeur: string };

/* why (2026-09-01, format-deroule.tsx): the only palette fills that carry a
   white number at AA — flat, never a gradient, one measurable point. */
const ETAPE_TEINTES = [
  "var(--violet)",
  "var(--deep)",
  "var(--blue-ink)",
  "var(--sky-ink)",
  "var(--mint-ink)",
] as const;

export default async function Formation() {
  const [sectionResult, itemsResult, programmeSectionResult, programmeItemsResult] =
    await Promise.all([
      getSection("page-formation"),
      getSectionItems("page-formation"),
      getSection("page-programme"),
      getSectionItems("page-programme"),
    ]);

  if (
    !sectionResult.ok ||
    !itemsResult.ok ||
    !programmeSectionResult.ok ||
    !programmeItemsResult.ok
  ) {
    return (
      <Section tone="default">
        <EmptyState tone="error">
          <EmptyStateTitle>{common.nav.formation}</EmptyStateTitle>
          <EmptyStateDescription>
            {common.etats.erreurGenerique}
          </EmptyStateDescription>
        </EmptyState>
      </Section>
    );
  }

  const section = sectionResult.data;
  const programmeSection = programmeSectionResult.data;

  const modalites: Modalite[] = [];
  let deroule: string[] = [];
  let fourni: string[] = [];
  let prerequis: string | undefined;
  let dureeAcces: string | undefined;
  let chiffres: z.infer<typeof chiffresDonneesSchema> = {};

  for (const item of itemsResult.data) {
    if (item.cle === "deroule") {
      const parsed = derouleDonneesSchema.safeParse(item.donnees);
      if (parsed.success) {
        deroule = parsed.data.deroule;
      }
      continue;
    }
    if (item.cle === "fourni") {
      const parsed = fourniDonneesSchema.safeParse(item.donnees);
      if (parsed.success) {
        fourni = parsed.data.fourni;
        prerequis = parsed.data.prerequis;
        dureeAcces = parsed.data.dureeAcces;
      }
      continue;
    }
    if (item.cle === "chiffres") {
      const parsed = chiffresDonneesSchema.safeParse(item.donnees);
      if (parsed.success) {
        chiffres = parsed.data;
      }
      continue;
    }
    if (item.titre !== null) {
      modalites.push({
        id: item.id,
        titre: item.titre,
        description: item.description,
        statut: item.statut,
      });
    }
  }

  /* why (Lot 2, #16): same block-fail read as the former /programme page —
     a malformed module row is dropped, not thrown across the boundary. */
  const modules: ModuleProgramme[] = [];
  for (const item of programmeItemsResult.data) {
    if (item.titre === null || item.duree_heures === null) {
      continue;
    }
    const parsed = moduleDonneesSchema.safeParse(item.donnees);
    if (!parsed.success) {
      continue;
    }
    modules.push({
      id: item.id,
      titre: item.titre,
      dureeHeures: item.duree_heures,
      objectifs: parsed.data.objectifs,
      contenu: parsed.data.contenu,
      objectifPedagogique: parsed.data.objectifPedagogique,
      casPratique: parsed.data.casPratique,
    });
  }

  const telechargerPdf = programmeItemsResult.data.find(
    (item) => item.cle === "telecharger-pdf",
  )?.titre;

  const totalHeures = modules.reduce((sum, module) => sum + module.dureeHeures, 0);
  const faits: Fait[] = [
    {
      label: formation.faits.parcours,
      valeur: formation.faits.parcoursValeur
        .replace("{modules}", formatNumber(modules.length))
        .replace("{heures}", formatHours(totalHeures)),
    },
  ];
  if (chiffres.enDirect) faits.push({ label: formation.faits.format, valeur: chiffres.enDirect });
  if (chiffres.pedagogie) faits.push({ label: formation.faits.pedagogie, valeur: chiffres.pedagogie });
  if (chiffres.seance) faits.push({ label: formation.faits.seance, valeur: chiffres.seance });

  return (
    <>
      {/* 1. Header — eyebrow / title / lead from the page-formation row, the
          two actions, the facts strip, then the modalités compacted. */}
      <Section tone="default" data-section="formation-entete">
        <SectionHeader
          eyebrow={section.eyebrow ?? undefined}
          title={section.titre}
          titleAccent={section.titre_accent ?? undefined}
          lead={section.lead ?? undefined}
        />
        <Reveal dataD={1} className="mt-8 flex flex-wrap justify-center gap-[0.8rem]">
          <Button
            render={<Link href="/reservation" />}
            nativeButton={false}
            size="lg"
            data-magnetic="true"
            className="min-h-11"
          >
            <Calendar aria-hidden="true" />
            {common.actions.prendreRdv}
          </Button>
          <Button
            render={<a href="#programme" />}
            nativeButton={false}
            variant="outline"
            size="lg"
            className="min-h-11"
          >
            <FileText aria-hidden="true" />
            {common.actions.voirProgramme}
          </Button>
        </Reveal>

        <Reveal
          as="dl"
          dataD={2}
          className="mx-auto mt-10 grid max-w-4xl grid-cols-2 gap-3 md:grid-cols-4"
        >
          {faits.map((fait) => (
            <div
              key={fait.label}
              className="rounded-[16px] border border-[var(--hairline)] bg-[var(--tint)] px-4 py-3"
            >
              <dt className="text-[length:var(--text-micro)] leading-[var(--text-micro--line-height)] font-bold tracking-[0.14em] text-[var(--muted-ink)] uppercase">
                {fait.label}
              </dt>
              <dd className="mt-1 font-heading text-[length:var(--text-body)] leading-[var(--text-body--line-height)] font-bold text-[var(--ink)]">
                {fait.valeur}
              </dd>
            </div>
          ))}
        </Reveal>

        {/* 2. Modalités — every row renders, compactly. */}
        <div className="mx-auto mt-8 grid max-w-4xl gap-3 md:grid-cols-2">
          {modalites.map((modalite, index) => {
            const isFutur = modalite.statut === "futur";
            return (
              <Reveal key={modalite.id} dataD={((index % 5) + 3) as 1 | 2 | 3 | 4 | 5}>
                <Card variant="tint" className="h-full flex-row items-start gap-3 px-4 py-4">
                  <span
                    aria-hidden="true"
                    className="flex size-[38px] shrink-0 items-center justify-center rounded-[12px]"
                    style={
                      isFutur
                        ? { background: "var(--amber-wash)", color: "var(--amber-ink)" }
                        : { background: "var(--lav)", color: "var(--deep)" }
                    }
                  >
                    {isFutur ? (
                      <Video aria-hidden="true" className="size-5" />
                    ) : (
                      <CheckCircle2 aria-hidden="true" className="size-5" />
                    )}
                  </span>
                  <div className="flex min-w-0 flex-col gap-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-heading text-[length:var(--text-body)] leading-[var(--text-body--line-height)] font-bold text-[var(--ink)]">
                        {modalite.titre}
                      </h3>
                      {isFutur ? (
                        <span
                          className="inline-flex items-center rounded-full px-[0.55rem] py-[0.22rem] text-[0.68rem] leading-none font-bold tracking-[0.06em] uppercase"
                          style={{ color: "var(--amber-ink)", background: "var(--amber-wash)" }}
                        >
                          {formation.aVenir}
                        </span>
                      ) : null}
                    </div>
                    {modalite.description ? (
                      <p className="text-[length:var(--text-small)] leading-[var(--text-small--line-height)] text-[var(--muted-ink)]">
                        {modalite.description}
                      </p>
                    ) : null}
                  </div>
                </Card>
              </Reveal>
            );
          })}
        </div>
      </Section>

      {/* 3. Programme — the anchor every « Voir le programme » link targets.
          why (#27 § 8): at lg the helper tile sits in a sticky side column
          beside the cards; below lg it is not rendered and the fixed bottom
          bar (below md) carries the same call. */}
      <Section id="programme" tone="wash" data-section="programme">
        <SectionHeader
          eyebrow={programmeSection.eyebrow ?? undefined}
          title={programmeSection.titre}
          titleAccent={programmeSection.titre_accent ?? undefined}
          lead={programmeSection.lead ?? undefined}
        />
        <div className="mt-10 lg:grid lg:grid-cols-[minmax(0,1fr)_17rem] lg:items-start lg:gap-8">
          <div className="min-w-0">
            <div className="grid gap-5 md:grid-cols-2">
              {modules.map((module, index) => (
                <Reveal key={module.id} dataD={((index % 5) + 1) as 1 | 2 | 3 | 4 | 5}>
                  <CarteModule module={module} index={index} />
                </Reveal>
              ))}
            </div>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              {telechargerPdf ? (
                <Button
                  variant="ghost"
                  render={<a href="/programme.pdf" />}
                  nativeButton={false}
                  className="min-h-11"
                >
                  <Download aria-hidden="true" />
                  {telechargerPdf}
                </Button>
              ) : null}
              <Button
                render={<Link href="/reservation" />}
                nativeButton={false}
                data-magnetic="true"
                className="min-h-11"
              >
                {common.actions.reserver}
              </Button>
            </div>
          </div>
          <AideRdv className="hidden lg:sticky lg:top-[104px] lg:flex" />
        </div>
      </Section>

      {/* 4. Déroulé — the deroule row as a numbered sequence. */}
      <Section tone="default" data-section="deroule">
        <SectionHeader title={formation.derouleTitre} />
        <ol className="relative mx-auto mt-10 flex max-w-2xl flex-col gap-3">
          <span
            aria-hidden="true"
            className="absolute top-6 bottom-6 left-[20px] w-0.5 bg-[linear-gradient(180deg,var(--violet),var(--sky-ink)_60%,var(--mint-ink))]"
          />
          {deroule.map((etape, index) => (
            <Reveal
              key={etape}
              as="li"
              dataD={((index % 5) + 1) as 1 | 2 | 3 | 4 | 5}
              className="relative grid grid-cols-[42px_minmax(0,1fr)] items-start gap-4"
            >
              <span
                aria-hidden="true"
                style={{ backgroundColor: ETAPE_TEINTES[index % ETAPE_TEINTES.length] }}
                className="relative z-[1] flex size-[42px] items-center justify-center rounded-[14px] text-[length:var(--text-micro)] leading-none font-extrabold text-white tabular-nums shadow-[0_0_0_5px_var(--paper)]"
              >
                {String(index + 1).padStart(2, "0")}
              </span>
              <p className="rounded-[18px] border border-[var(--hairline)] bg-white px-5 py-3.5 text-[length:var(--text-body)] leading-[var(--text-body--line-height)] text-[var(--ink)]">
                {etape}
              </p>
            </Reveal>
          ))}
        </ol>
      </Section>

      {/* 5. Fourni — the fourni row with prerequis and dureeAcces. */}
      <Section tone="wash" data-section="fourni">
        <SectionHeader title={formation.fourniTitre} />
        <Reveal className="mx-auto mt-10 max-w-2xl">
          <Card variant="raised" className="gap-5 px-6 py-6">
            <ul className="flex flex-col gap-3">
              {fourni.map((item) => (
                <li
                  key={item}
                  className="flex items-start gap-3 text-[length:var(--text-body)] leading-[var(--text-body--line-height)] text-[var(--ink)]"
                >
                  <span
                    aria-hidden="true"
                    className="mt-[0.2rem] flex size-5 shrink-0 items-center justify-center rounded-full bg-[var(--mint-ink)] text-white"
                  >
                    <CheckCircle2 aria-hidden="true" className="size-[13px]" />
                  </span>
                  {item}
                </li>
              ))}
            </ul>
            {prerequis || dureeAcces ? (
              <div className="flex flex-col gap-1.5 border-t border-[var(--hairline)] pt-4 text-[length:var(--text-small)] leading-[var(--text-small--line-height)] text-[var(--muted-ink)]">
                {prerequis ? <p>{prerequis}</p> : null}
                {dureeAcces ? <p>{dureeAcces}</p> : null}
              </div>
            ) : null}
          </Card>
        </Reveal>
      </Section>

      {/* 6. Témoignages — placeholder entries, registered under C-27. */}
      <Temoignages />

      {/* 7. RDV band above the footer. */}
      <BandeauRdv />

      {/* 8. Sticky RDV below md — last in DOM order so its Tab position sits
          after the band's actions, where the bar is visible, not at the top
          of the page where it is hidden. */}
      <BarreRdv href={RDV_DECOUVERTE_HREF} texte={texteAideRdv()} />
    </>
  );
}
