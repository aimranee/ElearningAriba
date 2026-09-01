import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Section, SectionHeader } from "@/components/sections/section";
import { Card, CardTitle, CardDescription } from "@/components/ui/card";
import { EmptyState, EmptyStateDescription } from "@/components/ui/empty-state";
import { Reveal } from "@/components/motion/reveal";
import { pictograms, type PictogramName } from "@/components/icons/pictograms";
import { getSection, getSectionItems, profilDonneesSchema } from "@/lib/content/queries";
import common from "@/locales/fr/common.json";

/**
 * PUB-02 — five intention cards read from `pour-qui`. Uniform-width 3+2 grid
 * at >=1000px (D-49), two equal columns below 1000px, one below 640px.
 * `tone="band"` tints the section (D-49) — Compétences flips to `default` to
 * preserve the alternation after the 2026-09-01 stats-band removal.
 */
const FALLBACK = { accent: "var(--violet)", ink: "var(--violet)" };

const PROFIL_ACCENTS: Record<string, { accent: string; ink: string }> = {
  acheteur: { accent: "var(--violet)", ink: "var(--violet)" },
  "category-manager": { accent: "var(--blue)", ink: "var(--blue-ink)" },
  "supply-chain": { accent: "var(--mint)", ink: "var(--mint-ink)" },
  consultant: { accent: "var(--indigo)", ink: "var(--indigo)" },
  etudiant: { accent: "var(--amber)", ink: "var(--amber-ink)" },
};

async function PourQui() {
  const [sectionResult, itemsResult] = await Promise.all([
    getSection("pour-qui"),
    getSectionItems("pour-qui"),
  ]);

  if (!sectionResult.ok || !itemsResult.ok) {
    return (
      <Section tone="band">
        <EmptyState tone="error">
          <EmptyStateDescription>{common.etats.erreurGenerique}</EmptyStateDescription>
        </EmptyState>
      </Section>
    );
  }

  const section = sectionResult.data;
  const profils = itemsResult.data;

  return (
    <Section tone="band">
      <SectionHeader
        eyebrow={section.eyebrow ?? undefined}
        title={section.titre}
        titleAccent={section.titre_accent ?? undefined}
        lead={section.lead ?? undefined}
      />
      <ul className="mt-10 grid grid-cols-1 gap-[1.35rem] sm:grid-cols-2 min-[1000px]:grid-cols-6 grid-auto-rows-[1fr]">
        {profils.map((profil, index) => {
          const Picto = profil.picto ? pictograms[profil.picto as PictogramName] : null;
          const accentInk = PROFIL_ACCENTS[profil.cle] ?? FALLBACK;
          const titre = profil.titre ?? "";
          const parsed = profilDonneesSchema.safeParse(profil.donnees);
          const hasAccroche = parsed.success && Boolean(parsed.data.accroche);
          const accroche = hasAccroche ? parsed.data.accroche! : titre;

          return (
            <Reveal
              key={profil.id}
              as="li"
              dataD={((index % 5) + 1) as 1 | 2 | 3 | 4 | 5}
              className={
                index === 3
                  ? "min-[1000px]:col-span-2 min-[1000px]:col-start-2"
                  : "min-[1000px]:col-span-2"
              }
            >
              <Link
                href="/programme"
                className="group block h-full"
                aria-label={hasAccroche ? `${accroche} — ${titre}` : titre}
              >
                <Card
                  variant="default"
                  className="h-full p-[1.7rem] group-hover:bg-[linear-gradient(160deg,color-mix(in_srgb,var(--card-accent)_10%,white)_0%,white_62%)] group-focus-within:bg-[linear-gradient(160deg,color-mix(in_srgb,var(--card-accent)_10%,white)_0%,white_62%)]"
                  style={
                    {
                      "--card-accent": accentInk.accent,
                      "--card-ink": accentInk.ink,
                    } as React.CSSProperties
                  }
                >
                  {Picto ? (
                    <span
                      aria-hidden="true"
                      className="flex size-[52px] shrink-0 items-center justify-center rounded-[16px] bg-[color-mix(in_srgb,var(--card-accent)_14%,white)] text-[var(--card-ink)] transition-transform duration-[500ms] ease-[var(--ease-brand)] group-hover:scale-[1.08] group-hover:-rotate-[4deg] group-focus-within:scale-[1.08] group-focus-within:-rotate-[4deg]"
                    >
                      <Picto className="size-6" />
                    </span>
                  ) : null}
                  <CardTitle className="mt-3 font-heading text-[1.05rem] leading-[1.3] font-bold tracking-[-0.02em] text-[var(--ink)]">
                    {accroche}
                  </CardTitle>
                  <div className="grid grid-rows-[0fr] transition-[grid-template-rows] duration-[var(--duration-base)] ease-[var(--ease-brand)] group-hover:grid-rows-[1fr] group-focus-within:grid-rows-[1fr] [@media(hover:none)]:grid-rows-[1fr]">
                    <div className="overflow-hidden">
                      <CardDescription className="text-[0.94rem] leading-[1.6] text-[var(--muted-ink)]">
                        {profil.description}
                      </CardDescription>
                    </div>
                  </div>
                  {hasAccroche ? (
                    <div className="mt-1 flex items-center justify-between">
                      <span className="font-semibold text-[0.9rem] text-[var(--card-ink)]">
                        {titre}
                      </span>
                      <ArrowRight
                        aria-hidden="true"
                        className="size-4 text-[var(--card-ink)] transition-transform duration-[var(--duration-base)] ease-[var(--ease-brand)] group-hover:translate-x-[3px] group-focus-within:translate-x-[3px]"
                      />
                    </div>
                  ) : null}
                  <div
                    aria-hidden="true"
                    className="grid grid-rows-[1fr] transition-[grid-template-rows] duration-[var(--duration-base)] ease-[var(--ease-brand)] group-hover:grid-rows-[0fr] group-focus-within:grid-rows-[0fr] [@media(hover:none)]:grid-rows-[0fr]"
                  >
                    <div className="overflow-hidden invisible">
                      <CardDescription className="text-[0.94rem] leading-[1.6]">
                        {profil.description}
                      </CardDescription>
                    </div>
                  </div>
                </Card>
              </Link>
            </Reveal>
          );
        })}
      </ul>
    </Section>
  );
}

export { PourQui };
