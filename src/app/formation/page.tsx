import Link from "next/link";
import { CheckCircle2, Video, Download, Target, BookOpen } from "lucide-react";
import { z } from "zod";

import common from "@/locales/fr/common.json";
import { getSection, getSectionItems } from "@/lib/content/queries";
import { Section, SectionHeader } from "@/components/sections/section";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  EmptyState,
  EmptyStateTitle,
  EmptyStateDescription,
} from "@/components/ui/empty-state";
import { Reveal } from "@/components/motion/reveal";
import { formatHours } from "@/lib/i18n/fr";

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

/* why (Lot 2, #16): the five developed modules, merged in from the former
   /programme page — same `page-programme` rows, same read-boundary schema. */
const moduleDonneesSchema = z.object({
  objectifs: z.array(z.string()).default([]),
  contenu: z.array(z.string()).default([]),
});

type Modalite = {
  id: string;
  titre: string;
  description: string | null;
  statut: string | null;
};

type ModuleProgramme = {
  id: string;
  titre: string;
  dureeHeures: number;
  objectifs: string[];
  contenu: string[];
};

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
    });
  }

  const telechargerPdf = programmeItemsResult.data.find(
    (item) => item.cle === "telecharger-pdf",
  )?.titre;

  return (
    <>
      <Section tone="default">
        <SectionHeader
          eyebrow={section.eyebrow ?? undefined}
          title={section.titre}
          titleAccent={section.titre_accent ?? undefined}
          lead={section.lead ?? undefined}
        />
        <div className="mt-10 grid grid-cols-1 gap-4 md:grid-cols-2">
          {modalites.map((modalite, index) => {
            const isFutur = modalite.statut === "futur";
            return (
              <Reveal
                key={modalite.id}
                dataD={((index % 5) + 1) as 1 | 2 | 3 | 4 | 5}
              >
                <Card variant="raised">
                  <CardHeader className="flex flex-row items-start gap-3">
                    <span
                      aria-hidden="true"
                      className="flex size-[42px] shrink-0 items-center justify-center rounded-[13px]"
                      style={
                        isFutur
                          ? { background: "#FFF4E3", color: "#B4771A" }
                          : { background: "var(--lav)", color: "var(--deep)" }
                      }
                    >
                      {isFutur ? (
                        <Video aria-hidden="true" className="size-5" />
                      ) : (
                        <CheckCircle2 aria-hidden="true" className="size-5" />
                      )}
                    </span>
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2">
                        <CardTitle>{modalite.titre}</CardTitle>
                        {isFutur ? (
                          <span
                            className="inline-flex items-center rounded-full px-[0.55rem] py-[0.22rem] text-[0.68rem] font-bold uppercase tracking-[0.06em]"
                            style={{ color: "#B4771A", background: "#FFF4E3" }}
                          >
                            À venir
                          </span>
                        ) : null}
                      </div>
                      {modalite.description ? (
                        <CardDescription className="px-0">
                          {modalite.description}
                        </CardDescription>
                      ) : null}
                    </div>
                  </CardHeader>
                </Card>
              </Reveal>
            );
          })}
        </div>
      </Section>

      {/* why (Lot 2, #16): the merged /programme content — same anchor every
          "Voir le programme" link on the site now targets. */}
      <Section id="programme" tone="default">
        <SectionHeader
          eyebrow={programmeSection.eyebrow ?? undefined}
          title={programmeSection.titre}
          titleAccent={programmeSection.titre_accent ?? undefined}
          lead={programmeSection.lead ?? undefined}
        />
        <div className="mt-10 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {modules.map((module, index) => (
            <Reveal
              key={module.id}
              dataD={((index % 5) + 1) as 1 | 2 | 3 | 4 | 5}
            >
              <Card variant="raised">
                <CardHeader className="flex flex-row items-center gap-3">
                  <span
                    aria-hidden="true"
                    className="flex size-8 shrink-0 items-center justify-center rounded-[11px] bg-[linear-gradient(135deg,var(--violet),var(--deep))] text-xs font-bold tabular-nums text-white"
                  >
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <CardTitle className="flex-1">{module.titre}</CardTitle>
                  <Badge>{formatHours(module.dureeHeures)}</Badge>
                </CardHeader>
                <CardContent className="flex flex-col gap-3">
                  <ul className="flex flex-col gap-1.5 text-sm text-foreground/80">
                    {module.objectifs.map((objectif) => (
                      <li key={objectif} className="flex items-start gap-2">
                        <Target
                          aria-hidden="true"
                          className="mt-0.5 size-4 shrink-0 text-primary"
                        />
                        <span>{objectif}</span>
                      </li>
                    ))}
                  </ul>
                  <ul className="flex flex-col gap-1.5 text-sm text-muted-foreground">
                    {module.contenu.map((item) => (
                      <li key={item} className="flex items-start gap-2">
                        <BookOpen
                          aria-hidden="true"
                          className="mt-0.5 size-4 shrink-0 text-muted-foreground"
                        />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </Reveal>
          ))}
        </div>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          {telechargerPdf ? (
            <Button
              variant="ghost"
              render={<a href="/programme.pdf" />}
              nativeButton={false}
            >
              <Download aria-hidden="true" />
              {telechargerPdf}
            </Button>
          ) : null}
          <Button
            render={<Link href="/reservation" />}
            nativeButton={false}
            data-magnetic="true"
          >
            {common.actions.reserver}
          </Button>
        </div>
      </Section>

      <Section tone="wash">
        <SectionHeader title="Le déroulé d'une session" />
        <ol className="mx-auto mt-10 flex max-w-2xl flex-col gap-3">
          {deroule.map((etape, index) => (
            <li key={etape} className="flex items-start gap-3 text-sm text-foreground/80">
              <span
                aria-hidden="true"
                className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary"
              >
                {index + 1}
              </span>
              <span>{etape}</span>
            </li>
          ))}
        </ol>
      </Section>

      <Section tone="default">
        <SectionHeader title="Ce qui est fourni" />
        <div className="mx-auto mt-10 flex max-w-2xl flex-col gap-6">
          <Card variant="raised">
            <CardHeader className="flex flex-col gap-3">
              <ul className="flex flex-col gap-1.5 text-sm text-foreground/80">
                {fourni.map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <CheckCircle2
                      aria-hidden="true"
                      className="mt-0.5 size-4 shrink-0 text-success"
                    />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              {prerequis ? <CardDescription className="px-0">{prerequis}</CardDescription> : null}
              {dureeAcces ? <CardDescription className="px-0">{dureeAcces}</CardDescription> : null}
            </CardHeader>
          </Card>
        </div>
      </Section>
    </>
  );
}
