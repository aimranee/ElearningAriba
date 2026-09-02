import { NextResponse, type NextRequest } from "next/server";

import { createMiddlewareClient } from "@/lib/supabase/middleware";

export default async function middleware(request: NextRequest) {
  const { supabase, response } = createMiddlewareClient(request);

  // why (T-03-03): getSession() returns whatever is in the cookie without
  // contacting the auth server, so a forged or stale cookie would be
  // trusted. getUser() validates the token against the auth server.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.redirect(new URL("/connexion", request.url));
  }

  return response;
}

// why (D-15/D-16): a positive matcher is the only shape that cannot
// accidentally opt a public route into dynamic rendering — a negative
// matcher would silently make the fourteen static routes dynamic and
// regress Lot 2's recette criterion. /api/auth/* is intentionally excluded:
// those handlers write their own cookies through src/lib/supabase/server.ts.
export const config = {
  matcher: ["/espace", "/espace/:path*", "/admin", "/admin/:path*"],
};
