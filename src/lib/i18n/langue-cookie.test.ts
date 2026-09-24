import { describe, expect, it } from "vitest";

import { langueCookie } from "./langue-cookie";

// why (#20): the attributes Phase B relies on when it reads the cookie on the
// server — one year, whole site, Lax, readable and writable by the client.
describe("langue cookie", () => {
  it("remembers English for a year across the whole site, sent on top-level navigations", () => {
    expect(langueCookie("en", { secure: false })).toBe(
      "langue=en; Path=/; Max-Age=31536000; SameSite=Lax",
    );
  });

  it("is Secure when the page is served over https", () => {
    expect(langueCookie("fr", { secure: true })).toBe(
      "langue=fr; Path=/; Max-Age=31536000; SameSite=Lax; Secure",
    );
  });
});
