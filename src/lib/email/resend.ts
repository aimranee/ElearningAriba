import "server-only";

import { z } from "zod";

import { serverEnv } from "@/lib/env/server";

const RESEND_ENDPOINT = "https://api.resend.com/emails";

/*
 * why (D-48 vs D-34): RESEND_API_KEY is optional in serverEnv so `next
 * build` stays green while the CIO provisions the key — but this transport
 * re-validates it strictly, at request time, the moment an email is
 * actually about to be sent. Boot-time-required would break every build
 * until the key exists; request-time-required still means the key is never
 * defaulted and never committed. Never log the key.
 */
const resendKeySchema = z.string().min(1);

export class EmailTransportError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "EmailTransportError";
  }
}

interface SendEmailAttachment {
  filename: string;
  content: string;
  content_type?: string;
}

interface SendEmailInput {
  to: string;
  subject: string;
  text: string;
  /** why (AGD-06): optional and spread in only when present, so the two
   * pre-existing callers (api/contact, api/rgpd/suppression) stay
   * byte-unchanged. `content` is base64 (Resend's ceiling is 40 MB per
   * email after base64); `content_type` is derived from `filename` by
   * Resend when omitted. */
  attachments?: SendEmailAttachment[];
}

/** Sends one plain-text email over fetch. No SDK — one POST does not warrant a dependency (§2.13). */
export async function sendEmail({ to, subject, text, attachments }: SendEmailInput): Promise<void> {
  const parsedKey = resendKeySchema.safeParse(serverEnv.RESEND_API_KEY);
  if (!parsedKey.success) {
    throw new EmailTransportError("RESEND_API_KEY is not configured");
  }

  const response = await fetch(RESEND_ENDPOINT, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${parsedKey.data}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: "contact@formation-sap-ariba.fr",
      to,
      subject,
      text,
      ...(attachments ? { attachments } : {}),
    }),
  });

  if (!response.ok) {
    throw new EmailTransportError(`Resend responded with ${response.status}`);
  }
}
