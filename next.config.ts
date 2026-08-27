import type { NextConfig } from "next";

// Side-effect import: validates the environment at module load, so `dev`,
// `build` and `start` all fail fast before serving a request. Relative
// specifier required — next.config.ts loads outside the app's module graph
// and does not apply the tsconfig "paths" alias.
import "./src/lib/env/server";

const nextConfig: NextConfig = {
  turbopack: {
    root: __dirname,
  },
};

export default nextConfig;
