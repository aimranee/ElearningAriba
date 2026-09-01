import { NextResponse } from "next/server";

import { serverEnv } from "@/lib/env/server";
import { createClient } from "@/lib/supabase/server";

/*
 * why: the browser navigates here directly (a next/link href, not a fetch) —
 * this file exports GET only, no POST and no other verb.
 */
export async function GET() {
  const supabase = await createClient();

  /*
   * why (T-03-04): redirectTo is built from the validated server
   * environment, never from a `Host` header and never hardcoded — this is
   * what keeps the flow working on a Vercel preview deployment too.
   */
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${serverEnv.NEXT_PUBLIC_SITE_URL}/api/auth/callback`,
    },
  });

  // why: never render or log the provider's error text — only redirect back
  // to /connexion carrying the same failure flag api/auth/callback already
  // uses, so the surface renders the existing connexion.erreurs.rejetServeur.
  if (error || !data?.url) {
    const errorRedirect = new URL("/connexion", serverEnv.NEXT_PUBLIC_SITE_URL);
    errorRedirect.searchParams.set("erreur", "session");
    return NextResponse.redirect(errorRedirect);
  }

  return NextResponse.redirect(data.url);
}
