import { readdirSync } from "node:fs";
import { join, relative, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

import { EN_ROUTES, PENDING_EN_ROUTES } from "./routes";

const APP_DIR = fileURLToPath(new URL("../../app", import.meta.url));
const PAGE_FILE = /^page\.(tsx|ts|jsx|js|mdx)$/;

/*
 * why (#17, I18N-03): the French route list is read from the filesystem, not
 * copied by hand, so a new French public page cannot slip past this test.
 * Route groups "(x)" do not appear in the URL; private folders "_x" are not
 * routes.
 */
function routesUnder(groupDir: string): string[] {
  const root = join(APP_DIR, groupDir);
  const routes: string[] = [];
  const walk = (dir: string) => {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      if (entry.isDirectory()) {
        if (!entry.name.startsWith("_")) walk(join(dir, entry.name));
      } else if (PAGE_FILE.test(entry.name)) {
        const segments = relative(root, dir)
          .split(sep)
          .filter((segment) => segment !== "" && !/^\(.*\)$/.test(segment));
        routes.push(`/${segments.join("/")}`);
      }
    }
  };
  walk(root);
  return routes.sort();
}

const frenchRoutes = routesUnder("(public)");
const englishRoutes = routesUnder("(public-en)");
const translated: string[] = Object.keys(EN_ROUTES);
const pending: readonly string[] = PENDING_EN_ROUTES;

describe("FR↔EN route parity", () => {
  it("finds the French public pages on disk (positive control)", () => {
    expect(frenchRoutes).toContain("/a-propos");
    expect(frenchRoutes).toContain("/");
  });

  it("gives every French public route an English copy or a place on the pending list", () => {
    const orphans = frenchRoutes.filter(
      (route) => !translated.includes(route) && !pending.includes(route),
    );
    expect(orphans).toEqual([]);
  });

  it("keeps the pending list to French routes that exist and are not yet translated", () => {
    const stale = pending.filter(
      (route) => !frenchRoutes.includes(route) || translated.includes(route),
    );
    expect(stale).toEqual([]);
  });

  it("maps only existing French routes to English pages that exist", () => {
    for (const [french, english] of Object.entries(EN_ROUTES)) {
      expect(frenchRoutes).toContain(french);
      expect(englishRoutes).toContain(english);
    }
  });

  it("has no English page outside the map", () => {
    expect(englishRoutes).toEqual(Object.values(EN_ROUTES).sort());
  });
});
