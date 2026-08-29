import { CheckCircle2, Clock } from "lucide-react";

import formation from "@/locales/fr/formation.json";
import common from "@/locales/fr/common.json";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

/*
 * why: see src/app/programme/page.tsx — Section/SectionHeader (plan 01-09)
 * had not landed in this worktree; the rhythm is reproduced inline instead of
 * importing a component this plan does not own.
 */
export default function Formation() {
  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-10 px-4 py-12 sm:py-16 lg:py-20">
      <header className="reveal-rise flex flex-col gap-3">
        <h1 className="font-heading text-[length:var(--text-title)] leading-[var(--text-title--line-height)] font-semibold">
          {formation.titre}
        </h1>
        <p className="text-[length:var(--text-lead)] leading-[var(--text-lead--line-height)] text-muted-foreground">
          {formation.intro}
        </p>
      </header>

      <section className="reveal-rise flex flex-col gap-3">
        <ol className="flex flex-col gap-2">
          {formation.deroule.map((etape, index) => (
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
      </section>

      {/* why: no SectionHeader (plan 01-09) exists yet — a visually-hidden h2
          keeps the outline h1 -> h2 -> h3 (card titles) intact without
          inventing a French string; the nav label already names this page */}
      <h2 className="sr-only">{common.nav.formation}</h2>

      <Card variant="outline" className="reveal-rise">
        <CardHeader>
          <CardTitle>{formation.prerequis}</CardTitle>
          <CardDescription>{formation.dureeAcces}</CardDescription>
        </CardHeader>
        <ul className="flex flex-col gap-1.5 px-4 text-sm text-foreground/80">
          {formation.fourni.map((item) => (
            <li key={item} className="flex items-start gap-2">
              <CheckCircle2
                aria-hidden="true"
                className="mt-0.5 size-4 shrink-0 text-success"
              />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </Card>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {formation.modalites.map((modalite) => (
          <Card
            key={modalite.titre}
            variant={modalite.statut === "futur" ? "muted" : "default"}
            className="reveal-rise"
          >
            <CardHeader className="flex flex-row items-center justify-between gap-2">
              <CardTitle>{modalite.titre}</CardTitle>
              {modalite.statut === "futur" ? (
                <Badge variant="muted" aria-label={modalite.titre}>
                  <Clock aria-hidden="true" className="size-3" />
                </Badge>
              ) : null}
            </CardHeader>
            <CardDescription className="px-4">
              {modalite.description}
            </CardDescription>
          </Card>
        ))}
      </div>
    </div>
  );
}
