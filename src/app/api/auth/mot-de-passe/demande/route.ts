import { NextResponse } from "next/server";

import { demandeResetSchema } from "@/lib/validation/auth";
import { consume } from "@/lib/rate-limit";
import { createClient } from "@/lib/supabase/server";
import { serverEnv } from "@/lib/env/server";

/*
 * why: the reset-request surface is unauthenticated and personal-data
 * adjacent (T-03-02) — this file exports POST only. No GET (no way to probe
 * an address without triggering a send), no PUT/PATCH/DELETE.
 */
export async function POST(request: Request) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  const { allowed } = consume(ip);
  if (!allowed) {
    // why (D-08): reuses connexion.erreurs.tropDeTentatives verbatim — no
    // new string authored for the same throttled-request meaning.
    return NextResponse.json({ error: "tropDeTentatives" }, { status: 429 });
  }

  const body = await request.json().catch(() => null);
  const parsed = demandeResetSchema.safeParse(body);

  if (!parsed.success) {
    // why: reuses inscription.erreurs.emailInvalide cross-bundle, mirroring
    // the precedent set by nouveauMotDePasseSchema (plan 03-03) — mot-de-
    // passe.json's own erreurs bundle only carries page/transport-level
    // strings, not per-field validation copy.
    return NextResponse.json(
      { errors: { email: "emailInvalide" } },
      { status: 422 },
    );
  }

  const { email } = parsed.data;

  const supabase = await createClient();
  const redirectTo = `${serverEnv.NEXT_PUBLIC_SITE_URL}/api/auth/callback?next=/nouveau-mot-de-passe`;

  await supabase.auth.resetPasswordForEmail(email, { redirectTo });

  /*
   * why (T-03-02, D-A10): the response is identical whether the address is
   * registered, unregistered, or the auth server refused the send — same
   * 200, same body, same code path. `demande.succes.message` was written to
   * stay true either way ("si un compte existe..."); branching this
   * response on the address would turn a true sentence into an oracle.
   */
  return NextResponse.json({ ok: true }, { status: 200 });
}
