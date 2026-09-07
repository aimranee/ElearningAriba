import { NextResponse, type NextRequest } from "next/server";

import { createClient } from "@/lib/supabase/server";

/*
 * why: this is the single landing point for both the email-confirmation
 * link of CPT-01 and the Google redirect of CPT-02 — it exports GET only,
 * no POST and no other verb.
 */

const VERIFY_TYPES = ["signup", "recovery", "email_change"] as const;
type VerifyType = (typeof VERIFY_TYPES)[number];

function isVerifyType(value: string | null): value is VerifyType {
  return VERIFY_TYPES.includes(value as VerifyType);
}

/*
 * why (T-03-04): an unvalidated `next` turns the callback into an open
 * redirect that an attacker can use to harvest a freshly minted session.
 * Accepted only when it starts with a single "/" and not "//" or "/\".
 */
function resolveNextPath(next: string | null): string {
  if (next && next.startsWith("/") && !next.startsWith("//") && !next.startsWith("/\\")) {
    return next;
  }
  return "/espace";
}

export async function GET(request: NextRequest) {
  const url = request.nextUrl;
  const code = url.searchParams.get("code");
  const tokenHash = url.searchParams.get("token_hash");
  const type = url.searchParams.get("type");
  const nextPath = resolveNextPath(url.searchParams.get("next"));

  const supabase = await createClient();

  let succeeded = false;

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    succeeded = !error;
  } else if (tokenHash && isVerifyType(type)) {
    const { error } = await supabase.auth.verifyOtp({ token_hash: tokenHash, type });
    succeeded = !error;
  }

  if (succeeded) {
    return NextResponse.redirect(new URL(nextPath, url.origin));
  }

  // why: never render the auth error text, the code or the token hash —
  // only a flag the /connexion surface turns into the existing
  // connexion.erreurs.rejetServeur message.
  const errorRedirect = new URL("/connexion", url.origin);
  errorRedirect.searchParams.set("erreur", "session");
  return NextResponse.redirect(errorRedirect);
}
