import { Compass, GraduationCap, ShieldCheck } from "lucide-react";

import aPropos from "@/locales/fr/a-propos.json";
import { pictograms } from "@/components/icons/pictograms";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";

const Consultant = pictograms["consultant"];

/*
 * why: see src/app/programme/page.tsx — Section/SectionHeader (plan 01-09)
 * had not landed in this worktree; the rhythm is reproduced inline instead of
 * importing a component this plan does not own.
 */
export default function APropos() {
  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-10 px-4 py-12 sm:py-16 lg:py-20">
      <header className="reveal-rise flex flex-col items-start gap-6 sm:flex-row sm:items-center">
        {/* why: no photograph — the client's image library has not arrived
            and photography is an enhancement, not a blocker (D-06). The
            atmosphere layer plus a pictogram stand in, never a grey box or
            an "image coming later" caption. */}
        <div
          aria-hidden="true"
          className="atmosphere-wash relative flex size-20 shrink-0 items-center justify-center overflow-hidden rounded-2xl text-primary-foreground shadow-[var(--shadow-2)]"
        >
          <span className="atmosphere-blob -right-4 -top-4 size-16 bg-success/60" />
          <Consultant className="relative size-10" />
        </div>
        <div className="flex flex-col gap-3">
          <h1 className="font-heading text-[length:var(--text-title)] leading-[var(--text-title--line-height)] font-semibold">
            {aPropos.titre}
          </h1>
          <p className="text-[length:var(--text-lead)] leading-[var(--text-lead--line-height)] text-muted-foreground">
            {aPropos.intro}
          </p>
        </div>
      </header>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="reveal-rise">
          <CardHeader className="flex flex-col gap-2">
            <Compass aria-hidden="true" className="size-6 text-primary" />
            <CardTitle>{aPropos.parcours}</CardTitle>
          </CardHeader>
        </Card>
        <Card className="reveal-rise">
          <CardHeader className="flex flex-col gap-2">
            <ShieldCheck aria-hidden="true" className="size-6 text-primary" />
            <CardTitle>{aPropos.legitimite}</CardTitle>
          </CardHeader>
        </Card>
        <Card className="reveal-rise">
          <CardHeader className="flex flex-col gap-2">
            <GraduationCap aria-hidden="true" className="size-6 text-primary" />
            <CardTitle>{aPropos.approche}</CardTitle>
          </CardHeader>
        </Card>
      </div>
    </div>
  );
}
