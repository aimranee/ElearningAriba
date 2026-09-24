import { describe, expect, it } from "vitest";
import { formatHours } from "./fr";

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
    const expected = `1 h 30`;

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
    expect(formatHours(2)).toBe(`2 h`);
  });

  it("renders a two-digit whole number of hours with no minutes", () => {
    expect(formatHours(10)).toBe(`10 h`);
  });
});
