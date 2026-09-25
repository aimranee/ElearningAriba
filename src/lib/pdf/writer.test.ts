import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import { buildPdf, layoutLines } from "./writer";

const latin1 = (bytes: Uint8Array) => Buffer.from(bytes).toString("latin1");
const pages = () => layoutLines([{ text: "Programme", size: 12, weight: "regular" }]);

// why (#25): the English programme PDF declares its language; the French one
// is built without it and must stay byte for byte as it was.
describe("buildPdf document language", () => {
  it("declares /Lang in the catalog when a language is given", () => {
    expect(latin1(buildPdf(pages(), undefined, { lang: "en-GB" }))).toContain(
      "<< /Type /Catalog /Pages 2 0 R /Lang (en-GB) >>",
    );
  });

  it("writes no /Lang, and the same bytes, when none is given", () => {
    const withoutOptions = buildPdf(pages());
    expect(latin1(withoutOptions)).not.toContain("/Lang");
    expect(latin1(withoutOptions)).toContain("<< /Type /Catalog /Pages 2 0 R >>");
    expect(buildPdf(pages(), undefined, {})).toEqual(withoutOptions);
  });
});
