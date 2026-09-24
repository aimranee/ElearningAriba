import { Star } from "lucide-react";

import { Section, SectionHeader } from "@/components/sections/section";
import { Card } from "@/components/ui/card";
import { Reveal } from "@/components/motion/reveal";
import { formatMoisAnnee } from "@/lib/i18n/fr";
import formation from "@/locales/fr/formation.json";

/**
 * « Ils ont suivi la formation » (#27 § 6) — placeholder testimonial cards
 * in the reference's anatomy: five stars, quote, initial avatar composed in
 * code, first name and initial, role, month and year. The entries are
 * fictional (founder decision 2026-09-24) and registered in
 * _mocks.public.json under C-27 until the client's real testimonials
 * replace them. No photo, no asset, no database row.
 */
function Temoignages() {
  const entries = formation.temoignages;
  if (entries.length === 0) {
    return null;
  }

  return (
    <Section tone="default" data-section="temoignages">
      <SectionHeader title={formation.temoignagesTitre} />
      <ul className="mx-auto mt-10 grid max-w-5xl gap-5 md:grid-cols-3">
        {entries.map((temoignage, index) => {
          const note = Math.max(0, Math.min(5, Math.round(temoignage.note)));
          const date = new Date(temoignage.date);
          return (
            <Reveal
              key={`${temoignage.prenom}-${temoignage.date}`}
              as="li"
              dataD={((index % 5) + 1) as 1 | 2 | 3 | 4 | 5}
            >
              <Card variant="tint" className="h-full gap-4 px-6 py-6">
                <span
                  role="img"
                  aria-label={formation.noteSur.replace("{note}", String(note))}
                  className="flex items-center gap-1"
                >
                  {Array.from({ length: 5 }, (_, i) => (
                    <Star
                      key={i}
                      aria-hidden="true"
                      className={
                        i < note
                          ? "size-4 fill-[var(--amber)] text-[var(--amber)]"
                          : "size-4 text-[var(--border)]"
                      }
                    />
                  ))}
                </span>
                <blockquote className="text-[length:var(--text-body)] leading-[var(--text-body--line-height)] text-[var(--ink-soft)]">
                  « {temoignage.citation} »
                </blockquote>
                <div className="mt-auto flex items-center gap-3">
                  <span
                    aria-hidden="true"
                    className="flex size-10 shrink-0 items-center justify-center rounded-full font-heading text-base font-bold text-white"
                    style={{ background: "linear-gradient(135deg, var(--violet), var(--indigo))" }}
                  >
                    {temoignage.prenom.charAt(0)}
                  </span>
                  <div className="min-w-0">
                    <p className="text-[length:var(--text-small)] leading-[var(--text-small--line-height)] font-semibold text-[var(--ink)]">
                      {temoignage.prenom} {temoignage.initiale}.
                    </p>
                    <p className="text-[length:var(--text-small)] leading-[var(--text-small--line-height)] text-[var(--muted-ink)]">
                      {temoignage.role} ·{" "}
                      <time dateTime={temoignage.date.slice(0, 7)}>{formatMoisAnnee(date)}</time>
                    </p>
                  </div>
                </div>
              </Card>
            </Reveal>
          );
        })}
      </ul>
    </Section>
  );
}

export { Temoignages };
