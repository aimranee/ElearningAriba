import Link from "next/link";
import { FOCUS_RING } from "@/lib/utils";
import { getMessages } from "@/lib/i18n/messages";
import { localizedPath } from "@/lib/i18n/routes";
import type { Locale } from "@/lib/i18n/locale";

const FOOTER_LINK_CLASS = `block py-1 text-sm text-white/78 hover:text-white ${FOCUS_RING}`;

/** Presentational only — link labels and layout, no legal prose (D-41). */
export function Footer({ locale }: { locale: Locale }) {
  const common = getMessages(locale, "common");
  const href = (frenchPath: string) => localizedPath(frenchPath, locale);
  const annee = new Date().getFullYear();

  // why (D-41/PUB-12): the five legal pages are Lot 5 work — a placeholder
  // anchor pointing nowhere would look clickable and go nowhere, so they
  // render as non-navigating spans carrying the signed label until Lot 5
  // ships the route.
  const informationsLabels = [
    common.footer.mentionsLegales,
    common.footer.politiqueConfidentialite,
    common.footer.politiqueCookies,
    common.footer.politiqueRemboursement,
    common.footer.clauseNonResponsabilite,
  ];

  return (
    <footer className="relative z-[1] bg-[var(--ink)] text-white in-data-[density=compact]:py-2">
      <div className="mx-auto max-w-[1200px] px-6 py-16">
        <div className="grid grid-cols-2 gap-10 sm:grid-cols-4 lg:grid-cols-[1.5fr_1fr_1fr_1fr]">
          <div className="col-span-2 flex flex-col gap-3 sm:col-span-4 lg:col-span-1">
            <span className="font-heading text-lg font-semibold text-white">
              {common.metadata.title}
            </span>
            <p className="max-w-[38ch] text-sm leading-relaxed text-white/62">
              {common.footer.baseline}
            </p>
          </div>

          <nav aria-label={common.footer.colonnes.formation}>
            <h2 className="text-xs font-bold tracking-[0.14em] text-white/55 uppercase">
              {common.footer.colonnes.formation}
            </h2>
            <ul className="mt-4 flex flex-col gap-1">
              <li>
                <Link href={href("/formation")} className={FOOTER_LINK_CLASS}>
                  {common.nav.formation}
                </Link>
              </li>
              <li>
                <Link href={href("/a-propos")} className={FOOTER_LINK_CLASS}>
                  {common.nav.aPropos}
                </Link>
              </li>
              <li>
                <Link href={href("/contact")} className={FOOTER_LINK_CLASS}>
                  {common.nav.contact}
                </Link>
              </li>
            </ul>
          </nav>

          <nav aria-label={common.footer.colonnes.compte}>
            <h2 className="text-xs font-bold tracking-[0.14em] text-white/55 uppercase">
              {common.footer.colonnes.compte}
            </h2>
            <ul className="mt-4 flex flex-col gap-1">
              <li>
                <Link href={href("/inscription")} className={FOOTER_LINK_CLASS}>
                  {common.nav.inscription}
                </Link>
              </li>
              <li>
                <Link href={href("/connexion")} className={FOOTER_LINK_CLASS}>
                  {common.nav.connexion}
                </Link>
              </li>
              <li>
                <Link href={href("/agenda")} className={FOOTER_LINK_CLASS}>
                  {common.nav.agenda}
                </Link>
              </li>
              <li>
                <Link href={href("/espace")} className={FOOTER_LINK_CLASS}>
                  {common.nav.espace}
                </Link>
              </li>
            </ul>
          </nav>

          <div aria-label={common.footer.colonnes.informations}>
            <h2 className="text-xs font-bold tracking-[0.14em] text-white/55 uppercase">
              {common.footer.colonnes.informations}
            </h2>
            <ul className="mt-4 flex flex-col gap-1">
              {informationsLabels.map((label) => (
                <li key={label}>
                  <span className="block py-1 text-sm text-white/78">{label}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-wrap items-center gap-x-6 gap-y-3 border-t border-white/12 pt-6 text-sm text-white/55">
          <span>{common.footer.copyright.replace("{annee}", String(annee))}</span>
          <Link
            href={href("/reservation")}
            className={`ml-auto text-white/72 hover:text-white ${FOCUS_RING}`}
          >
            {common.actions.reserver}
          </Link>
        </div>
      </div>
    </footer>
  );
}
