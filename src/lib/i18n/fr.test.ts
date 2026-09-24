import { describe, expect, it } from "vitest";
import { formatHours, formatMinutes, formatMoisAnnee, formatNumber } from "./fr";

/**
 * Pins formatHours (fr.ts:91) against today's rendering. The function
 * concatenates two different Unicode space characters in one string: the
 * fr-FR "short" unit formatter separates a number from "h" with a narrow
 * no-break space (U+202F, CLDR's fr hour pattern), while the hour/minutes
 * join inside formatHours itself is a plain template-literal space
 * (U+0020). A literal "1 h 30" typed straight into this file would look
 * identical to both a reader and a naive diff, so every expectation below
 * is built from explicit \uXXXX escapes and one is also asserted
 * code-point by code-point, so a change to either space reads as a visible
 * diff instead of an invisible one.
 *
 * 0.5 ("0 h 30") is deliberately not pinned: its rendering is an open
 * question with the Chief of Staff (ticket #15).
 */
describe("formatHours", () => {
  it("renders a fractional hour as hours and minutes", () => {
    const actual = formatHours(1.5);
    const expected = `1\u202Fh\u002030`;

    expect(actual).toBe(expected);
    expect([...actual].map((char) => char.codePointAt(0))).toEqual([
      0x31, // "1"
      0x202f, // NARROW NO-BREAK SPACE — from Intl's fr-FR unit formatter
      0x68, // "h"
      0x20, // SPACE — from formatHours' own template literal
      0x33, // "3"
      0x30, // "0"
    ]);
  });

  it("renders a whole number of hours with no minutes", () => {
    expect(formatHours(2)).toBe(`2\u202Fh`);
  });

  it("renders a two-digit whole number of hours with no minutes", () => {
    expect(formatHours(10)).toBe(`10\u202Fh`);
  });

  it("renders French when the locale is given explicitly", () => {
    expect(formatHours(1.5, "fr")).toBe(`1\u202Fh 30`);
  });
});

/**
 * #21 (CTO decision 2026-09-24): British English keeps the SI symbols the
 * French renders and spells the minutes \u2014 "1 h 30 min", never CLDR en-GB's
 * "1.5 hr". Number and symbol are held together by a no-break space
 * (U+00A0); the hour and minute groups are joined by a plain space (U+0020).
 */
describe("formatHours in English", () => {
  it("renders a fractional hour as hours and minutes, minutes spelled", () => {
    const actual = formatHours(1.5, "en");

    expect(actual).toBe(`1\u00A0h 30\u00A0min`);
    expect([...actual].map((char) => char.codePointAt(0))).toEqual([
      0x31, // "1"
      0xa0, // NO-BREAK SPACE
      0x68, // "h"
      0x20, // SPACE between the groups
      0x33, // "3"
      0x30, // "0"
      0xa0, // NO-BREAK SPACE
      0x6d, // "m"
      0x69, // "i"
      0x6e, // "n"
    ]);
  });

  it("renders whole hours with no minutes", () => {
    expect(formatHours(2, "en")).toBe(`2\u00A0h`);
    expect(formatHours(10, "en")).toBe(`10\u00A0h`);
  });

  it("renders less than an hour as minutes only", () => {
    expect(formatHours(0.5, "en")).toBe(`30\u00A0min`);
  });
});

describe("formatMinutes", () => {
  // why: CLDR's fr minute pattern uses U+00A0, not the U+202F of its hour
  // pattern \u2014 pinned as it renders today.
  it("renders French unchanged", () => {
    expect(formatMinutes(30)).toBe(`30\u00A0min`);
  });

  it("renders English with the SI symbol", () => {
    expect(formatMinutes(30, "en")).toBe(`30\u00A0min`);
  });
});

describe("formatNumber", () => {
  it("renders English with a point for decimals and a comma for thousands", () => {
    expect(formatNumber(1234.5, "en")).toBe("1,234.5");
  });

  it("renders French unchanged", () => {
    expect(formatNumber(1234.5)).toBe(`1\u202F234,5`);
  });
});

describe("formatMoisAnnee", () => {
  it("renders the month and year in English", () => {
    expect(formatMoisAnnee(new Date("2026-06-15"), "en")).toBe("June 2026");
  });

  it("renders French unchanged", () => {
    expect(formatMoisAnnee(new Date("2026-06-15"))).toBe("juin 2026");
  });
});
