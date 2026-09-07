import { Compass, GraduationCap, ShieldCheck, type LucideIcon } from "lucide-react";

import common from "@/locales/fr/common.json";
import { getSection, getSectionItems } from "@/lib/content/queries";
import { pictograms } from "@/components/icons/pictograms";
import { Section, SectionHeader } from "@/components/sections/section";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import {
  EmptyState,
  EmptyStateTitle,
  EmptyStateDescription,
} from "@/components/ui/empty-state";
import { Reveal } from "@/components/motion/reveal";

// why (D-38): keeps the route static/ISR through the cookieless public read
// client.
export const revalidate = 3600;

const Consultant = pictograms["consultant"];

// why: the seed carries no per-block heading (D-25) — the icon keyed on
// `cle` tells the blocks apart, nothing here is an invented label.
const BLOCK_ICONS: Record<string, LucideIcon> = {
  parcours: Compass,
  legitimite: ShieldCheck,
  approche: GraduationCap,
};

type Block = {
  id: string;
  cle: string;
  texte: string;
};

export default async function APropos() {
  const [sectionResult, itemsResult] = await Promise.all([
    getSection("page-a-propos"),
    getSectionItems("page-a-propos"),
  ]);

  if (!sectionResult.ok || !itemsResult.ok) {
    return (
      <Section tone="default">
        <EmptyState tone="error">
          <EmptyStateTitle>{common.nav.aPropos}</EmptyStateTitle>
          <EmptyStateDescription>
            {common.etats.erreurGenerique}
          </EmptyStateDescription>
        </EmptyState>
      </Section>
    );
  }

  const section = sectionResult.data;

  const blocks: Block[] = [];
  for (const item of itemsResult.data) {
    if (item.titre === null) {
      continue;
    }
    blocks.push({ id: item.id, cle: item.cle, texte: item.titre });
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
        <div className="mt-10 flex justify-center">
          <div
            aria-hidden="true"
            className="atmosphere-wash relative flex size-20 shrink-0 items-center justify-center overflow-hidden rounded-2xl text-primary-foreground shadow-[var(--shadow-2)]"
          >
            <span className="atmosphere-blob -top-4 -right-4 size-16 bg-success/60" />
            <Consultant className="relative size-10" />
          </div>
        </div>
      </Section>

      <Section tone="wash">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {blocks.map((block, index) => {
            const Icon = BLOCK_ICONS[block.cle] ?? Compass;
            return (
              <Reveal
                key={block.id}
                dataD={((index % 3) + 1) as 1 | 2 | 3}
              >
                <Card variant="raised">
                  <CardHeader className="flex flex-col gap-2">
                    <Icon aria-hidden="true" className="size-6 text-primary" />
                    <CardTitle>{block.texte}</CardTitle>
                  </CardHeader>
                </Card>
              </Reveal>
            );
          })}
        </div>
      </Section>
    </>
  );
}
