import { programmePdfResponse } from "@/lib/pdf/programme-pdf";

// why (#25): the English programme PDF, same builder and same cache lifetime
// as /programme.pdf. While English is off, next.config.ts answers 404 on
// /en/* before this route is reached.
export const revalidate = 3600;

export async function GET(): Promise<Response> {
  return programmePdfResponse("en");
}
