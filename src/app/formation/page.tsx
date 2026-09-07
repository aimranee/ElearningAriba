import { CheckCircle2, Video } from "lucide-react";
import { z } from "zod";

import common from "@/locales/fr/common.json";
import { getSection, getSectionItems } from "@/lib/content/queries";
import { Section, SectionHeader } from "@/components/sections/section";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  EmptyState,
  EmptyStateTitle,
  EmptyStateDescription,
} from "@/components/ui/empty-state";
import { Reveal } from "@/components/motion/reveal";

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

type Modalite = {
  id: string;
  titre: string;
  description: string | null;
  statut: string | null;
};

export default async function Formation() {
  const [sectionResult, itemsResult] = await Promise.all([
    getSection("page-formation"),
    getSectionItems("page-formation"),
  ]);

  if (!sectionResult.ok || !itemsResult.ok) {
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
