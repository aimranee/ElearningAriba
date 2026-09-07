import type { ComponentProps } from "react";

import { cn } from "@/lib/utils";

type SectionTone = "default" | "wash" | "night";

interface SectionProps extends ComponentProps<"section"> {
  tone?: SectionTone;
}

/**
 * The shared shell every landing block and internal page reuses. `default`
 * is fully transparent — the root atmosphere layer that used to read through
 * it was removed 2026-09-04 (D-97); `wash` renders a soft one-off vertical
 * gradient (`--wash-ground`) instead of the old flat `band` tint (D-96) —
 * `band` no longer exists as a tone. `night` (v3 landing, brief §B) is the
 * "mur de nuit" wall: `--night` fill, white text, a masked dot grid and two
 * radial glows carried on the section's own `::before`/`::after` (ported
 * verbatim from the maquette's `.section--night`) — the content wrap gets
 * `z-1` to sit above `::after`, matching `.section--night > .wrap`.
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
        tone === "night" &&
          "bg-[var(--night)] text-white " +
            "before:pointer-events-none before:absolute before:inset-0 before:content-[''] " +
            "before:[background-image:radial-gradient(circle,var(--grid-dot-night)_1px,transparent_1.6px)] " +
            "before:[background-size:26px_26px] " +
            "before:[mask-image:radial-gradient(ellipse_80%_70%_at_50%_40%,#000_30%,transparent_80%)] " +
            "before:[-webkit-mask-image:radial-gradient(ellipse_80%_70%_at_50%_40%,#000_30%,transparent_80%)] " +
            "after:pointer-events-none after:absolute after:inset-0 after:content-[''] " +
            "after:[background:radial-gradient(40%_45%_at_8%_0%,rgba(99,91,255,.38),transparent_70%),radial-gradient(35%_40%_at_100%_100%,rgba(15,126,166,.35),transparent_70%)]",
        className
      )}
      {...props}
    >
      <div
        className={cn(
          "relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8",
          tone === "night" && "z-[1]"
        )}
      >
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
/* why: tone is read from the ancestor <section>'s `data-tone` via Tailwind's
   `in-data-*` variant (same idiom as the density contract, D-24) rather than
   threaded as a prop — SectionHeader never needs to know which Section
   rendered it, and the night-tone rules (brief §B) apply automatically
   wherever a header lands inside `tone="night"`. */
function SectionHeader({ eyebrow, title, titleAccent, lead, className }: SectionHeaderProps) {
  return (
    <div className={cn("mx-auto max-w-3xl text-center", className)}>
      {eyebrow ? (
        <span
          data-slot="eyebrow"
          className="inline-flex items-center gap-2 text-[length:var(--text-micro)] leading-none font-bold tracking-[0.18em] text-[var(--deep)] uppercase in-data-[tone=night]:text-[var(--azur-soft)]"
        >
          <span
            aria-hidden="true"
            className="inline-block h-0.5 w-[22px] bg-[linear-gradient(90deg,var(--violet),var(--blue))] in-data-[tone=night]:bg-[linear-gradient(90deg,var(--violet-l),var(--azur-soft))]"
          />
          {eyebrow}
        </span>
      ) : null}
      <h2 className="mt-3 font-heading text-[length:var(--text-title)] leading-[var(--text-title--line-height)] font-semibold text-balance">
        {title}
        {titleAccent ? (
          <span className="bg-[linear-gradient(100deg,var(--indigo)_0%,var(--deep)_42%,var(--azur-ink)_100%)] bg-clip-text text-transparent in-data-[tone=night]:bg-[linear-gradient(100deg,var(--violet-l)_0%,var(--azur-soft)_100%)]">
            {" "}
            {titleAccent}
          </span>
        ) : null}
      </h2>
      {lead ? (
        <p className="mx-auto mt-4 max-w-[62ch] text-[length:var(--text-lead)] leading-[var(--text-lead--line-height)] text-[var(--muted-ink)] in-data-[tone=night]:text-white/72">
          {lead}
        </p>
      ) : null}
    </div>
  );
}

export { Section, SectionHeader };
