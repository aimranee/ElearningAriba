import { beforeEach, describe, expect, it, vi } from "vitest";

/*
 * why (#23): the route is exercised whole — validation, anti-spam, storage,
 * both emails — with doubles only at its two system boundaries: the email
 * transport (nothing leaves the process, no address is ever mailed) and the
 * database client (the insert is recorded, not run).
 */
type Email = { to: string; subject: string; text: string };

const { sendEmail, insert, from } = vi.hoisted(() => {
  const insert = vi.fn<(row: unknown) => Promise<{ error: null }>>(async () => ({ error: null }));
  return {
    sendEmail: vi.fn<(email: Email) => Promise<void>>(async () => {}),
    insert,
    from: vi.fn<(table: string) => { insert: typeof insert }>(() => ({ insert })),
  };
});

vi.mock("server-only", () => ({}));
vi.mock("@/lib/email/resend", () => ({ sendEmail }));
vi.mock("@/lib/supabase/public", () => ({ createPublicClient: () => ({ from }) }));

import base from "@/lib/email/__fixtures__/rendu-fr-9fcbf0a.json";
import { POST } from "./route";

const TRAINER = "contact@formation-sap-ariba.fr";
const VISITOR = "jeanne.martin@example.test";

// Same values as the base fixture, so the trainer's notification must match it.
const message = {
  nom: "Jeanne Martin",
  email: VISITOR,
  telephone: "",
  profil: "consultant",
  message: "Bonjour, une question sur l'appel découverte ?",
  societe: "",
};

let ip = 0;
function post(body: Record<string, unknown>, from = `203.0.113.${++ip}`) {
  return POST(
    new Request("http://localhost/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-forwarded-for": from },
      body: JSON.stringify({ rendu: Date.now() - 10_000, ...body }),
    }),
  );
}

const sent = () => sendEmail.mock.calls.map(([email]) => email);

beforeEach(() => {
  sendEmail.mockClear();
  insert.mockClear();
  from.mockClear();
});

describe("POST /api/contact — language of the acknowledgement", () => {
  it("answers a message from the English page in English, and tells the trainer in French", async () => {
    const response = await post({ ...message, langue: "en" });
    expect(response.status).toBe(200);

    const [notification, acknowledgement] = sent();
    expect(notification).toEqual({ to: TRAINER, ...base.contactNotification });
    expect(acknowledgement.to).toBe(VISITOR);
    expect(acknowledgement.subject).toBe("Your message has been received.");
    expect(acknowledgement.text).toContain("Hello Jeanne Martin,");
    expect(acknowledgement.text).toContain("It has been passed on to the trainer.");
    expect(acknowledgement.text).not.toContain("Bonjour");
  });

  it("answers a message from the French page in French, as at base", async () => {
    await post({ ...message, langue: "fr" });
    expect(sent()).toEqual([
      { to: TRAINER, ...base.contactNotification },
      { to: VISITOR, ...base.contactAccusReception },
    ]);
  });

  it.each([
    ["missing", {}],
    ["unknown", { langue: "de" }],
    ["of the wrong type", { langue: ["en"] }],
  ])("answers in French when the language is %s", async (_case, langue) => {
    const response = await post({ ...message, ...langue });
    expect(response.status).toBe(200);
    expect(sent()).toEqual([
      { to: TRAINER, ...base.contactNotification },
      { to: VISITOR, ...base.contactAccusReception },
    ]);
  });
});

describe("POST /api/contact — storage and anti-spam as at base", () => {
  it("stores the same columns, and not the language", async () => {
    await post({ ...message, langue: "en" });
    expect(from).toHaveBeenCalledWith("contact_message");
    expect(insert).toHaveBeenCalledExactlyOnceWith({
      nom: "Jeanne Martin",
      email: VISITOR,
      telephone: null,
      profil: "consultant",
      message: "Bonjour, une question sur l'appel découverte ?",
    });
  });

  it("drops a filled honeypot silently: 200, nothing stored, nothing sent", async () => {
    const response = await post({ ...message, langue: "en", societe: "ACME" });
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ ok: true });
    expect(insert).not.toHaveBeenCalled();
    expect(sendEmail).not.toHaveBeenCalled();
  });

  it("drops a submission sent under three seconds after render", async () => {
    const response = await post({ ...message, langue: "en", rendu: Date.now() });
    expect(response.status).toBe(200);
    expect(insert).not.toHaveBeenCalled();
    expect(sendEmail).not.toHaveBeenCalled();
  });

  it("accepts five messages per address, then drops the sixth silently", async () => {
    const address = "198.51.100.7";
    for (let i = 0; i < 5; i++) await post({ ...message, langue: "en" }, address);
    expect(insert).toHaveBeenCalledTimes(5);

    const sixth = await post({ ...message, langue: "en" }, address);
    expect(sixth.status).toBe(200);
    expect(insert).toHaveBeenCalledTimes(5);
    expect(sendEmail).toHaveBeenCalledTimes(10);
  });

  it("rejects an invalid English message with the same error keys, sending nothing", async () => {
    const response = await post({ ...message, nom: "", email: "pas-un-email", langue: "en" });
    expect(response.status).toBe(422);
    expect(await response.json()).toEqual({
      errors: { nom: "nomRequis", email: "emailInvalide" },
    });
    expect(insert).not.toHaveBeenCalled();
    expect(sendEmail).not.toHaveBeenCalled();
  });
});
