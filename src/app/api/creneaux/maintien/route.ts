import { NextResponse } from "next/server";

import {
  maintienPostSchema,
  maintienDeleteSchema,
  mapResultatMaintienToErreurKey,
  type MaintienErreurKey,
} from "@/lib/validation/maintien";
import { consume } from "@/lib/rate-limit";
import { createPublicClient } from "@/lib/supabase/public";

/*
 * why (D-27, D-28): this file exports POST and DELETE only — no GET, no PUT,
 * no PATCH. The route is deliberately unauthenticated: D-28 puts sign-in at
 * screen 3, so the visitor who retains a slot has no session yet, and
 * requiring one here would be the exact gate D-28 removes. It uses the
 * cookie-free anonymous client from src/lib/supabase/public.ts — this is a
 * server route, so the `server-only` fence is satisfied. (Note: D-06 names
 * this same module for the *browser* free-slot read, which is a naming
 * slip — that read goes through src/lib/supabase/client.ts instead, since
 * public.ts cannot be imported from a "use client" component. D-06's intent
 * — an anonymous read, /agenda stays static — is preserved exactly.)
 */

function clientIp(request: Request): string {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown"
  );
}

/* why: the response carries the machine-readable agenda.erreurs.* key, not
   the resolved French text — mirrors src/app/api/contact/route.ts's field-
   error-map idiom. The client resolves the key against agenda.json itself,
   so no English Zod message and no server-composed string ever reaches the
   browser. */
function erreurJson(cle: MaintienErreurKey, status: number) {
  return NextResponse.json(
    { erreur: cle },
    { status, headers: { "Cache-Control": "no-store" } },
  );
}

/*
 * The sequence below is exact and its order is the control. On an
 * unauthenticated route the client IP is the only identifier the caller
 * does not control. A client-supplied value — here `jeton` — may *narrow*
 * a budget; it may never *replace* one. Step 1 runs on a key the caller
 * cannot influence and runs before anything else, so a caller sending a
 * fresh random uuid per request cannot escape the IP ceiling by looking
 * like a "replace".
 */
export async function POST(request: Request) {
  const ip = clientIp(request);

  // 1. Unconditional IP ceiling, before the body is read at all.
  const ipCeiling = consume(`maintien:ip:${ip}`, {
    max: 120,
    windowMs: 600_000,
  });
  if (!ipCeiling.allowed) {
    return erreurJson("erreurGenerique", 429);
  }

  // 2. Parse the body with zod; nothing before this point has read it.
  const body = await request.json().catch(() => null);
  const parsed = maintienPostSchema.safeParse(body);
  if (!parsed.success) {
    return erreurJson("champsInvalides", 422);
  }
  const { typeId, debut, jeton } = parsed.data;

  // 3. Sub-budget, derived from the validated body — narrowing only, never
  // replacing step 1.
  if (!jeton) {
    // No jeton: this request may create state, charge the tight budget.
    const mintCeiling = consume(`maintien:mint:${ip}`, {
      max: 30,
      windowMs: 600_000,
    });
    if (!mintCeiling.allowed) {
      return erreurJson("erreurGenerique", 429);
    }
  } else {
    // A jeton is present: the compare/replace branch, generous, IP-prefixed
    // so entry growth stays bounded by the IP ceiling above.
    const jetonCeiling = consume(`maintien:jeton:${ip}:${jeton}`, {
      max: 60,
      windowMs: 600_000,
    });
    if (!jetonCeiling.allowed) {
      return erreurJson("erreurGenerique", 429);
    }
  }

  // 4. Call the RPC. Branch on the returned `resultat`, never on an HTTP
  // status.
  const supabase = createPublicClient();
  const { data, error } = await supabase.rpc("maintenir_creneau", {
    p_type_id: typeId,
    p_debut: debut,
    p_jeton: jeton,
  });

  if (error || !data || data.length === 0) {
    // 6. Never let a PostgrestError message, table name or column name
    // reach the response.
    return erreurJson("erreurGenerique", 502);
  }

  const { resultat, jeton: jetonRetour, expire_le } = data[0];

  if (resultat !== "ok") {
    const cle = mapResultatMaintienToErreurKey(resultat) ?? "erreurGenerique";
    return erreurJson(cle, 409);
  }

  return NextResponse.json(
    { jeton: jetonRetour, expireLe: expire_le },
    { status: 200, headers: { "Cache-Control": "no-store" } },
  );
}

export async function DELETE(request: Request) {
  const ip = clientIp(request);

  // 5. Validate first, then a ceiling that fails *open*.
  const body = await request.json().catch(() => null);
  const parsed = maintienDeleteSchema.safeParse(body);
  if (!parsed.success) {
    return erreurJson("champsInvalides", 422);
  }

  const releaseCeiling = consume(`maintien:liberation:${ip}`, {
    max: 120,
    windowMs: 600_000,
  });

  if (!releaseCeiling.allowed) {
    // Refusing a release would leave a slot held, the opposite of what the
    // limiter is for — skip the RPC and return 200 anyway, never 429.
    return NextResponse.json(
      { ok: true },
      { status: 200, headers: { "Cache-Control": "no-store" } },
    );
  }

  const supabase = createPublicClient();
  await supabase.rpc("liberer_creneau", { p_jeton: parsed.data.jeton });
  // liberer_creneau is idempotent — a release for a token that no longer
  // exists is still a 200; the browser calls this on beforeunload where a
  // retry is normal.
  return NextResponse.json(
    { ok: true },
    { status: 200, headers: { "Cache-Control": "no-store" } },
  );
}
