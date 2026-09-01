import { NextResponse } from "next/server";

import { inscriptionSchema, inscriptionIssuesToFieldErrors } from "@/lib/validation/auth";
import { consume } from "@/lib/rate-limit";
import { createClient } from "@/lib/supabase/server";
import { serverEnv } from "@/lib/env/server";

/*
 * why: sign-up creates state — this file exports POST only. No GET (no list
 * route), no PUT/PATCH/DELETE, and the handler never returns anything about
 * an existing account beyond what the copy already says (T-03-30).
 */
export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = inscriptionSchema.safeParse(body);

  if (!parsed.success) {
    const errors = inscriptionIssuesToFieldErrors(parsed.error.issues);
    return NextResponse.json({ errors }, { status: 422 });
  }

  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  const { allowed } = consume(ip);
  if (!allowed) {
    // why: same success shape a real submission gets — no signal that the
    // guard fired, mirroring api/contact/route.ts:39-43.
    return NextResponse.json({ ok: true }, { status: 200 });
  }

  const { prenom, nom, email, motDePasse, profil } = parsed.data;

  const supabase = await createClient();
  const { error } = await supabase.auth.signUp({
    email,
    password: motDePasse,
    options: {
      emailRedirectTo: `${serverEnv.NEXT_PUBLIC_SITE_URL}/api/auth/callback`,
      /*
       * why: this object becomes `raw_user_meta_data`, which is
       * client-controlled — exactly why the plan 03-01 trigger reads only
       * `prenom`, `nom` and `profil_professionnel` from it and ignores
       * everything else, including any privilege field. Sending a privilege
       * field here would look like an intended path even though the trigger
       * ignores it, so nothing beyond those three keys is ever sent.
       */
      data: {
        prenom,
        nom,
        profil_professionnel: profil,
      },
    },
  });

  if (error) {
    /*
     * why (T-03-30, D-A10): observed locally — a signup against an address
     * that is already registered and confirmed does not come back as the
     * success-shaped, session-less response the plan describes; the local
     * auth server returns an explicit `user_already_exists` error instead.
     * Folding that one code into the ordinary success response is what
     * actually keeps /inscription from becoming an account-existence oracle
     * on a public form — returning it as any kind of error would leak the
     * same signal through the HTTP status alone. inscription.succes.titre
     * stays true either way: an existing account holder is told to check
     * their mailbox exactly like a new signup is.
     */
    if (error.code === "user_already_exists") {
      return NextResponse.json({ ok: true }, { status: 200 });
    }
    // why (T-03-01, T-03-31): the server enforces the plan 03-02 password
    // rule too; map its rejection to the existing locale key rather than the
    // provider's English message. Anything else is a form-level rejection —
    // never the provider's text.
    if (error.code === "weak_password") {
      return NextResponse.json(
        { errors: { motDePasse: "motDePasseFaible" } },
        { status: 422 },
      );
    }
    return NextResponse.json({ errors: {} }, { status: 502 });
  }

  return NextResponse.json({ ok: true }, { status: 200 });
}
