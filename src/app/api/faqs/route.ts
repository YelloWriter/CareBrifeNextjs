import { listPublishedFaqs } from "../../../lib/faqs/queries";
import { FaqConfigError } from "../../../lib/faqs/types";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const faqs = await listPublishedFaqs();
    return Response.json(
      { faqs },
      { headers: { "cache-control": "no-store" } },
    );
  } catch (error) {
    const status = error instanceof FaqConfigError ? 503 : 500;
    return Response.json(
      { error: "unavailable" },
      { status, headers: { "cache-control": "no-store" } },
    );
  }
}
