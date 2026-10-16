import { notFound } from "next/navigation";
import { updateFaq } from "../../../../../lib/faqs/actions";
import { getAdminFaq } from "../../../../../lib/faqs/queries";
import { FaqConfigError, FaqQueryError } from "../../../../../lib/faqs/types";
import { isFaqId, parseFaqListQuery } from "../../../../../lib/faqs/validation";
import { FaqForm } from "../../faq-form";
import { FaqLoadError } from "../../faq-state";

function one(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function EditFaqPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { id } = await params;
  if (!isFaqId(id)) notFound();
  const raw = await searchParams;
  const listQuery = parseFaqListQuery({
    q: one(raw.q),
    status: one(raw.status),
    sort: one(raw.sort),
    page: one(raw.page),
  });
  let faq: Awaited<ReturnType<typeof getAdminFaq>>;
  try {
    faq = await getAdminFaq(id);
  } catch (error) {
    if (error instanceof FaqConfigError || error instanceof FaqQueryError) return <FaqLoadError />;
    throw error;
  }
  if (!faq) notFound();

  const paramsForReturn = new URLSearchParams();
  if (listQuery.q) paramsForReturn.set("q", listQuery.q);
  if (listQuery.status) paramsForReturn.set("status", listQuery.status);
  if (listQuery.sort) paramsForReturn.set("sort", listQuery.sort);
  if (listQuery.page > 1) paramsForReturn.set("page", String(listQuery.page));
  const search = paramsForReturn.toString();
  const detailHref = search ? `/admin/faqs/${id}?${search}` : `/admin/faqs/${id}`;

  return (
    <FaqForm
      action={updateFaq.bind(null, id)}
      cancelHref={detailHref}
      existingFileName={faq.attachment_name}
      initial={{
        values: {
          question: faq.question,
          answer: faq.answer,
          sortOrder: String(faq.sort_order),
          isPublished: faq.is_published,
        },
      }}
    />
  );
}
