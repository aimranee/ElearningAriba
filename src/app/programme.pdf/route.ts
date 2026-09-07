import { buildProgrammePdf } from "@/lib/pdf/programme-pdf";

/*
 * why (D-38/D-39): cached rather than dynamic per request — the PDF only
 * needs to change when a content row changes, not on every hit, and an
 * uncached route on every visitor would cost against the Lighthouse/GOL-02
 * budget for no benefit.
 */
export const revalidate = 3600;

export async function GET(): Promise<Response> {
  const result = await buildProgrammePdf();

  if (!result.ok) {
    return new Response("Le programme n'est pas disponible pour le moment.", {
      status: 503,
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  }

  // why: TS's DOM lib types Response's BodyInit against Uint8Array<ArrayBuffer>,
  // narrower than the Uint8Array<ArrayBufferLike> buildPdf returns — copy into
  // a plain-ArrayBuffer-backed view rather than widen the writer's return type.
  const body = new Uint8Array(result.bytes);

  return new Response(body, {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": 'inline; filename="programme-formation-sap-ariba.pdf"',
    },
  });
}
