import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

import { serverEnv } from "@/lib/env/server";
import type { Database } from "@/types/database.types";

/**
 * Middleware-runtime Supabase client factory.
 *
 * why (D-17): the middleware runtime cannot use src/lib/supabase/server.ts —
 * that module is restricted to the Node server runtime and reads
 * `cookies()` from `next/headers`, neither of which exists here. Built
 * inline from @supabase/ssr with the anon key only, never the service-role
 * key.
 *
 * Unlike server.ts, middleware has a NextResponse to write to, so cookies
 * are written onto both the request (for the downstream render in this same
 * pass) and the response (for the browser) — no try/catch swallow.
 */
export function createMiddlewareClient(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient<Database, "app">(
    serverEnv.NEXT_PUBLIC_SUPABASE_URL,
    serverEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      db: {
        schema: "app",
      },
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          for (const { name, value } of cookiesToSet) {
            request.cookies.set(name, value);
          }
          response = NextResponse.next({ request });
          for (const { name, value, options } of cookiesToSet) {
            response.cookies.set(name, value, options);
          }
        },
      },
    },
  );

  return { supabase, response };
}
