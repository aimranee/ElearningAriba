import { createBrowserClient } from "@supabase/ssr";

import { clientEnv } from "@/lib/env/client";
import type { Database } from "@/types/database.types";

/**
 * Browser Supabase client factory.
 *
 * Reads only the anon key from src/lib/env/client.ts — the anon key is safe
 * to ship to the browser, unlike the service-role key, which bypasses every
 * access rule and must stay structurally unreachable from client code. That
 * split is why this file lives apart from src/lib/supabase/server.ts.
 */
export function createClient() {
  return createBrowserClient<Database>(
    clientEnv.NEXT_PUBLIC_SUPABASE_URL,
    clientEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );
}
