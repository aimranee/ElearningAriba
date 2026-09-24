import { z } from "zod";

import { TIME_ZONE } from "@/lib/i18n/fr";

/*
 * why: imported by a "use client" component (agenda-booker.tsx) — this
 * module must NOT carry `import "server-only"` and must stay side-effect
 * free and Intl-only. No date library: Postgres owns the zoned arithmetic
 * and every instant that reaches the browser is already a correct
 * timestamptz; the browser only formats and does civil-calendar grid maths.
 */

export type Creneau = { debut: Date; fin: Date };

/** Boundary schema for a raw app.creneaux_libres row, per CLAUDE.md. */
export const creneauRpcRowSchema = z.object({
  debut: z.string(),
  fin: z.string(),
});

export const creneauxRpcSchema = z.array(creneauRpcRowSchema);

/**
 * Parses and converts raw RPC rows to `Creneau[]`. Throws on a malformed
 * row's date parse; callers should safeParse the raw shape first via
 * `creneauxRpcSchema` and only then call this.
 */
export function versCreneaux(
  rows: readonly { debut: string; fin: string }[],
): Creneau[] {
  return rows.map((row) => ({
    debut: new Date(row.debut),
    fin: new Date(row.fin),
  }));
}

const jourIsoFormatter = new Intl.DateTimeFormat("en-CA", {
  timeZone: TIME_ZONE,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

/**
 * The YYYY-MM-DD day key **in Europe/Paris** for an instant, via the
 * en-CA formatToParts idiom. This is the grouping key; never use
 * `toISOString().slice(0,10)`, which is UTC and shifts the day for any slot
 * before 02:00 Paris.
 */
export function jourIsoParis(d: Date): string {
  return jourIsoFormatter.format(d);
}

const heureParisFormatter = new Intl.DateTimeFormat(undefined, {
  timeZone: TIME_ZONE,
  hourCycle: "h23",
  hour: "numeric",
});

function heureParis(d: Date): number {
  const parts = heureParisFormatter.formatToParts(d);
  const hour = parts.find((part) => part.type === "hour")?.value ?? "0";
  return Number(hour);
}

/** Groups a slot list by Paris calendar day, values ordered by debut. */
export function grouperParJour(
  creneaux: readonly Creneau[],
): Map<string, Creneau[]> {
  const sorted = [...creneaux].sort(
    (a, b) => a.debut.getTime() - b.debut.getTime(),
  );
  const map = new Map<string, Creneau[]>();
  for (const creneau of sorted) {
    const key = jourIsoParis(creneau.debut);
    const existing = map.get(key);
    if (existing) {
      existing.push(creneau);
    } else {
      map.set(key, [creneau]);
    }
  }
  return map;
}

/** Splits a day's slots into matin / après-midi on the Paris hour. */
export function grouperMatinApresMidi(
  creneaux: readonly Creneau[],
): { matin: Creneau[]; apresMidi: Creneau[] } {
  const sorted = [...creneaux].sort(
    (a, b) => a.debut.getTime() - b.debut.getTime(),
  );
  const matin: Creneau[] = [];
  const apresMidi: Creneau[] = [];
  for (const creneau of sorted) {
    if (heureParis(creneau.debut) < 12) {
      matin.push(creneau);
    } else {
      apresMidi.push(creneau);
    }
  }
  return { matin, apresMidi };
}

/**
 * The array of YYYY-MM-DD day keys of the calendar grid for a given year and
 * zero-indexed month, padded to whole ISO weeks (lundi first) so
 * grid-cols-7 aligns. Civil-calendar maths only — this is not timezone
 * arithmetic.
 */
export function grilleDuMois(annee: number, mois: number): string[] {
  const premierJour = new Date(Date.UTC(annee, mois, 1));
  const dernierJour = new Date(Date.UTC(annee, mois + 1, 0));

  // getUTCDay(): 0=dimanche..6=samedi. ISO lundi-first offset.
  const offsetDebut = (premierJour.getUTCDay() + 6) % 7;
  const offsetFin = (7 - ((dernierJour.getUTCDay() + 6) % 7) - 1) % 7;

  const jours: string[] = [];
  const debutGrille = new Date(premierJour);
  debutGrille.setUTCDate(debutGrille.getUTCDate() - offsetDebut);
  const finGrille = new Date(dernierJour);
  finGrille.setUTCDate(finGrille.getUTCDate() + offsetFin);

  const curseur = new Date(debutGrille);
  while (curseur.getTime() <= finGrille.getTime()) {
    const annee2 = curseur.getUTCFullYear();
    const mois2 = String(curseur.getUTCMonth() + 1).padStart(2, "0");
    const jour2 = String(curseur.getUTCDate()).padStart(2, "0");
    jours.push(`${annee2}-${mois2}-${jour2}`);
    curseur.setUTCDate(curseur.getUTCDate() + 1);
  }
  return jours;
}

/**
 * The earliest YYYY-MM-DD key carrying at least one slot — D-29: the
 * calendar opens on the first day carrying slots, never on an empty month.
 * Also supplies the initial month to display, not just the day.
 */
export function premierJourPorteur(
  creneaux: readonly Creneau[],
): string | null {
  if (creneaux.length === 0) return null;
  let plusTot: Date | null = null;
  for (const creneau of creneaux) {
    if (plusTot === null || creneau.debut.getTime() < plusTot.getTime()) {
      plusTot = creneau.debut;
    }
  }
  return plusTot ? jourIsoParis(plusTot) : null;
}

/**
 * The Set of day keys carrying at least one slot — the only availability
 * information the calendar component receives (D-23): a day is selectable
 * if and only if it is in this set, and the component is never told *why*
 * an absent day is absent.
 */
export function joursPorteurs(creneaux: readonly Creneau[]): Set<string> {
  const set = new Set<string>();
  for (const creneau of creneaux) {
    set.add(jourIsoParis(creneau.debut));
  }
  return set;
}

/** Whether a day key is strictly before today in Europe/Paris. */
export function estPasse(jour: string): boolean {
  return jour < jourIsoParis(new Date());
}

/**
 * Whole seconds left on a retention, clamped at zero. Pure, so a countdown
 * component renders from it rather than doing its own arithmetic, and so
 * the same expiry rule is used on both surfaces (D-27).
 */
export function maintienRestant(expireLe: Date, maintenant: Date): number {
  const restant = Math.floor(
    (expireLe.getTime() - maintenant.getTime()) / 1000,
  );
  return Math.max(0, restant);
}

/*
 * why (D-28): this module is the single owner of the sessionStorage key
 * carrying a chosen slot. agenda-booker.tsx writes through it; plan 04-05's
 * connexion-form.tsx, inscription-form.tsx and parcours-reservation.tsx
 * read through it. A second literal anywhere would silently break the
 * D-28 return path with no type error and no failing build.
 */
export const CLE_CRENEAU_CHOISI = "ariba.creneau.choisi" as const;

export const creneauChoisiSchema = z.object({
  typeId: z.string(),
  debut: z.string(),
  jeton: z.string().nullable(),
  expireLe: z.string().nullable(),
});

export type CreneauChoisi = z.infer<typeof creneauChoisiSchema>;

/** Reads the CLE_CRENEAU_CHOISI payload from sessionStorage, or null. */
export function lireCreneauChoisi(): CreneauChoisi | null {
  if (typeof window === "undefined") return null;
  const brut = window.sessionStorage.getItem(CLE_CRENEAU_CHOISI);
  if (!brut) return null;
  try {
    const parsed = creneauChoisiSchema.safeParse(JSON.parse(brut));
    return parsed.success ? parsed.data : null;
  } catch {
    return null;
  }
}

/** Writes the CLE_CRENEAU_CHOISI payload to sessionStorage. */
export function ecrireCreneauChoisi(valeur: CreneauChoisi): void {
  if (typeof window === "undefined") return;
  window.sessionStorage.setItem(CLE_CRENEAU_CHOISI, JSON.stringify(valeur));
}

/** Clears the stored jeton/expireLe, keeping typeId/debut, for a mint retry. */
export function effacerJetonCreneauChoisi(): CreneauChoisi | null {
  const actuel = lireCreneauChoisi();
  if (!actuel) return null;
  const suivant: CreneauChoisi = { ...actuel, jeton: null, expireLe: null };
  ecrireCreneauChoisi(suivant);
  return suivant;
}

/** Removes the CLE_CRENEAU_CHOISI payload entirely (e.g. on release). */
export function effacerCreneauChoisi(): void {
  if (typeof window === "undefined") return;
  window.sessionStorage.removeItem(CLE_CRENEAU_CHOISI);
}

/*
 * why (#18): /reservation and the public pages sit under different root
 * layouts, so leaving the booking for a public page is a full page load: the
 * booking island never unmounts, and its unmount cleanup (release + clear)
 * no longer runs. On unload the payload is therefore set aside instead of
 * kept, and only a reload of /reservation itself takes it back — the one
 * unload after which the booking used to come back on its recap.
 */
const CLE_CRENEAU_RECHARGEMENT = "ariba.creneau.rechargement" as const;

/** On /reservation's unload: clears the payload, keeping it for a reload. */
export function mettreDeCoteCreneauChoisi(): void {
  if (typeof window === "undefined") return;
  const brut = window.sessionStorage.getItem(CLE_CRENEAU_CHOISI);
  if (brut) window.sessionStorage.setItem(CLE_CRENEAU_RECHARGEMENT, brut);
  window.sessionStorage.removeItem(CLE_CRENEAU_CHOISI);
}

/** On /reservation's mount: restores the set-aside payload after a reload of this same page, and drops it otherwise. */
export function reprendreCreneauApresRechargement(): void {
  if (typeof window === "undefined") return;
  const brut = window.sessionStorage.getItem(CLE_CRENEAU_RECHARGEMENT);
  window.sessionStorage.removeItem(CLE_CRENEAU_RECHARGEMENT);
  if (!brut) return;
  const [entree] = performance.getEntriesByType("navigation");
  const recharge =
    entree instanceof PerformanceNavigationTiming &&
    entree.type === "reload" &&
    new URL(entree.name).pathname === window.location.pathname;
  if (recharge) window.sessionStorage.setItem(CLE_CRENEAU_CHOISI, brut);
}
