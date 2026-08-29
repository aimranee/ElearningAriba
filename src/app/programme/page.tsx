import { Target, BookOpen } from "lucide-react";

import programme from "@/locales/fr/programme.json";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatNumber } from "@/lib/i18n/fr";

/*
 * why: `src/components/sections/section.tsx` (Section / SectionHeader) is
 * plan 01-09's deliverable and had not landed in this worktree at execution
 * time — 01-10 depends only on 01-03/05/06/07, not 01-09, and this plan's own
 * hard prohibition forbids touching src/components/. The section rhythm is
 * reproduced inline with the same design tokens instead of importing a
 * component this plan does not own.
 */
export default function Programme() {
  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-10 px-4 py-12 sm:py-16 lg:py-20">
      <header className="reveal-rise flex flex-col gap-3">
        <h1 className="font-heading text-[length:var(--text-title)] leading-[var(--text-title--line-height)] font-semibold">
          {programme.titre}
        </h1>
        <p className="text-[length:var(--text-lead)] leading-[var(--text-lead--line-height)] text-muted-foreground">
          {programme.intro}
        </p>
      </header>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {programme.modules.map((module) => (
          <Card key={module.titre} className="reveal-rise">
            <CardHeader className="flex flex-row items-center justify-between gap-2">
              <CardTitle>{module.titre}</CardTitle>
              <Badge>{formatNumber(module.duree)}</Badge>
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
        ))}
      </div>

      <CardFooter className="reveal-rise justify-center px-0">
        {/* why: the PDF is Lot 2 (D-41) — the control reads the bundle label
            and never navigates */}
        <Button disabled>{programme.telechargerPdf}</Button>
      </CardFooter>
    </div>
  );
}
