import { z } from "zod";
import { resolveSiteUrl } from "./site-url";

/**
 * Full server-side environment schema — mirrors .env.example exactly.
 *
 * Throws instead of defaulting: a later lot reading an undefined payment or
 * calendar credential would fail against a live third party, at the worst
 * possible moment. Failing loudly here, at boot, is always cheaper.
 *
 * NEXT_PUBLIC_SITE_URL is the one exception to "throws instead of
 * defaulting": it is resolved from Vercel's system environment first (see
 * ./site-url) and only reaches the schema unresolved when that also fails,
 * in which case validation still fails loudly, naming the variable.
 */
const serverEnvSchema = z.object({
  NEXT_PUBLIC_SITE_URL: z.url(),
  NEXT_PUBLIC_SUPABASE_URL: z.url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
  /**
   * why (D-48): boot-time-required would break `next build` until the CIO
   * provisions the key — optional here, strictly re-validated at request
   * time inside src/lib/email/resend.ts (D-34).
   */
  RESEND_API_KEY: z.string().min(1).optional(),
  /**
   * why: a bucket name, not a secret — defaulted rather than required so a
   * missing value never breaks `next build`. CPT-07's signed-URL generation
   * reads it; the hosted bucket itself is a CIO item (see
   * <hosted_dependencies> in 03-CONTEXT.md).
   */
  SUPABASE_SUPPORTS_BUCKET: z.string().min(1).default("supports"),
});

export type ServerEnv = z.infer<typeof serverEnvSchema>;

const parsed = serverEnvSchema.safeParse({
  ...process.env,
  NEXT_PUBLIC_SITE_URL: resolveSiteUrl(process.env),
});

if (!parsed.success) {
  const issues = parsed.error.issues
    .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
    .join("; ");
  throw new Error(`Invalid environment variables — ${issues}`);
}

export const serverEnv: Readonly<ServerEnv> = Object.freeze(parsed.data);
