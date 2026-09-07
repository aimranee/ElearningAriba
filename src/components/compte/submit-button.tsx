"use client";

import { type ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { useHydrated } from "@/lib/hooks/use-hydrated";
import { cn } from "@/lib/utils";
import common from "@/locales/fr/common.json";

/* why (deliberate deviation from 03-UI-SPEC.md, flagged for founder review
   at recette): the spec describes this as a useFormStatus wrapper, but
   useFormStatus only reports pending state for a server-action-driven form
   and this repo has zero server actions — every mutation is a fetch to a
   route handler (contact-form.tsx -> api/contact/route.ts), the path
   03-PATTERNS.md recommends staying on. A useFormStatus wrapper here would
   report pending: false forever against a fetch-driven form — a silent
   broken state, not a working one. The explicit `pending` prop delivers the
   same rendered contract (data-loading + disabled) through the mechanism
   this codebase actually uses. */
type SubmitButtonProps = {
  pending: boolean;
  children: ReactNode;
  className?: string;
};

export function SubmitButton({
  pending,
  children,
  className,
}: SubmitButtonProps) {
  /*
   * why (FUITE-02): server-rendered HTML has no onSubmit handler attached
   * yet, so a submission on a slow connection posts straight to the page
   * route and comes back empty. Rendering disabled until hydration
   * completes — the gate reports false during server render and hydration
   * and true afterwards — makes that submission impossible rather than
   * silent; `pending` still governs disabling once hydrated, so the click
   * behaviour above is unchanged.
   */
  const hydrated = useHydrated();

  return (
    <div className="flex flex-col gap-2">
      <Button
        type="submit"
        data-loading={pending ? "true" : undefined}
        disabled={!hydrated || pending}
        className={cn("h-11", className)}
      >
        {children}
      </Button>
      {!hydrated ? (
        <p className="text-muted-foreground text-xs">
          {common.etats.preparationFormulaire}
        </p>
      ) : null}
    </div>
  );
}
