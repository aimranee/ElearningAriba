import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Section, SectionHeader } from "@/components/sections/section";
import { CardTitle, CardDescription } from "@/components/ui/card";
import { EmptyState, EmptyStateDescription } from "@/components/ui/empty-state";
import { Reveal } from "@/components/motion/reveal";
import { CardSpotlight } from "@/components/motion/card-spotlight";
import { pictograms, type PictogramName } from "@/components/icons/pictograms";
import { getSection, getSectionItems, profilDonneesSchema } from "@/lib/content/queries";
import common from "@/locales/fr/common.json";

/**
 * PUB-02 — five intention cards read from `pour-qui`. Uniform-width 3+2 grid
 * at lg (64rem) (D-49), two equal columns below lg, one below 640px.
 * `tone="default"` since D-96 — the section stays white, saturated colour now
 * concentrates in each card's gradient icon tile instead of the surface.
 * Cards are compact at rest and expand on hover/focus (D-49, 2026-09-01) —
 * the row grows with the hovered card and content below shifts down; this is
 * intentional.
 */
const FALLBACK = { tileA: "var(--violet)", tileB: "var(--indigo)", ink: "var(--violet-ink)" };

const PROFIL_ACCENTS: Record<string, { tileA: string; tileB: string; ink: string }> = {
  acheteur: { tileA: "var(--violet)", tileB: "var(--indigo)", ink: "var(--violet-ink)" },
  "category-manager": { tileA: "var(--sky-ink)", tileB: "var(--azur-ink)", ink: "var(--azur-ink)" },
  "supply-chain": { tileA: "var(--mint-ink)", tileB: "var(--azur-ink)", ink: "var(--mint-ink)" },
  consultant: { tileA: "var(--magenta-ink)", tileB: "var(--violet-ink)", ink: "var(--magenta-ink)" },
  etudiant: { tileA: "var(--amber-ink)", tileB: "var(--coral-ink)", ink: "var(--amber-ink)" },
};

async function PourQui() {
  const [sectionResult, itemsResult] = await Promise.all([
    getSection("pour-qui"),
    getSectionItems("pour-qui"),
  ]);

  if (!sectionResult.ok || !itemsResult.ok) {
    return (
      <Section tone="default">
        <EmptyState tone="error">
          <EmptyStateDescription>{common.etats.erreurGenerique}</EmptyStateDescription>
        </EmptyState>
      </Section>
    );
  }

  const section = sectionResult.data;
  const profils = itemsResult.data;

  return (
    <Section tone="default">
      <SectionHeader
        eyebrow={section.eyebrow ?? undefined}
        title={section.titre}
        titleAccent={section.titre_accent ?? undefined}
        lead={section.lead ?? undefined}
      />
      <ul className="mt-10 grid grid-cols-1 gap-[1.35rem] sm:grid-cols-2 lg:grid-cols-6">
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
                  ? "lg:col-span-2 lg:col-start-2"
                  : "lg:col-span-2"
              }
            >
              <Link
                href="/programme"
                className="group block h-full"
                aria-label={hasAccroche ? `${accroche} — ${titre}` : titre}
              >
                <div
                  data-slot="card"
                  className="relative h-full rounded-[22px] border border-[var(--hairline)] bg-white p-[1.7rem] shadow-[0_1px_2px_var(--carte-ombre-1),0_24px_50px_-28px_var(--carte-ombre-2)] transition-[transform,box-shadow] duration-[var(--duration-reveal)] ease-[var(--ease-brand)] hover:-translate-y-[7px] hover:shadow-[0_1px_2px_var(--carte-ombre-1),0_24px_50px_-28px_color-mix(in_srgb,var(--tuile-b)_55%,transparent)]"
                  style={
                    {
                      "--tuile-a": accentInk.tileA,
                      "--tuile-b": accentInk.tileB,
                      "--card-ink": accentInk.ink,
                      "--carte-ombre-1": "color-mix(in srgb, var(--tuile-b) 8%, transparent)",
                      "--carte-ombre-2": "color-mix(in srgb, var(--tuile-b) 42%, transparent)",
                    } as React.CSSProperties
                  }
                >
                  <CardSpotlight />
                  {Picto ? (
                    <span
                      aria-hidden="true"
                      className="flex size-[52px] shrink-0 items-center justify-center rounded-[16px] bg-[linear-gradient(140deg,var(--tuile-a)_0%,var(--tuile-b)_100%)] text-white transition-transform duration-[500ms] ease-[var(--ease-brand)] group-hover:scale-[1.08] group-hover:-rotate-[4deg] group-focus-within:scale-[1.08] group-focus-within:-rotate-[4deg]"
                    >
                      <Picto className="size-6" />
                    </span>
                  ) : null}
                  <CardTitle className="mt-3 font-heading text-[length:var(--text-card)] leading-[var(--text-card--line-height)] font-bold tracking-[-0.02em] text-[var(--ink)]">
                    {accroche}
                  </CardTitle>
                  <div className="grid grid-rows-[0fr] transition-[grid-template-rows] duration-[var(--duration-reveal)] ease-[var(--ease-brand)] group-hover:grid-rows-[1fr] group-focus-within:grid-rows-[1fr] [@media(hover:none)]:grid-rows-[1fr]">
                    <div className="overflow-hidden">
                      <CardDescription className="text-[length:var(--text-small)] leading-[var(--text-small--line-height)] text-[var(--muted-ink)]">
                        {profil.description}
                      </CardDescription>
                    </div>
                  </div>
                  {hasAccroche ? (
                    <div className="mt-1 flex items-center justify-between">
                      <span className="font-semibold text-[length:var(--text-small)] leading-[var(--text-small--line-height)] text-[var(--card-ink)]">
                        {titre}
                      </span>
                      <ArrowRight
                        aria-hidden="true"
                        className="size-4 text-[var(--card-ink)] transition-transform duration-[var(--duration-reveal)] ease-[var(--ease-brand)] group-hover:translate-x-[3px] group-focus-within:translate-x-[3px]"
                      />
                    </div>
                  ) : null}
                </div>
              </Link>
            </Reveal>
          );
        })}
      </ul>
    </Section>
  );
}

export { PourQui };
