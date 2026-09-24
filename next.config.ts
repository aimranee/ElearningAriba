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

  // why (#18): two root layouts — (public) and (app) — leave no single
  // layout to wrap an unmatched URL's 404; src/app/global-not-found.tsx
  // renders it instead, and only exists behind this flag.
  experimental: {
    globalNotFound: true,
  },

  // Pre-launch guard, Phase 0. The site goes live at Lot 5 / Phase 5 with
  // its SEO, legal pages and RGPD; until then nothing here may be indexed.
  // A header covers every response, not only HTML, and outlives any
  // hosting-side protection setting. REMOVED AS PART OF LOT 5 GO-LIVE.
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Robots-Tag", value: "noindex, nofollow" },
        ],
      },
    ];
  },

  // why (Lot 2, #16): /programme merged into /formation#programme — a
  // permanent redirect (308) so search engines and any bookmarked link
  // transfer to the merged page instead of 404ing.
  async redirects() {
    return [
      {
        source: "/programme",
        destination: "/formation#programme",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
