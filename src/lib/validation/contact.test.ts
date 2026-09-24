import { describe, expect, it } from "vitest";

import { contactSchema } from "./contact";

const valid = {
  nom: "Jeanne Martin",
  email: "jeanne.martin@example.test",
  telephone: "",
  profil: "consultant",
  message: "Une question.",
  societe: "",
  rendu: 1,
};

// why (#23): the form sends the page's language; the endpoint accepts only
// the known ones and reads anything else as French, without rejecting the
// message.
describe("language of a contact request", () => {
  it.each([
    ["fr", "fr"],
    ["en", "en"],
  ])("keeps %s", (sent, read) => {
    const parsed = contactSchema.safeParse({ ...valid, langue: sent });
    expect(parsed.success && parsed.data.langue).toBe(read);
  });

  it.each([
    ["missing", undefined],
    ["empty", ""],
    ["unknown", "de"],
    ["upper case", "EN"],
    ["a number", 1],
    ["an object", { langue: "en" }],
    ["null", null],
  ])("reads %s as French, and still accepts the message", (_case, sent) => {
    const body = sent === undefined ? valid : { ...valid, langue: sent };
    const parsed = contactSchema.safeParse(body);
    expect(parsed.success).toBe(true);
    expect(parsed.success && parsed.data.langue).toBe("fr");
  });

  it("does not turn an invalid message valid (control)", () => {
    const parsed = contactSchema.safeParse({ ...valid, nom: "", langue: "en" });
    expect(parsed.success).toBe(false);
  });
});
