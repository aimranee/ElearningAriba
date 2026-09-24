import { ChevronDown, Target } from "lucide-react";

import { Card } from "@/components/ui/card";
import { formatHours } from "@/lib/i18n/fr";
import formation from "@/locales/fr/formation.json";

export type ModuleProgramme = {
  id: string;
  titre: string;
  dureeHeures: number;
  objectifs: string[];
  contenu: string[];
  objectifPedagogique?: string;
  casPratique?: string;
};

type CarteModuleProps = {
  module: ModuleProgramme;
  index: number;
};

/**
 * One programme module as a course card (#27): a tinted header band with
 * the module number and its duration, the title, the one-sentence objectif
 * pédagogique, the content bullets, the § 3.1 objectives folded behind a
 * native disclosure, and the cas pratique set apart at the foot.
 *
 * why: the band is a flat two-stop gradient between --deep and --indigo,
 * never reaching --violet — white 12px ink measures 6.3:1 on --deep and
 * 7.9:1 on --indigo, where --violet would leave it at 4.7:1 with no margin
 * for anti-aliasing. The duration pill is solid white with --deep ink for
 * the same reason: a translucent white pill over the band drops its own
 * ink under 3.5:1.
 */
function CarteModule({ module, index }: CarteModuleProps) {
  const numero = String(index + 1).padStart(2, "0");

  return (
    <Card variant="raised" className="h-full gap-0 overflow-hidden py-0">
      <div
        data-slot="module-bande"
        className="flex items-center justify-between gap-3 px-5 py-3 text-white"
        style={{ background: "linear-gradient(135deg, var(--deep), var(--indigo))" }}
      >
        <span className="text-[length:var(--text-micro)] leading-none font-bold tracking-[0.16em] uppercase">
          {formation.programme.module.replace("{n}", numero)}
        </span>
        <span className="rounded-full bg-white px-[0.7rem] py-[0.32rem] text-[length:var(--text-micro)] leading-none font-semibold text-[var(--deep)] tabular-nums">
          {formatHours(module.dureeHeures)}
        </span>
      </div>

      <div className="flex flex-1 flex-col gap-4 px-5 pt-5 pb-5">
        <h3 className="font-heading text-[length:var(--text-card)] leading-[var(--text-card--line-height)] font-bold tracking-[-0.015em] text-[var(--ink)]">
          {module.titre}
        </h3>

        {module.objectifPedagogique ? (
          <p className="text-[length:var(--text-body)] leading-[var(--text-body--line-height)] text-[var(--ink-soft)]">
            {module.objectifPedagogique}
          </p>
        ) : null}

        {module.contenu.length > 0 ? (
          <ul className="flex flex-col gap-[0.4rem]">
            {module.contenu.map((ligne) => (
              <li
                key={ligne}
                className="flex items-start gap-[0.6rem] text-[length:var(--text-small)] leading-[var(--text-small--line-height)] text-[var(--muted-ink)]"
              >
                <span
                  aria-hidden="true"
                  className="mt-[0.55rem] size-1 shrink-0 rounded-full bg-[var(--violet)] opacity-60"
                />
                {ligne}
              </li>
            ))}
          </ul>
        ) : null}

        {module.objectifs.length > 0 ? (
          <details className="group/objectifs">
            {/* why: a native <details> is the smallest disclosure that stays
                keyboard-operable without a client island — the § 3.1
                objectives are optional on the card (ticket § 3). */}
            <summary className="inline-flex cursor-pointer list-none items-center gap-1.5 rounded-md text-[length:var(--text-small)] leading-[var(--text-small--line-height)] font-semibold text-[var(--deep)] outline-none select-none focus-visible:ring-3 focus-visible:ring-ring/50 [&::-webkit-details-marker]:hidden">
              {formation.programme.objectifsDetail}
              <ChevronDown
                aria-hidden="true"
                className="size-4 transition-transform duration-[var(--duration-base)] ease-[var(--ease-brand)] group-open/objectifs:rotate-180"
              />
            </summary>
            <ul className="mt-2 flex flex-col gap-[0.4rem]">
              {module.objectifs.map((objectif) => (
                <li
                  key={objectif}
                  className="flex items-start gap-2 text-[length:var(--text-small)] leading-[var(--text-small--line-height)] text-[var(--ink-soft)]"
                >
                  <Target aria-hidden="true" className="mt-[0.2rem] size-4 shrink-0 text-[var(--deep)]" />
                  {objectif}
                </li>
              ))}
            </ul>
          </details>
        ) : null}

        {module.casPratique ? (
          <div className="mt-auto rounded-[14px] bg-[var(--lav)] px-4 py-3">
            <p className="text-[length:var(--text-micro)] leading-[var(--text-micro--line-height)] font-bold tracking-[0.14em] text-[var(--deep)] uppercase">
              {formation.programme.casPratique}
            </p>
            <p className="mt-1 text-[length:var(--text-small)] leading-[var(--text-small--line-height)] text-[var(--ink)]">
              {module.casPratique}
            </p>
          </div>
        ) : null}
      </div>
    </Card>
  );
}

export { CarteModule };
