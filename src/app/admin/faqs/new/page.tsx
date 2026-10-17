import { createFaq } from "../../../../lib/faqs/actions";
import { nextSortOrder } from "../../../../lib/faqs/queries";
import { FaqConfigError, FaqQueryError } from "../../../../lib/faqs/types";
import styles from "../../admin.module.css";
import { FaqForm } from "../faq-form";

export default async function NewFaqPage() {
  let sortOrder = 1;
  let suggestionFailed = false;
  try {
    sortOrder = await nextSortOrder();
  } catch (error) {
    if (error instanceof FaqConfigError || error instanceof FaqQueryError) suggestionFailed = true;
    else throw error;
  }

  return (
    <>
      {suggestionFailed ? (
        <p className={styles.notice}>노출 순서를 불러오지 못했습니다. 1로 제안합니다.</p>
      ) : null}
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
    </>
  );
}
