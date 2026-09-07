/**
 * Auth v2 panel illustration (brief §C-03, maquette `.window`): a decorative
 * three-step "your journey" preview beside the inscription form — same
 * window chrome as espace-fenetre.tsx, no live badge, no fetch, no
 * translation keys (illustration-only text per brief §C-03).
 */
function ParcoursEtapes() {
  const etapes = [
    {
      n: "01",
      titre: "Créer votre compte",
      description: "Prénom, nom, email, mot de passe",
      courante: true,
    },
    {
      n: "02",
      titre: "Confirmer votre email",
      description: "Un lien vous attend dans votre boîte mail",
      courante: false,
    },
    {
      n: "03",
      titre: "Réserver votre premier créneau",
      description: "Appel découverte, session individuelle ou groupe",
      courante: false,
    },
  ];

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none relative overflow-hidden rounded-[22px] bg-[var(--night)] text-white shadow-[var(--shadow-2),0_0_0_1px_var(--glass-line)]"
    >
      <div className="flex items-center gap-[0.4rem] border-b border-white/10 px-[0.9rem] py-[0.75rem]">
        <span className="size-2.5 rounded-full" style={{ background: "#FF5F57" }} />
        <span className="size-2.5 rounded-full" style={{ background: "#FEBC2E" }} />
        <span className="size-2.5 rounded-full" style={{ background: "#28C840" }} />
        <span className="ml-2 min-w-0 flex-1 truncate whitespace-nowrap text-[length:var(--text-micro)] font-semibold text-white/60">
          Votre parcours · trois étapes
        </span>
      </div>

      <div className="bg-[linear-gradient(180deg,var(--night-2),var(--night))] p-[1.15rem]">
        <div className="flex flex-col gap-[0.55rem]">
          {etapes.map(({ n, titre, description, courante }) =>
            courante ? (
              <div
                key={n}
                className="flex items-center gap-[0.85rem] rounded-[14px] border border-white bg-white p-[0.8rem_0.95rem] text-[var(--ink)] shadow-[var(--shadow-1)]"
              >
                <span className="flex size-[30px] flex-none items-center justify-center rounded-full border border-primary bg-primary font-heading text-[length:var(--text-micro)] font-extrabold text-white">
                  {n}
                </span>
                <div>
                  <b className="block font-heading text-[length:var(--text-small)] font-bold leading-[1.3]">
                    {titre}
                  </b>
                  <small className="mt-[0.1rem] block text-[length:var(--text-micro)] leading-[1.4] text-[var(--muted-ink)]">
                    {description}
                  </small>
                </div>
                <span className="ml-auto flex-none rounded-full bg-[var(--lav)] px-[0.55rem] py-[0.25rem] text-[length:var(--text-micro)] font-extrabold uppercase tracking-[0.06em] text-[var(--deep)]">
                  Maintenant
                </span>
              </div>
            ) : (
              <div
                key={n}
                className="flex items-center gap-[0.85rem] rounded-[14px] border border-[var(--glass-line)] bg-[var(--glass)] p-[0.8rem_0.95rem] text-white/82"
              >
                <span className="flex size-[30px] flex-none items-center justify-center rounded-full border border-[var(--glass-line-2)] bg-[var(--glass-2)] font-heading text-[length:var(--text-micro)] font-extrabold">
                  {n}
                </span>
                <div>
                  <b className="block font-heading text-[length:var(--text-small)] font-bold leading-[1.3]">
                    {titre}
                  </b>
                  <small className="mt-[0.1rem] block text-[length:var(--text-micro)] leading-[1.4] text-white/62">
                    {description}
                  </small>
                </div>
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
}

export { ParcoursEtapes };
