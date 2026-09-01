"use client";

import type { ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

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
  return (
    <Button
      type="submit"
      data-loading={pending ? "true" : undefined}
      disabled={pending}
      className={cn("h-11", className)}
    >
      {children}
    </Button>
  );
}
