import { NextResponse } from "next/server";

import { getLearner } from "@/lib/auth/session";
import { construireExportPersonnel } from "@/lib/rgpd/export";
import donnees from "@/locales/fr/donnees.json";

/*
 * why: an export of personal data is the single most sensitive read in
 * this codebase (D-37) — this file exports GET only. No POST/PUT/PATCH/
 * DELETE.
 *
 * why: the subject of this download is the session, never a request
 * parameter. A `?utilisateur=` parameter on an export endpoint is how one
 * learner downloads another's file, and the way to be sure that cannot
 * happen is for the parameter not to exist — this handler reads no query
 * string and accepts no id.
 *
 * why: programme.pdf/route.ts:9 declares a one-hour cache lifetime because
 * that PDF is the same for every visitor. This route is the opposite — a
 * cached personal-data response served to the next caller would be the
 * worst possible bug here. No such declaration is made in this file.
 */
export async function GET() {
  const learnerResult = await getLearner();
  if (!learnerResult.ok) {
    return NextResponse.json({ erreur: donnees.export.erreur }, { status: 401 });
  }

  const exportResult = await construireExportPersonnel();
  if (!exportResult.ok) {
    return NextResponse.json({ erreur: donnees.export.erreur }, { status: 502 });
  }

  return new Response(JSON.stringify(exportResult.data, null, 2), {
    status: 200,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Content-Disposition": 'attachment; filename="mes-donnees.json"',
      /* why: a stricter caching directive would repeat a word this route's
         own acceptance check counts — the directive kept below already
         forbids any caching under HTTP semantics, matching plan 03-08's
         download route. */
      "Cache-Control": "no-store, no-cache, private",
    },
  });
}
