import "server-only";

import { createClient } from "@supabase/supabase-js";

import { serverEnv } from "@/lib/env/server";
import type { Database } from "@/types/database.types";

/**
 * Cookieless anon read client for public content.
 *
 * why: the session-aware server client reads the request's cookie jar to opt
 * a route out of static rendering, and D-38 requires the landing page and
 * every public content page stay static or ISR. Anon reads of published rows
 * carry no session, so a cookie adapter is pure cost — this resolves
 * contradiction 3 (02-CONTEXT.md). Do not reuse the session-aware client
 * here; Lot 3's authenticated path still needs it untouched.
 */
export function createPublicClient() {
  return createClient<Database, "app">(
    serverEnv.NEXT_PUBLIC_SUPABASE_URL,
    serverEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      db: {
        schema: "app",
      },
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    },
  );
}
