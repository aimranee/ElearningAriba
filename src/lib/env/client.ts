import { z } from "zod";

/**
 * Browser-safe environment — the NEXT_PUBLIC_ subset only.
 *
 * Each process.env access below uses its full literal name: Next.js inlines
 * client-side environment variables only when the access is statically
 * analysable — a dynamic lookup returns undefined in the browser.
 *
 * NEXT_PUBLIC_SITE_URL specifically is inlined via next.config.ts's `env`
 * field, not a real environment variable on Vercel — see
 * src/lib/env/site-url.ts for the per-environment resolution.
 *
 * This module must never import src/lib/env/server.ts and must never
 * reference the server-only, secret Supabase key.
 */
const clientEnvSchema = z.object({
  NEXT_PUBLIC_SITE_URL: z.url(),
  NEXT_PUBLIC_SUPABASE_URL: z.url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
});

export type ClientEnv = z.infer<typeof clientEnvSchema>;

const parsed = clientEnvSchema.safeParse({
  NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
});

if (!parsed.success) {
  const issues = parsed.error.issues
    .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
    .join("; ");
  throw new Error(`Invalid client environment variables — ${issues}`);
}

export const clientEnv: Readonly<ClientEnv> = Object.freeze(parsed.data);
