import agenda from "@/locales/fr/agenda.json";
import landing from "@/locales/fr/landing.json";

/* why: 21 cells, decoration only — never derived from date logic (D-45/D-66).
   Literal per the maquette's three rows: row 1 = on, empty, on, on, empty,
   empty, empty; row 2 = empty, on, empty, pick, on, empty, empty; row 3 = on,
   empty, empty, on, on, empty, empty. */
const SLOT_STATES: readonly ("on" | "pick" | "")[] = [
  "on", "", "on", "on", "", "", "",
  "", "on", "", "pick", "on", "", "",
  "on", "", "", "on", "on", "", "",
] as const;

/**
 * The cta-final decorative mini-calendar (brief §C-07, maquette `.cal`):
 * pure server-rendered illustration mirroring `flux-achat.tsx`'s shape —
 * `aria-hidden`, no fetch, no date/seat-count content, only reused strings.
 */
function MiniCalendrier() {
  const decouverte = agenda.typesRendezVous[0];
  const panneauTitre = landing.formatModalites.apercu.panneaux[0]?.titre;
  const confirme = landing.formatModalites.apercu.confirme;
  const conclusion = landing.ctaFinal.etapes.items[1]?.description;

  return (
    <div
      aria-hidden="true"
      data-slot="mini-calendrier"
      className="relative mx-auto max-w-[420px] rotate-[-1.5deg] rounded-[24px] bg-white p-5 text-[var(--ink)] shadow-[0_40px_80px_-30px_rgba(0,0,0,.5),var(--inset-hi)]"
    >
      <div className="flex items-center justify-between gap-3">
        <b className="font-heading text-[length:var(--text-body)] font-bold">{panneauTitre}</b>
        {decouverte ? (
          <span className="inline-flex items-center gap-[0.4rem] rounded-full bg-[var(--lav)] px-[0.65rem] py-[0.3rem] text-[length:var(--text-micro)] font-extrabold text-[var(--deep)]">
            {decouverte.libelle} · {decouverte.dureeMinutes} min
          </span>
        ) : null}
      </div>

      <div className="mt-4 grid grid-cols-7 gap-[0.4rem] text-center text-[length:var(--text-micro)] font-bold text-[var(--muted2)]">
        <span>L</span>
        <span>M</span>
        <span>M</span>
        <span>J</span>
        <span>V</span>
        <span>S</span>
        <span>D</span>
      </div>

      <div className="mt-2 grid grid-cols-7 gap-[0.4rem]">
        {SLOT_STATES.map((state, index) => {
          if (state === "pick") {
            return (
              <span
                key={index}
                className="relative h-[26px] rounded-[8px] border border-[var(--violet)] bg-[var(--violet)] shadow-[0_8px_16px_-8px_rgba(99,91,255,.9)]"
              >
                <svg
                  aria-hidden="true"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="white"
                  strokeWidth={3}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="absolute top-1/2 left-1/2 size-[12px] -translate-x-1/2 -translate-y-1/2"
                >
                  <path d="M5 12l5 5L20 7" />
                </svg>
              </span>
            );
          }
          if (state === "on") {
            return (
              <span
                key={index}
                className="h-[26px] rounded-[8px] border border-[var(--violet-soft)] bg-[var(--lav)]"
              />
            );
          }
          return (
            <span
              key={index}
              className="h-[26px] rounded-[8px] border border-[var(--hairline)] bg-[var(--tint)]"
            />
          );
        })}
      </div>

      <div className="mt-4 flex items-center gap-[0.6rem] border-t border-[var(--hairline)] pt-[0.9rem] text-[length:var(--text-small)] font-semibold">
        <span
          className="inline-flex w-fit items-center rounded-full px-[0.6rem] py-[0.28rem] text-[length:var(--text-micro)] leading-[var(--text-micro--line-height)] font-bold text-[var(--mint-ink)]"
          style={{ background: "var(--success-muted)" }}
        >
          {confirme}
        </span>
        {conclusion ? <span>{conclusion}</span> : null}
      </div>
    </div>
  );
}

export { MiniCalendrier };
