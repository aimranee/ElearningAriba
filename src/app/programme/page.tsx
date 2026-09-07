import Link from "next/link";
import { Download, Target, BookOpen } from "lucide-react";
import { z } from "zod";

import common from "@/locales/fr/common.json";
import { getSection, getSectionItems } from "@/lib/content/queries";
import { Section, SectionHeader } from "@/components/sections/section";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  EmptyState,
  EmptyStateTitle,
  EmptyStateDescription,
} from "@/components/ui/empty-state";
import { Reveal } from "@/components/motion/reveal";
import { formatHours } from "@/lib/i18n/fr";

// why (D-38): the route stays static/ISR — the content query goes through
// the cookieless public client, never the session-aware one.
export const revalidate = 3600;

/* why: `donnees` is jsonb — validated at the read boundary (CLAUDE.md)
   rather than trusted unchecked; missing arrays default to empty instead of
   failing the whole page on one malformed row. */
const moduleDonneesSchema = z.object({
  objectifs: z.array(z.string()).default([]),
  contenu: z.array(z.string()).default([]),
});

type Module = {
  id: string;
  titre: string;
  dureeHeures: number;
  objectifs: string[];
  contenu: string[];
};

export default async function Programme() {
  const [sectionResult, itemsResult] = await Promise.all([
    getSection("page-programme"),
    getSectionItems("page-programme"),
  ]);

  if (!sectionResult.ok || !itemsResult.ok) {
    return (
      <Section tone="default">
        <EmptyState tone="error">
          <EmptyStateTitle>{common.nav.programme}</EmptyStateTitle>
          <EmptyStateDescription>
            {common.etats.erreurGenerique}
          </EmptyStateDescription>
        </EmptyState>
      </Section>
    );
  }

  const section = sectionResult.data;

  const modules: Module[] = [];
  for (const item of itemsResult.data) {
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

  const telechargerPdf = itemsResult.data.find(
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
      </Section>

      <Section tone="wash">
        <div className="flex flex-wrap justify-center gap-3">
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
    </>
  );
}
