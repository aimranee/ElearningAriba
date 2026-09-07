import { Check, PhoneCall, UserCheck, Users, type LucideIcon } from "lucide-react";
import Link from "next/link";

import { Section, SectionHeader } from "@/components/sections/section";
import { Card } from "@/components/ui/card";
import { EmptyState, EmptyStateDescription } from "@/components/ui/empty-state";
import { Reveal } from "@/components/motion/reveal";
import { ConfianceFaits } from "@/components/motion/confiance-faits";
import { getSection, getConfianceFaits } from "@/lib/content/queries";
import common from "@/locales/fr/common.json";
import landing from "@/locales/fr/landing.json";

/* why: the three faits carry generic marks (phone/check/users), the same
   class pictograms.tsx's header reserves for lucide-react at the call site
   rather than the domain sprite. Keyed by the item's stable cle. */
const CONFIANCE_ICONS: Record<string, LucideIcon> = {
  "appel-decouverte": PhoneCall,
  "formateur-identifie": UserCheck,
  "groupe-limite": Users,
};

/**
 * PUB-06 — three verifiable trust facts (D-62), each with a click-to-reveal
 * proof (D-64), plus a code-composed formateur card replacing the old
 * outlined photo placeholder (D-63). Server component; the toggle mechanism
 * alone lives in the client island ConfianceFaits.
 */
async function Confiance() {
  const [sectionResult, faitsResult] = await Promise.all([
    getSection("confiance"),
    getConfianceFaits(),
  ]);

  if (!sectionResult.ok || !faitsResult.ok) {
    return (
      <Section tone="wash">
        <EmptyState tone="error">
          <EmptyStateDescription>{common.etats.erreurGenerique}</EmptyStateDescription>
        </EmptyState>
      </Section>
    );
  }

  const section = sectionResult.data;
  const { formateur } = landing.confiance;

  return (
    <Section tone="wash" data-section="confiance">
      <div className="grid items-start gap-10 lg:grid-cols-2">
        <SectionHeader
          eyebrow={section.eyebrow ?? undefined}
          title={section.titre}
          titleAccent={section.titre_accent ?? undefined}
          lead={section.lead ?? undefined}
          className="mx-0 max-w-none text-left"
        />
        <Reveal as="aside" dataD={2}>
          <Card variant="default" className="flex h-full flex-col gap-4 p-[1.7rem]">
            <span className="text-[length:var(--text-micro)] leading-[var(--text-micro--line-height)] font-bold tracking-[0.14em] text-[var(--violet)] uppercase">
              {formateur.eyebrow}
            </span>
            <div className="flex items-center gap-4">
              {/* why: the only spot reserved for the formateur's future
                  portrait — swap this pastille for an Image the day a real
                  photo exists (D-63); no photo can be added this run. */}
              <span
                aria-hidden="true"
                className="flex size-16 shrink-0 items-center justify-center rounded-[18px] bg-[var(--violet)] text-[length:var(--text-card)] font-extrabold text-white"
              >
                {formateur.initiales}
              </span>
              <div>
                <p className="text-[length:var(--text-card)] leading-[var(--text-card--line-height)] font-bold text-[var(--ink)]">{formateur.nom}</p>
                <p className="text-[length:var(--text-small)] leading-[var(--text-small--line-height)] text-[var(--muted-ink)]">{formateur.intitule}</p>
              </div>
            </div>
            <ul className="flex flex-col gap-2">
              {formateur.points.map((point) => (
                <li
                  key={point}
                  className="flex items-start gap-2 text-[length:var(--text-small)] leading-[var(--text-small--line-height)] text-[var(--ink-soft)]"
                >
                  <Check aria-hidden="true" className="mt-[3px] size-4 shrink-0 text-[var(--mint-ink)]" />
                  {point}
                </li>
              ))}
            </ul>
            <Link
              href="/a-propos"
              className="mt-auto inline-flex w-fit min-h-11 items-center text-[length:var(--text-small)] leading-[var(--text-small--line-height)] font-semibold text-[var(--violet)] underline underline-offset-2"
            >
              {formateur.lienLabel}
            </Link>
          </Card>
        </Reveal>
      </div>
      <ConfianceFaits
        items={faitsResult.data.map((fait) => {
          const Icon = CONFIANCE_ICONS[fait.cle];
          return {
            id: fait.id,
            cle: fait.cle,
            titre: fait.titre,
            description: fait.description,
            preuveTexte: fait.preuveTexte,
            preuveLienHref: fait.preuveLienHref,
            preuveLienLabel: fait.preuveLienLabel,
            icon: Icon ? <Icon className="size-6" /> : null,
          };
        })}
        labels={{ voir: landing.confiance.preuve.voir, masquer: landing.confiance.preuve.masquer }}
      />
    </Section>
  );
}

export { Confiance };
