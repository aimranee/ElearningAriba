import { NextResponse } from "next/server";

import { connexionSchema, connexionIssuesToFieldErrors } from "@/lib/validation/auth";
import { peek, record } from "@/lib/rate-limit";
import { createClient } from "@/lib/supabase/server";

/*
 * why: sign-in is a credential-submission endpoint — this file exports POST
 * only. No GET, no PUT/PATCH/DELETE.
 */
export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = connexionSchema.safeParse(body);

  if (!parsed.success) {
    const errors = connexionIssuesToFieldErrors(parsed.error.issues);
    return NextResponse.json({ errors }, { status: 422 });
  }

  /*
   * why (T-03-01, CPT-03): unlike api/contact/route.ts:39-43, which returns
   * the success shape on refusal so a bot learns nothing, a refused sign-in
   * must tell the learner why their own form stopped working — so this
   * branch returns the tropDeTentatives error, not a fake 200. This layer
   * plus [auth.rate_limit] sign_in_sign_ups = 10/5min at the auth server
   * (supabase/config.toml) are the whole of CPT-03's throttling — no
   * human-challenge widget, no third-party dependency (D-08).
   */
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  const rateLimitKey = `connexion:${ip}`;

  /*
   * why (DEBIT-01): a successful sign-in must not spend this budget — only a
   * failed one does, so the budget is checked here (peek, no write) and only
   * spent below on the branches that actually reject the attempt.
   */
  const { allowed } = peek(rateLimitKey);
  if (!allowed) {
    return NextResponse.json(
      { errors: { motDePasse: "tropDeTentatives" } },
      { status: 429 },
    );
  }

  const { email, motDePasse } = parsed.data;
  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password: motDePasse,
  });

  if (error) {
    /*
     * why (T-03-32): an invalid-credentials failure and an unknown-address
     * failure must be indistinguishable — same key, same status, same body
     * shape, no early return on the unknown-address case. Telling an
     * attacker the address exists but the password is wrong is the whole of
     * account enumeration on a sign-in form.
     */
    const isAuthServerThrottle =
      error.status === 429 ||
      error.code === "over_request_rate_limit" ||
      error.code === "over_email_send_rate_limit";

    if (isAuthServerThrottle) {
      record(rateLimitKey);
      return NextResponse.json(
        { errors: { motDePasse: "tropDeTentatives" } },
        { status: 429 },
      );
    }

    if (error.status === 400 || error.status === 401) {
      record(rateLimitKey);
      return NextResponse.json(
        { errors: { motDePasse: "identifiantsInvalides" } },
        { status: 401 },
      );
    }

    record(rateLimitKey);
    return NextResponse.json({ errors: { motDePasse: "rejetServeur" } }, { status: 502 });
  }

  // The cookie adapter has already written the session cookies onto the
  // response inside createClient() — the island navigates to /espace.
  return NextResponse.json({ ok: true }, { status: 200 });
}
