import { Section } from "@/components/sections/section";
import { CountUp } from "@/components/motion/count-up";
import { EmptyState, EmptyStateDescription } from "@/components/ui/empty-state";
import { getModules, getSectionItems } from "@/lib/content/queries";
import { formatHours, formatNumber } from "@/lib/i18n/fr";
import common from "@/locales/fr/common.json";

/**
 * The 26academy-style figures band (D-03, D-30): module count, total hours
 * and competence count are all computed from real rows, never a literal —
 * the total hours figure is `sum(dureeHeures)` over getModules(), which sums
 * the seeded module durations at read time (PUB-13 is provable by deleting
 * a module row and rebuilding).
 */
async function StatsBand() {
  const [modulesResult, competencesResult] = await Promise.all([
    getModules(),
    getSectionItems("competences"),
  ]);

  if (!modulesResult.ok || !competencesResult.ok) {
    return (
      <Section tone="band">
        <EmptyState tone="error">
          <EmptyStateDescription>{common.etats.erreurGenerique}</EmptyStateDescription>
        </EmptyState>
      </Section>
    );
  }

  const moduleCount = modulesResult.data.length;
  const totalHours = modulesResult.data.reduce((sum, module) => sum + module.dureeHeures, 0);
  const competenceCount = competencesResult.data.length;

  const figures = [
    { target: moduleCount, display: formatNumber(moduleCount), label: common.statsBand.modules },
    { target: totalHours, display: formatHours(totalHours), label: common.statsBand.heures },
    {
      target: competenceCount,
      display: formatNumber(competenceCount),
      label: common.statsBand.competences,
    },
    { target: 0, display: formatNumber(0), label: common.statsBand.prerequis },
  ];

  return (
    <Section tone="band" className="py-[3.5rem]">
      <ul className="reveal grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-4 sm:gap-6">
        {figures.map((figure) => (
          <li key={figure.label} className="flex flex-col items-center gap-[0.3rem] text-center">
            <span className="font-heading text-[clamp(2.1rem,4vw,3rem)] font-extrabold tracking-[-0.03em] tabular-nums bg-[linear-gradient(100deg,var(--violet)_0%,var(--deep)_42%,var(--blue)_100%)] bg-clip-text text-transparent">
              <CountUp target={figure.target} display={figure.display} />
            </span>
            <span className="text-[0.85rem] font-medium text-[var(--muted-ink)]">
              {figure.label}
            </span>
          </li>
        ))}
      </ul>
    </Section>
  );
}

export { StatsBand };
