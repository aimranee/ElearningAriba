"use client";
/* why: the five deroule steps are selectable (au clic et au clavier) — a
   real <button> per row keeps Enter/Space activation for free. The preview
   window is a pure illustration (D-57): aria-hidden, no focusable element,
   its content never needs its own keyboard path because the same text
   already lives, readable, in the left column. */

import { useState } from "react";
import {
  Calendar,
  Check,
  Download,
  MessageCircle,
  MousePointer2,
  User,
} from "lucide-react";

import { Reveal } from "@/components/motion/reveal";

/* why (2026-09-01): these five tokens are the only ones in the palette that
   carry a white number at AA — --sky/--mint/--blue were measured at
   2.14 / 2.16 / 3.68 and are excluded from the pastilles. Fills stay flat,
   never a gradient: a white digit on a gradient has no single measurable
   contrast point. */
const ETAPE_TEINTES = [
  "var(--violet)",
  "var(--deep)",
  "var(--blue-ink)",
  "var(--sky-ink)",
  "var(--mint-ink)",
] as const;

interface ApercuPanneau {
  eyebrow: string;
  titre: string;
}

interface Apercu {
  etapeLabel: string;
  panneaux: ApercuPanneau[];
  enDirect: string;
  ecranPartage: string;
  rejoindre: string;
  confirme: string;
  accompagne: string;
  supportModule: string;
  vosQuestions: string;
  creneauExemple: string;
  formateur: string;
  participants: string;
  nonContractuel: string;
  frameLabel: string;
  ceQuiEstFourni: string;
}

interface FourniLigne {
  texte: string;
  coche: boolean;
}

interface FormatDerouleProps {
  deroule: string[];
  fourniLignes: FourniLigne[];
  apercu: Apercu;
  premierModuleTitre: string;
  resume: string;
}

function FormatDeroule({ deroule, fourniLignes, apercu, premierModuleTitre, resume }: FormatDerouleProps) {
  const [selected, setSelected] = useState(0);
  const panneau = apercu.panneaux[selected];
  const pilule = `${apercu.etapeLabel.replace("{n}", String(selected + 1).padStart(2, "0"))} · ${panneau.eyebrow}`;

  return (
    <div>
      <div className="mt-10 grid items-start gap-[clamp(2rem,4vw,3.5rem)] lg:grid-cols-[0.92fr_1.08fr]">
        <div>
          <ol role="tablist" aria-label="Déroulé d'une session" className="flex flex-col gap-[0.3rem]">
            {deroule.map((etape, index) => {
              const isSelected = selected === index;
              return (
                <Reveal key={etape} as="li" dataD={((index % 5) + 1) as 1 | 2 | 3 | 4 | 5}>
                  <button
                    type="button"
                    aria-pressed={isSelected}
                    onClick={() => setSelected(index)}
                    className={
                      isSelected
                        ? "group relative grid w-full grid-cols-[auto_1fr] gap-[1.1rem] rounded-[18px] border border-[var(--hairline-2)] bg-white p-[1.3rem_1.4rem] text-left shadow-[var(--shadow-1)] transition-[background-color,border-color,box-shadow] duration-[var(--duration-base)] ease-[var(--ease-brand)]"
                        : "group relative grid w-full grid-cols-[auto_1fr] gap-[1.1rem] rounded-[18px] border border-transparent bg-transparent p-[1.3rem_1.4rem] text-left transition-[background-color,border-color,box-shadow] duration-[var(--duration-base)] ease-[var(--ease-brand)] hover:border-[var(--hairline)] hover:bg-white"
                    }
                  >
                    <span
                      aria-hidden="true"
                      style={{ backgroundColor: ETAPE_TEINTES[index] }}
                      className="flex size-[42px] shrink-0 items-center justify-center rounded-[14px] text-[length:var(--text-micro)] leading-[var(--text-micro--line-height)] font-extrabold tabular-nums text-white"
                    >
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <p
                      className={
                        isSelected
                          ? "text-[length:var(--text-body)] leading-[var(--text-body--line-height)] font-semibold text-[var(--ink)]"
                          : "text-[length:var(--text-body)] leading-[var(--text-body--line-height)] text-[var(--muted-ink)]"
                      }
                    >
                      {etape}
                    </p>
                  </button>
                </Reveal>
              );
            })}
          </ol>

          <p className="mt-4 text-[length:var(--text-small)] leading-[var(--text-small--line-height)] text-[var(--muted-ink)]">{resume}</p>
        </div>

        {/* why min-w-0: the header label is nowrap, so its full text width
            counts in the preview's min-content even though it truncates;
            with min-width auto the single grid column grew to ~370px and
            the page scrolled sideways below 390px (#30). */}
        <div aria-hidden="true" className="min-w-0 lg:sticky lg:top-[104px]">
          <div className="relative overflow-hidden rounded-[22px] bg-[var(--night)] text-white shadow-[var(--shadow-2)]">
            <div className="flex items-center gap-1.5 border-b border-white/10 px-[14px] py-[11px]">
              <span className="size-2.5 rounded-full" style={{ background: "#FF5F57" }} />
              <span className="size-2.5 rounded-full" style={{ background: "#FEBC2E" }} />
              <span className="size-2.5 rounded-full" style={{ background: "#28C840" }} />
              <span className="ml-2 truncate text-[length:var(--text-micro)] leading-[var(--text-micro--line-height)] font-semibold text-white/60">
                {apercu.frameLabel}
              </span>
              <span className="ml-auto inline-flex shrink-0 items-center gap-[0.4rem] rounded-full bg-[rgba(31,199,155,.16)] px-[0.6rem] py-[0.25rem] text-[length:var(--text-micro)] font-extrabold tracking-[0.06em] text-[var(--mint-soft)] uppercase">
                <span
                  aria-hidden="true"
                  className="size-[7px] rounded-full bg-[var(--live)]"
                  style={{ animation: "pulse-live 1.8s var(--ease-brand) infinite" }}
                />
                {apercu.enDirect}
              </span>
            </div>

            <div className="bg-[linear-gradient(180deg,var(--night-2),var(--night))] p-[1.15rem]">
            <div className="rounded-[16px] bg-white p-[1.15rem] text-[var(--ink)]">
              <span
                className="inline-flex items-center rounded-full px-[0.6rem] py-[0.28rem] text-[length:var(--text-micro)] leading-[var(--text-micro--line-height)] font-extrabold tracking-[0.1em] text-white uppercase"
                style={{ backgroundColor: ETAPE_TEINTES[selected] }}
              >
                {pilule}
              </span>
              <p className="mt-3 text-[length:var(--text-body)] leading-[var(--text-body--line-height)] font-bold tracking-[-0.02em]">{panneau.titre}</p>

              <div className="mt-4">
                {selected === 0 ? (
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center gap-2 text-[length:var(--text-small)] leading-[var(--text-small--line-height)] font-semibold text-[var(--ink)]">
                      <Calendar aria-hidden="true" className="size-4 text-[var(--muted-ink)]" />
                      <span className="tabular-nums">{apercu.creneauExemple}</span>
                    </div>
                    <p className="text-[length:var(--text-small)] leading-[var(--text-small--line-height)] font-semibold text-[var(--ink)]">{premierModuleTitre}</p>
                    <span
                      className="inline-flex w-fit items-center rounded-full px-[0.6rem] py-[0.28rem] text-[length:var(--text-micro)] leading-[var(--text-micro--line-height)] font-bold text-[var(--mint-ink)]"
                      style={{ background: "var(--success-muted)" }}
                    >
                      {apercu.confirme}
                    </span>
                    <div
                      className="rounded-[13px] px-4 py-3 text-center text-[length:var(--text-small)] leading-[var(--text-small--line-height)] font-bold text-white"
                      style={{ backgroundColor: ETAPE_TEINTES[0] }}
                    >
                      {apercu.rejoindre}
                    </div>
                  </div>
                ) : null}

                {selected === 1 ? (
                  <div className="flex flex-col gap-3">
                    <div className="flex gap-3">
                      <div className="flex h-[130px] flex-1 flex-col items-center justify-center gap-2 rounded-[14px] bg-[var(--tint)]">
                        <span
                          aria-hidden="true"
                          className="flex size-10 items-center justify-center rounded-full"
                          style={{ backgroundColor: "var(--deep)" }}
                        >
                          <User aria-hidden="true" className="size-5 text-white" />
                        </span>
                        <span className="text-[length:var(--text-micro)] leading-[var(--text-micro--line-height)] font-semibold text-[var(--muted-ink)]">{apercu.formateur}</span>
                      </div>
                      <div className="flex flex-col gap-2">
                        <span className="text-[length:var(--text-micro)] leading-[var(--text-micro--line-height)] font-semibold text-[var(--muted-ink)]">{apercu.participants}</span>
                        <div className="flex gap-2">
                          {[0, 1, 2].map((i) => (
                            <span
                              key={i}
                              aria-hidden="true"
                              className="flex size-[38px] items-center justify-center rounded-[10px] bg-[var(--tint)]"
                            >
                              <User aria-hidden="true" className="size-4 text-[var(--muted-ink)]" />
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                    <span className="inline-flex w-fit items-center gap-[0.4rem] rounded-full bg-[var(--tint)] px-[0.6rem] py-[0.28rem] text-[length:var(--text-micro)] leading-[var(--text-micro--line-height)] font-bold text-[var(--muted-ink)]">
                      <span aria-hidden="true" className="size-[7px] rounded-full bg-[var(--mint-ink)]" />
                      {apercu.enDirect}
                    </span>
                  </div>
                ) : null}

                {selected === 2 ? (
                  <div className="flex flex-col gap-3">
                    <div className="relative flex flex-col gap-2">
                      <span className="h-2 w-full rounded-full bg-[var(--border2)]" />
                      <span className="h-2 w-[70%] rounded-full bg-[var(--border2)]" />
                      <span className="relative h-2 w-[85%] rounded-full bg-[var(--border2)]">
                        <span
                          aria-hidden="true"
                          className="absolute top-1/2 left-[10%] h-[44px] w-[40%] -translate-y-1/2 rounded-[8px] border-2 bg-[var(--tint)]"
                          style={{ borderColor: ETAPE_TEINTES[2] }}
                        >
                          <MousePointer2
                            aria-hidden="true"
                            className="absolute right-[-6px] bottom-[-6px] size-4"
                            style={{ color: ETAPE_TEINTES[2] }}
                          />
                        </span>
                      </span>
                      <span className="h-2 w-[45%] rounded-full bg-[var(--border2)]" />
                      <span className="h-2 w-[90%] rounded-full bg-[var(--border2)]" />
                    </div>
                    <span className="inline-flex w-fit items-center rounded-full bg-[var(--tint)] px-[0.6rem] py-[0.28rem] text-[length:var(--text-micro)] leading-[var(--text-micro--line-height)] font-bold text-[var(--muted-ink)]">
                      {apercu.ecranPartage}
                    </span>
                  </div>
                ) : null}

                {selected === 3 ? (
                  <div className="flex flex-col gap-2">
                    {[0, 1, 2].map((row) => (
                      <div key={row} className="flex items-center gap-3 rounded-[13px] bg-[var(--tint)] px-3 py-2">
                        {row < 2 ? (
                          <span
                            aria-hidden="true"
                            className="flex size-5 shrink-0 items-center justify-center rounded-full bg-[var(--mint-ink)]"
                          >
                            <Check className="size-[11px] text-white" />
                          </span>
                        ) : (
                          <span
                            aria-hidden="true"
                            className="size-5 shrink-0 rounded-full border-2"
                            style={{ borderColor: ETAPE_TEINTES[3] }}
                          />
                        )}
                        <span className="h-2 flex-1 rounded-full bg-[var(--border2)]" />
                      </div>
                    ))}
                    <div className="mt-1 flex items-center gap-2 text-[length:var(--text-small)] leading-[var(--text-small--line-height)] text-[var(--muted-ink)]">
                      <span
                        aria-hidden="true"
                        className="flex size-6 shrink-0 items-center justify-center rounded-full"
                        style={{ backgroundColor: "var(--deep)" }}
                      >
                        <User aria-hidden="true" className="size-[13px] text-white" />
                      </span>
                      {apercu.accompagne}
                    </div>
                  </div>
                ) : null}

                {selected === 4 ? (
                  <div className="flex flex-col gap-3">
                    <span className="text-[length:var(--text-micro)] leading-[var(--text-micro--line-height)] font-semibold text-[var(--muted-ink)]">{apercu.vosQuestions}</span>
                    {[0, 1].map((row) => (
                      <div key={row} className="flex items-center gap-3 rounded-[13px] bg-[var(--tint)] px-3 py-2">
                        <MessageCircle aria-hidden="true" className="size-4 shrink-0 text-[var(--muted-ink)]" />
                        <span className="h-2 flex-1 rounded-full bg-[var(--border2)]" />
                      </div>
                    ))}
                    <div className="flex items-center gap-3 rounded-[13px] border border-[var(--hairline)] px-3 py-2">
                      <Download aria-hidden="true" className="size-4 shrink-0" style={{ color: ETAPE_TEINTES[4] }} />
                      <span className="text-[length:var(--text-small)] leading-[var(--text-small--line-height)] font-semibold text-[var(--ink)]">{apercu.supportModule}</span>
                    </div>
                  </div>
                ) : null}
              </div>
            </div>
            </div>
          </div>
          <p className="mt-2 text-center text-[length:var(--text-micro)] leading-[var(--text-micro--line-height)] text-[var(--muted-ink)]">{apercu.nonContractuel}</p>
        </div>
      </div>

      <div className="mt-12 border-t border-[var(--hairline)] pt-8">
        <p className="text-[length:var(--text-micro)] leading-[var(--text-micro--line-height)] font-semibold tracking-[0.14em] text-[var(--deep)] uppercase">
          {apercu.ceQuiEstFourni}
        </p>
        <div className="mt-4 grid gap-[0.6rem] sm:grid-cols-2 lg:grid-cols-3">
          {fourniLignes.map((ligne) => (
            <div
              key={ligne.texte}
              className={
                ligne.coche
                  ? "flex items-start gap-[0.65rem] rounded-[13px] border border-[var(--hairline)] bg-white px-[0.85rem] py-[0.7rem] text-[length:var(--text-small)] leading-[var(--text-small--line-height)]"
                  : "flex items-start gap-[0.65rem] rounded-[13px] bg-[var(--tint)] px-[0.85rem] py-[0.7rem] text-[length:var(--text-small)] leading-[var(--text-small--line-height)] text-[var(--muted-ink)]"
              }
            >
              {ligne.coche ? (
                <span
                  aria-hidden="true"
                  className="flex size-5 shrink-0 items-center justify-center rounded-full bg-[var(--mint-ink)] text-white"
                >
                  <Check className="size-[11px]" />
                </span>
              ) : (
                <span
                  aria-hidden="true"
                  className="size-5 shrink-0 rounded-full border-2 border-[var(--hairline-2)]"
                />
              )}
              {ligne.texte}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export { FormatDeroule };
