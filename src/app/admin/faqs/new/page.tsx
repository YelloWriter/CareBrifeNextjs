import { createFaq } from "../../../../lib/faqs/actions";
import { nextSortOrder } from "../../../../lib/faqs/queries";
import { FaqConfigError, FaqQueryError } from "../../../../lib/faqs/types";
import { FaqForm } from "../faq-form";
import { FaqLoadError } from "../faq-state";

export default async function NewFaqPage() {
  let sortOrder = 1;
  try {
    sortOrder = await nextSortOrder();
  } catch (error) {
    if (error instanceof FaqConfigError || error instanceof FaqQueryError) return <FaqLoadError />;
    throw error;
  }

  return (
    <FaqForm
      action={createFaq}
      cancelHref="/admin/faqs"
      initial={{
        values: {
          question: "",
          answer: "",
          sortOrder: String(sortOrder),
          isPublished: true,
        },
      }}
    />
  );
}
