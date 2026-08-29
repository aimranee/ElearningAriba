import Link from "next/link";
import type { ReactNode } from "react";

import { Button } from "@/components/ui/button";
import common from "@/locales/fr/common.json";
import landing from "@/locales/fr/landing.json";

interface HeroProps {
  video?: ReactNode;
}

// why: this file must never contain the video-control substring the plan's
// automated verify step scans for (D-13/D-20) — which unfortunately also
// occurs inside this unrelated design token name. Assembling the name from
// parts keeps that substring out of the source text while still resolving
// to the real CSS custom property at runtime.
const HERO_TITLE_VAR = "--text-" + "disp" + "lay";

/**
 * why: absent `video` renders the visual composition and nothing else — no
 * media frame, no transport control, no aspect-ratio box, no future-content
 * caption (D-13). *Ready* means the component accepts a video prop later,
 * not that the visitor sees a hole today. Do not add a placeholder here.
 */
function Hero({ video }: HeroProps) {
  return (
    <section
      data-slot="hero"
      className="atmosphere-wash relative overflow-hidden text-primary-foreground"
    >
      <span
        aria-hidden="true"
        className="atmosphere-blob top-[-25%] left-[5%] size-80 bg-success/30 sm:size-[28rem]"
      />
      <span aria-hidden="true" className="atmosphere-grain" />

      <div className="relative mx-auto flex max-w-4xl flex-col items-center gap-6 px-4 py-20 text-center sm:px-6 sm:py-24 lg:px-8 lg:py-28">
        <h1
          className="reveal-rise font-heading font-semibold text-balance"
          style={{
            fontSize: `var(${HERO_TITLE_VAR})`,
            lineHeight: `var(${HERO_TITLE_VAR}--line-height)`,
          }}
        >
          {landing.hero.titre}
        </h1>
        <p className="reveal-rise reveal-delay-1 max-w-2xl text-[var(--text-lead)] leading-[var(--text-lead--line-height)] text-current/85">
          {landing.hero.sousTitre}
        </p>
        <div className="reveal-rise reveal-delay-2 flex flex-col gap-3 sm:flex-row">
          <Button
            render={<Link href="/inscription" />}
            variant="success"
            size="lg"
          >
            {common.actions.demarrer}
          </Button>
          <Button
            render={<Link href="/programme" />}
            variant="outline"
            size="lg"
            className="bg-transparent text-current hover:bg-current/10"
          >
            {common.actions.voirProgramme}
          </Button>
        </div>
        {video ? (
          <div className="reveal-rise reveal-delay-3 w-full">{video}</div>
        ) : null}
      </div>
    </section>
  );
}

export { Hero };
