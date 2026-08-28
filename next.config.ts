import type { NextConfig } from "next";
import { resolveSiteUrl } from "./src/lib/env/site-url";

// Side-effect import: validates the environment at module load, so `dev`,
// `build` and `start` all fail fast before serving a request. Relative
// specifier required — next.config.ts loads outside the app's module graph
// and does not apply the tsconfig "paths" alias.
import "./src/lib/env/server";

const nextConfig: NextConfig = {
  // Inlines the resolved value into the client bundle for
  // src/lib/env/client.ts's static `process.env.NEXT_PUBLIC_SITE_URL`
  // access, so preview/production get the derived per-environment value
  // without depending on Vercel's "expose system env vars to the client"
  // project toggle.
  env: {
    NEXT_PUBLIC_SITE_URL: resolveSiteUrl(process.env),
  },
  turbopack: {
    root: __dirname,
  },
};

export default nextConfig;
