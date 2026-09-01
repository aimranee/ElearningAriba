import "server-only";

import { createClient } from "@supabase/supabase-js";

import { serverEnv } from "@/lib/env/server";
import type { Database } from "@/types/database.types";

/**
 * Service-role Supabase client factory — cookie-free, session-free, mirroring
 * the shape src/lib/supabase/public.ts already uses.
 *
 * This key bypasses every access rule, including row-level security. The
 * `server-only` import above is what makes importing this module from a
 * client component a build error rather than a silent leak into the browser
 * bundle (D-17). In Lot 3 the only sanctioned caller is
 * src/lib/documents/signed-url.ts, and only **after** the entitlement check
 * has already passed against the session-scoped client — never before. It
 * must never be used to read a learner's own row (profil, acces_support,
 * demande_suppression) directly, because that would silently discard RLS,
 * the thing CPT-08 is built on.
 */
export function createServiceClient() {
  return createClient<Database, "app">(
    serverEnv.NEXT_PUBLIC_SUPABASE_URL,
    serverEnv.SUPABASE_SERVICE_ROLE_KEY,
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
