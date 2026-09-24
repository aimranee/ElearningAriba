import { CircleCheck, FileText, Package, Receipt } from "lucide-react";

import { getMessages } from "@/lib/i18n/messages";
import type { Locale } from "@/lib/i18n/locale";

/* why: the serpentine path is drawn twice — once as a plain hairline rail,
   once as the animated gradient dash — and reused a third time by the
   comet's `offset-path`. One literal string, three consumers, so the three
   never drift apart (brief §C-01, maquette `.flux`). */
const FLUX_PATH =
  "M70 80 H350 a20 20 0 0 1 20 20 V130 a20 20 0 0 1 -20 20 H90 a20 20 0 0 0 -20 20 V200 a20 20 0 0 0 20 20 H370";

/* why: the four node icons/gradients are chrome (schema decoration), paired
   1:1 by index with `landing.hero.flux.etapes` (brief §E) — never a second
   source of truth for the labels themselves. Positions are the maquette's
   exact percentages (`.n1`…`.n4`). */
const FLUX_NODES = [
  { icon: FileText, gradient: "linear-gradient(140deg,var(--violet),var(--indigo))", left: "15.9%", top: "26.7%" },
  { icon: CircleCheck, gradient: "linear-gradient(140deg,var(--sky-ink),var(--azur-ink))", left: "84.1%", top: "26.7%" },
  { icon: Package, gradient: "linear-gradient(140deg,var(--mint-ink),var(--azur-ink))", left: "15.9%", top: "73.3%" },
  { icon: Receipt, gradient: "linear-gradient(140deg,var(--deep),var(--violet-ink))", left: "84.1%", top: "73.3%" },
] as const;

/**
 * The hero's "flux d'achat" panel (brief §C-01, maquette `.board`): a
 * serpentine SVG path with an animated dashed overlay and a comet riding
 * `offset-path`, four labelled nodes, and two floating status chips. Pure
 * server-rendered SVG/CSS — `aria-hidden`, no image file, no new fact (the
 * chips reuse existing copy; only the four node labels are new schema
 * strings, registered in `landing.json` per brief §E). This panel is the
 * page's sole `--shadow-4` surface (D-68).
 */
function FluxAchat({ locale }: { locale: Locale }) {
  const common = getMessages(locale, "common");
  const landing = getMessages(locale, "landing");
  const etapes = landing.hero.flux.etapes;
  const assemblage = common.assemblage;
  const apercu = landing.formatModalites.apercu;
  const sessionLivePill = assemblage.pills[1];

  return (
    <div data-slot="flux-achat" aria-hidden="true" className="relative px-2 pt-5 pb-16">
      <div
        data-slot="board"
        className="relative overflow-visible rounded-[28px] bg-white p-[1.35rem_1.35rem_1.1rem] shadow-[var(--shadow-4),var(--inset-hi)]"
      >
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 rounded-[28px]"
          style={{
            padding: 1,
            background:
              "linear-gradient(160deg,rgba(99,91,255,.35),rgba(15,126,166,.15) 50%,rgba(31,199,155,.25))",
            WebkitMask: "linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)",
            WebkitMaskComposite: "xor",
            maskComposite: "exclude",
          }}
        />

        <span className="relative inline-flex items-center gap-[0.4rem] rounded-full bg-[var(--lav)] px-[0.7rem] py-[0.35rem] text-[length:var(--text-micro)] font-extrabold tracking-[0.1em] text-[var(--deep)] uppercase">
          {assemblage.badge}
        </span>

        <div className="relative mt-[0.9rem] aspect-[440/300]">
          <svg
            className="absolute inset-0 size-full overflow-visible"
            viewBox="0 0 440 300"
            fill="none"
          >
            <defs>
              <linearGradient id="flux-achat-gradient" x1="0" y1="0" x2="440" y2="300" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="var(--violet)" />
                <stop offset="50%" stopColor="var(--sky-ink)" />
                <stop offset="100%" stopColor="var(--mint)" />
              </linearGradient>
            </defs>
            <path d={FLUX_PATH} stroke="var(--hairline)" strokeWidth={3} />
            <path
              d={FLUX_PATH}
              stroke="url(#flux-achat-gradient)"
              strokeWidth={3}
              strokeDasharray="6 10"
              strokeLinecap="round"
              style={{ animation: "dash 4s var(--ease-brand) infinite" }}
            />
          </svg>

          <span
            data-slot="comet"
            className="absolute top-0 left-0 -mt-[7px] -ml-[7px] size-[14px] rounded-full bg-[var(--violet)]"
            style={{
              boxShadow: "0 0 0 6px rgba(99,91,255,.18), 0 0 18px rgba(99,91,255,.7)",
              offsetPath: `path("${FLUX_PATH}")`,
              offsetRotate: "0deg",
              animation: "comet 7s var(--ease-brand) infinite",
            }}
          />

          {FLUX_NODES.map((node, index) => {
            const Icon = node.icon;
            const label = etapes[index];
            if (!label) return null;
            return (
              <div
                key={label}
                className="absolute flex w-[120px] -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-[0.4rem] text-center"
                style={{ left: node.left, top: node.top }}
              >
                <span
                  className="flex size-[52px] shrink-0 items-center justify-center rounded-[16px] text-white"
                  style={{ background: node.gradient }}
                >
                  <Icon className="size-6" />
                </span>
                <b className="rounded-[8px] bg-white px-[0.5rem] py-[0.15rem] font-heading text-[length:var(--text-small)] font-bold tracking-[-0.01em] text-[var(--ink)]">
                  {label}
                </b>
              </div>
            );
          })}

          <div className="absolute -top-[0.35rem] -right-1 flex rotate-2 items-center gap-[0.55rem] rounded-[14px] border border-[var(--hairline)] bg-white px-[0.85rem] py-[0.6rem] text-[length:var(--text-small)] font-bold whitespace-nowrap text-[var(--ink)] shadow-[var(--shadow-2),var(--inset-hi)]">
            <span
              aria-hidden="true"
              className="size-[9px] rounded-full bg-[var(--live)]"
              style={{ animation: "pulse-live 1.8s var(--ease-brand) infinite" }}
            />
            {sessionLivePill?.label} · {apercu.enDirect}
          </div>
        </div>

        <div className="absolute -bottom-4 left-1 flex -rotate-2 items-center gap-[0.55rem] rounded-[14px] border border-[var(--hairline)] bg-white py-[0.6rem] pr-[0.6rem] pl-[0.85rem] text-[length:var(--text-small)] font-bold whitespace-nowrap text-[var(--ink)] shadow-[var(--shadow-2),var(--inset-hi)]">
          {apercu.panneaux[0]?.titre}
          <span className="inline-flex items-center gap-[0.3rem] rounded-full bg-[var(--mint-wash)] px-[0.5rem] py-[0.2rem] text-[length:var(--text-micro)] font-extrabold text-[var(--mint-ink)]">
            {apercu.confirme}
          </span>
        </div>
      </div>
    </div>
  );
}

export { FluxAchat };
