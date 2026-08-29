import type { ComponentProps } from "react";

import { cn } from "@/lib/utils";

type SectionTone = "default" | "muted" | "atmosphere";

interface SectionProps extends ComponentProps<"section"> {
  tone?: SectionTone;
}

/**
 * The shared shell every landing block and internal page reuses. `tone`
 * composes the atmosphere layer (D-21) for the one section per screen that
 * needs it; every other tone stays a plain surface.
 */
function Section({ className, tone = "default", children, ...props }: SectionProps) {
  return (
    <section
      data-slot="section"
      data-tone={tone}
      className={cn(
        "relative py-16 sm:py-20 lg:py-24",
        tone === "muted" && "bg-muted",
        tone === "atmosphere" &&
          "atmosphere-wash overflow-hidden text-primary-foreground",
        className
      )}
      {...props}
    >
      {tone === "atmosphere" && (
        <>
          <span
            aria-hidden="true"
            className="atmosphere-blob top-[-20%] right-[-10%] size-72 bg-success/30 sm:size-96"
          />
          <span aria-hidden="true" className="atmosphere-grain" />
        </>
      )}
      <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        {children}
      </div>
    </section>
  );
}

interface SectionHeaderProps {
  title: string;
  lead?: string;
  className?: string;
}

/**
 * The title stays in one element so the browser wraps the two-sentence
 * copy device naturally (D-25) — splitting on "." in JavaScript would break
 * on any abbreviation the copy layer later introduces.
 */
function SectionHeader({ title, lead, className }: SectionHeaderProps) {
  return (
    <div className={cn("mx-auto max-w-3xl text-center", className)}>
      <h2 className="font-heading text-[var(--text-title)] leading-[var(--text-title--line-height)] font-semibold text-balance">
        {title}
      </h2>
      {lead ? (
        <p className="mt-4 text-[var(--text-lead)] leading-[var(--text-lead--line-height)] text-current/80">
          {lead}
        </p>
      ) : null}
    </div>
  );
}

export { Section, SectionHeader };
