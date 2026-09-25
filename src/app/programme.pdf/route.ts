import { programmePdfResponse } from "@/lib/pdf/programme-pdf";

/*
 * why (D-38/D-39): cached rather than dynamic per request — the PDF only
 * needs to change when a content row changes, not on every hit, and an
 * uncached route on every visitor would cost against the Lighthouse/GOL-02
 * budget for no benefit.
 */
export const revalidate = 3600;

export async function GET(): Promise<Response> {
  return programmePdfResponse("fr");
}
