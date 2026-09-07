import type { ComponentProps } from "react";

import { cn } from "@/lib/utils";

type SectionTone = "default" | "wash";

interface SectionProps extends ComponentProps<"section"> {
  tone?: SectionTone;
}

/**
 * The shared shell every landing block and internal page reuses. `default`
 * is fully transparent — the root atmosphere layer that used to read through
 * it was removed 2026-09-04 (D-97); `wash` renders a soft one-off vertical
 * gradient (`--wash-ground`) instead of the old flat `band` tint (D-96) —
 * `band` no longer exists as a tone.
 */
function Section({ className, tone = "default", children, ...props }: SectionProps) {
  return (
    <section
      data-slot="section"
      data-tone={tone}
      className={cn(
        "relative py-[clamp(4.5rem,9vw,7.5rem)]",
        tone === "wash" &&
          "bg-[linear-gradient(180deg,transparent_0%,var(--wash-ground)_50%,transparent_100%)]",
        className
      )}
      {...props}
    >
      <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        {children}
      </div>
    </section>
  );
}

interface SectionHeaderProps {
  eyebrow?: string;
  title: string;
  titleAccent?: string;
  lead?: string;
  className?: string;
}

/**
 * Every section opens eyebrow -> two-sentence H2 -> lead (D-22): a claim, a
 * full stop, then a turn. The title stays in one element so the browser
 * wraps the two-sentence copy device naturally — splitting on "." in
 * JavaScript would break on any abbreviation the copy layer later
 * introduces. `titleAccent` renders inside the same <h2> as a trailing span
 * carrying the maquette's gradient-text treatment — the second half carries
 * the emotional payload.
 */
function SectionHeader({ eyebrow, title, titleAccent, lead, className }: SectionHeaderProps) {
  return (
    <div className={cn("mx-auto max-w-3xl text-center", className)}>
      {eyebrow ? (
        <span className="inline-flex items-center gap-2 text-[length:var(--text-micro)] leading-none font-bold tracking-[0.18em] text-[var(--deep)] uppercase">
          <span aria-hidden="true" className="inline-block h-0.5 w-[22px] bg-[linear-gradient(90deg,var(--violet),var(--blue))]" />
          {eyebrow}
        </span>
      ) : null}
      <h2 className="mt-3 font-heading text-[length:var(--text-title)] leading-[var(--text-title--line-height)] font-semibold text-balance">
        {title}
        {titleAccent ? (
          <span className="bg-[linear-gradient(100deg,var(--indigo)_0%,var(--deep)_42%,var(--azur-ink)_100%)] bg-clip-text text-transparent">
            {" "}
            {titleAccent}
          </span>
        ) : null}
      </h2>
      {lead ? (
        <p className="mx-auto mt-4 max-w-[62ch] text-[length:var(--text-lead)] leading-[var(--text-lead--line-height)] text-[var(--muted-ink)]">
          {lead}
        </p>
      ) : null}
    </div>
  );
}

export { Section, SectionHeader };
