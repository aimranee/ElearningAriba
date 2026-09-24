import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

// Mirrors tsconfig.json's "@/*" -> "./src/*" path alias (this repo's only
// alias) so a test can import the same way application code does. Kept in
// sync by hand: Vitest does not read tsconfig "paths" itself.
export default defineConfig({
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  test: {
    environment: "node",
    include: ["src/**/*.test.ts", "src/**/*.test.tsx"],
    // Excludes beyond Vitest's own defaults (node_modules, dist, .git, …):
    // orphaned agent worktrees, and anything the end-to-end suites in
    // ariba-cqo own rather than this repo.
    exclude: [
      "node_modules/**",
      ".claude/worktrees/**",
      "e2e/**",
      "**/*.e2e.ts",
      "**/*.spec.ts",
    ],
  },
});
