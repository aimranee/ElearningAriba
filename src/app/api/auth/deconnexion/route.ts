import { NextResponse, type NextRequest } from "next/server";

import { createClient } from "@/lib/supabase/server";

/*
 * why: sign-out changes state, so it must not be reachable by GET — a GET
 * sign-out is trivially triggered by a third-party image tag. POST only.
 */
export async function POST(request: NextRequest) {
  const supabase = await createClient();

  // why: a failed sign-out on an already-invalid session must still clear
  // cookies and land the learner on /connexion, not show them an error.
  await supabase.auth.signOut().catch(() => undefined);

  return NextResponse.redirect(new URL("/connexion", request.nextUrl.origin), 303);
}
