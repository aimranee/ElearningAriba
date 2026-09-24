import { readdirSync } from "node:fs";
import { join, relative, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

import { EN_ROUTES, PENDING_EN_ROUTES, languagePair } from "./routes";

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

  it("no longer lists /formation as pending (#21)", () => {
    expect(pending).not.toContain("/formation");
  });

  it("no longer lists the landing / as pending (#22)", () => {
    expect(pending).not.toContain("/");
  });

  it("no longer lists /contact as pending (#23)", () => {
    expect(pending).not.toContain("/contact");
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

// why (#20): the switcher shows only where this finds a pair, and links to it.
describe("language pair of a URL", () => {
  it("pairs the French About page with the English one, from either side", () => {
    expect(languagePair("/a-propos")).toEqual({ fr: "/a-propos", en: "/en/about" });
    expect(languagePair("/en/about")).toEqual({ fr: "/a-propos", en: "/en/about" });
  });

  // why (#21): English URL provisional until the SEO spec (#26).
  it("pairs the French Formation page with /en/training, from either side", () => {
    expect(languagePair("/formation")).toEqual({ fr: "/formation", en: "/en/training" });
    expect(languagePair("/en/training")).toEqual({ fr: "/formation", en: "/en/training" });
  });

  // why (#22): the English landing sits at /en, the ticket's URL.
  it("pairs the French landing with /en, from either side", () => {
    expect(languagePair("/")).toEqual({ fr: "/", en: "/en" });
    expect(languagePair("/en")).toEqual({ fr: "/", en: "/en" });
  });

  // why (#23): English URL provisional until the SEO spec (#26).
  it("pairs the French Contact page with /en/contact, from either side", () => {
    expect(languagePair("/contact")).toEqual({ fr: "/contact", en: "/en/contact" });
    expect(languagePair("/en/contact")).toEqual({ fr: "/contact", en: "/en/contact" });
  });

  it("finds no pair for an app page or an unknown URL", () => {
    expect(languagePair("/connexion")).toBeNull();
    expect(languagePair("/cette-page-n-existe-pas")).toBeNull();
  });
});
