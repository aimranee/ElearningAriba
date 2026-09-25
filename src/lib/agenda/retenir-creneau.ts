import { z } from "zod";

import { effacerJetonCreneauChoisi } from "@/lib/agenda/creneaux";
import type { MaintienErreurKey } from "@/lib/validation/maintien";

/*
 * why: the browser side of POST/DELETE /api/creneaux/maintien for the
 * /reservation flow — screen 2 retaining a slot and the recap taking its
 * hold back after a reload (#28) go through the same request and the same
 * one-retry rule. Client-safe: no `server-only`.
 */

const URL_MAINTIEN = "/api/creneaux/maintien";

const CLES_ERREUR = [
  "creneauIndisponible",
  "typeInconnu",
  "jetonInconnu",
  "champsInvalides",
  "erreurGenerique",
] as const satisfies readonly MaintienErreurKey[];

const reponseOkSchema = z.object({ jeton: z.string(), expireLe: z.string() });
const reponseErreurSchema = z.object({ erreur: z.enum(CLES_ERREUR) });

export type ResultatMaintien =
  | { ok: true; jeton: string; expireLe: string }
  | { ok: false; erreur: MaintienErreurKey | undefined };

async function poster(corps: {
  typeId: string;
  debut: string;
  jeton?: string;
}): Promise<ResultatMaintien> {
  const reponse = await fetch(URL_MAINTIEN, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(corps),
  });
  const json: unknown = await reponse.json().catch(() => null);
  if (reponse.ok) {
    const ok = reponseOkSchema.safeParse(json);
    return ok.success ? { ok: true, ...ok.data } : { ok: false, erreur: undefined };
  }
  const erreur = reponseErreurSchema.safeParse(json);
  return { ok: false, erreur: erreur.success ? erreur.data.erreur : undefined };
}

/**
 * Retains `debut` for `typeId`, replacing the hold of `jeton` when given.
 * Retries once, never in a loop: a stored token gone stale (the fifteen
 * minutes lapsed, a release, a server restart) answers 'jeton_inconnu' —
 * drop it and re-POST once as a mint. Only a second failure is returned.
 */
export async function retenirCreneau(demande: {
  typeId: string;
  debut: string;
  jeton?: string;
}): Promise<ResultatMaintien> {
  const { typeId, debut, jeton } = demande;
  const premier = await poster({ typeId, debut, ...(jeton ? { jeton } : {}) });
  if (!premier.ok && premier.erreur === "jetonInconnu") {
    effacerJetonCreneauChoisi();
    return poster({ typeId, debut });
  }
  return premier;
}

/** Releases a hold and resolves once the server has answered. Idempotent. */
export async function libererMaintien(jeton: string): Promise<void> {
  await fetch(URL_MAINTIEN, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ jeton }),
    keepalive: true,
  }).catch(() => undefined);
}

let rechargementConsulte = false;

/**
 * True for the first caller in this document, and only when the document
 * is a reload of the current path. Once per document: a later client
 * navigation back to the same path is not a reload.
 */
export function estRechargementDeCettePage(): boolean {
  if (typeof window === "undefined" || rechargementConsulte) return false;
  rechargementConsulte = true;
  const [entree] = performance.getEntriesByType("navigation");
  return (
    entree instanceof PerformanceNavigationTiming &&
    entree.type === "reload" &&
    new URL(entree.name).pathname === window.location.pathname
  );
}
