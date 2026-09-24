import { describe, expect, it } from "vitest";

import { findEnglishTwin, type MockEntry } from "./mock-english-twin";

function entry(overrides: Partial<MockEntry> = {}): MockEntry {
  return {
    file: "a-propos.json",
    key: "titre",
    blocks: "CADR-03",
    awaiting: "Cadrage_Formation_SAP_Ariba_Questions_Client.docx",
    ...overrides,
  };
}

describe("findEnglishTwin", () => {
  it("resolves the same key from the English twin bundle", () => {
    const result = findEnglishTwin(entry(), {
      titre: "Behind this course, a trainer.",
    });
    expect(result).toBe("Behind this course, a trainer.");
  });

  it("resolves a dotted path into a nested object", () => {
    const result = findEnglishTwin(entry({ file: "common.json", key: "footer.baseline" }), {
      footer: { baseline: "Live SAP Ariba training." },
    });
    expect(result).toBe("Live SAP Ariba training.");
  });

  it("resolves a numeric segment as an array index", () => {
    const result = findEnglishTwin(entry({ file: "common.json", key: "hero.chips.1" }), {
      hero: { chips: ["No prerequisites", "Certified expert", "Hands-on"] },
    });
    expect(result).toBe("Certified expert");
  });

  it("returns undefined, not an error, when the English bundle does not exist yet", () => {
    const result = findEnglishTwin(entry({ file: "landing.json", key: "hero.titre" }), undefined);
    expect(result).toBeUndefined();
  });

  it("returns undefined when the English bundle exists but lacks the key", () => {
    const result = findEnglishTwin(entry({ key: "manquant" }), {
      titre: "present, but not the requested key",
    });
    expect(result).toBeUndefined();
  });

  it("returns undefined when an intermediate segment of the path is missing", () => {
    const result = findEnglishTwin(entry({ file: "common.json", key: "footer.baseline" }), {
      nav: { programme: "Programme" },
    });
    expect(result).toBeUndefined();
  });
});
