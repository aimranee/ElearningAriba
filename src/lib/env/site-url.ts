/**
 * Resolution order: an explicit value always wins; otherwise derive it from
 * Vercel's system environment variables, mirroring Next.js's own metadata
 * URL resolver (`packages/next/src/lib/metadata/resolvers/resolve-url.ts`);
 * otherwise the local development default.
 *
 * All Vercel hostnames are hostname-only, with no protocol — `https://` is
 * prepended here, matching Next.js's own resolver.
 */
export function resolveSiteUrl(env: NodeJS.ProcessEnv): string {
  if (env.NEXT_PUBLIC_SITE_URL) {
    return env.NEXT_PUBLIC_SITE_URL;
  }

  if (env.VERCEL_ENV === "production" && env.VERCEL_PROJECT_PRODUCTION_URL) {
    return `https://${env.VERCEL_PROJECT_PRODUCTION_URL}`;
  }

  const previewHost = env.VERCEL_BRANCH_URL || env.VERCEL_URL;
  if (env.VERCEL_ENV && previewHost) {
    return `https://${previewHost}`;
  }

  return "http://localhost:3000";
}
