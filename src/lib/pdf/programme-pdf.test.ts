import { beforeEach, describe, expect, it, vi } from "vitest";

import type { ContentSection, ModuleContent, QueryResult } from "@/lib/content/queries";
import type { Locale } from "@/lib/i18n/locale";

vi.mock("server-only", () => ({}));

// The database adapter answers per locale, as the real one does after its
// field-by-field fallback (localize.ts, tested there).
const section = (locale: Locale) =>
  ({
    titre: locale === "en" ? "The programme, module by module." : "Le programme, module par module.",
    lead: locale === "en" ? "Two modules." : "Deux modules.",
  }) as ContentSection;

const modules = (locale: Locale): ModuleContent[] => [
  {
    id: "1",
    cle: "prise-en-main",
    titre: locale === "en" ? "Getting started" : "Prise en main",
    description: null,
    dureeHeures: 1.5,
    position: 1,
    objectifs: [locale === "en" ? "Navigate the tool" : "Naviguer dans l'outil"],
    contenu: [locale === "en" ? "The interface" : "L'interface"],
  },
  {
    id: "2",
    cle: "achats",
    titre: locale === "en" ? "Purchasing" : "Achats",
    description: null,
    dureeHeures: 2,
    position: 2,
    objectifs: [],
    contenu: [],
  },
];

let failRead = false;
vi.mock("@/lib/content/queries", () => ({
  getSection: async (_cle: string, locale: Locale = "fr"): Promise<QueryResult<ContentSection>> =>
    failRead ? { ok: false } : { ok: true, data: section(locale) },
  getModules: async (locale: Locale = "fr"): Promise<QueryResult<ModuleContent[]>> =>
    failRead ? { ok: false } : { ok: true, data: modules(locale) },
}));

const { buildProgrammePdf, programmePdfResponse } = await import("./programme-pdf");

// The text runs of a PDF built by writer.ts, read back from its bytes.
function runs(bytes: Uint8Array): string[] {
  const raw = Buffer.from(bytes).toString("latin1");
  return [...raw.matchAll(/\((.*)\) Tj/g)].map((m) => m[1]);
}

async function built(locale?: Locale): Promise<Uint8Array> {
  const result = await buildProgrammePdf(locale);
  if (!result.ok) throw new Error("build failed");
  return result.bytes;
}

beforeEach(() => {
  failRead = false;
});

describe("programme PDF", () => {
  it("renders the French programme by default, as before #25", async () => {
    expect(runs(await built())).toEqual([
      "Le programme, module par module.",
      "Deux modules.",
      "1. Prise en main - 1 h 30",
      "\x95 Naviguer dans l'outil",
      "\x95 L'interface",
      "",
      "2. Achats - 2 h",
      "",
      "Total : 3 h 30",
    ]);
  });

  it("renders the English programme with British durations and punctuation", async () => {
    expect(runs(await built("en"))).toEqual([
      "The programme, module by module.",
      "Two modules.",
      "1. Getting started - 1\xa0h 30\xa0min",
      "\x95 Navigate the tool",
      "\x95 The interface",
      "",
      "2. Purchasing - 2\xa0h",
      "",
      "Total: 3\xa0h 30\xa0min",
    ]);
  });

  it("declares en-GB on the English PDF only", async () => {
    expect(Buffer.from(await built("en")).toString("latin1")).toContain("/Lang (en-GB)");
    expect(Buffer.from(await built("fr")).toString("latin1")).not.toContain("/Lang");
  });
});

describe("programme PDF response", () => {
  it("serves the English PDF inline under an English file name", async () => {
    const response = await programmePdfResponse("en");
    expect(response.status).toBe(200);
    expect(response.headers.get("Content-Type")).toBe("application/pdf");
    expect(response.headers.get("Content-Disposition")).toBe(
      'inline; filename="sap-ariba-training-programme.pdf"',
    );
  });

  it("keeps the French file name and disposition", async () => {
    const response = await programmePdfResponse("fr");
    expect(response.headers.get("Content-Disposition")).toBe(
      'inline; filename="programme-formation-sap-ariba.pdf"',
    );
  });

  it("answers 503 with a message in the PDF's language when the content cannot be read", async () => {
    failRead = true;
    const english = await programmePdfResponse("en");
    expect(english.status).toBe(503);
    expect(await english.text()).toBe("The programme is not available at the moment.");
    const french = await programmePdfResponse("fr");
    expect(french.status).toBe(503);
    expect(await french.text()).toBe("Le programme n'est pas disponible pour le moment.");
  });
});
