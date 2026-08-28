import "server-only";

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

import { serverEnv } from "@/lib/env/server";
import type { Database } from "@/types/database.types";

/**
 * Server-side Supabase client factory.
 *
 * Reads the validated server environment, including the service-role key —
 * which bypasses every access rule. The `server-only` import above makes
 * importing this module from a client component a build error rather than a
 * silent leak into the browser bundle, mirroring the split kept by
 * src/lib/supabase/client.ts.
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient<Database>(
    serverEnv.NEXT_PUBLIC_SUPABASE_URL,
    serverEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            for (const { name, value, options } of cookiesToSet) {
              cookieStore.set(name, value, options);
            }
          } catch {
            // Called from a Server Component with no request/response cycle
            // to write to — safe to ignore when middleware refreshes the
            // session instead. No middleware exists yet (Lot 3).
          }
        },
      },
    },
  );
}
