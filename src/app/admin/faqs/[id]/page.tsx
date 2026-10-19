import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdminSession } from "../../../../lib/admin/session";
import { deleteFaq } from "../../../../lib/faqs/actions";
import { getAdminFaq } from "../../../../lib/faqs/queries";
import { createFaqAttachmentUrl } from "../../../../lib/faqs/storage";
import { FaqConfigError, FaqQueryError } from "../../../../lib/faqs/types";
import { formatFaqDate, isFaqId, parseFaqListQuery } from "../../../../lib/faqs/validation";
import { createAdminSupabase } from "../../../../lib/supabase/admin";
import styles from "../../admin.module.css";
import { DeleteFaqButton } from "../delete-faq-button";
import { FaqLoadError } from "../faq-state";

function one(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function FaqDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  await requireAdminSession();
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

  const listHref = buildListHref(listQuery);
  const editHref = buildEditHref(id, listQuery);
  let attachmentUrl: string | null = null;
  if (faq.attachment_path) {
    const supabase = createAdminSupabase();
    attachmentUrl = supabase ? await createFaqAttachmentUrl(supabase, faq.attachment_path) : null;
  }
  const image = faq.attachment_mime_type?.startsWith("image/") && attachmentUrl;

  return (
    <article className={styles.panel}>
      <h2>{faq.question}</h2>
      <dl className={styles.definition}>
        <dt>답변</dt>
        <dd>{faq.answer}</dd>
        <dt>공개 여부</dt>
        <dd>{faq.is_published ? "공개" : "비공개"}</dd>
        <dt>노출 순서</dt>
        <dd>{faq.sort_order}</dd>
        <dt>첨부자료</dt>
        <dd>
          {!faq.attachment_path ? (
            "첨부된 참고자료가 없습니다."
          ) : (
            <div className={styles.fileRow}>
              <span>{faq.attachment_name}</span>
              {image ? (
                // Signed URL is generated on the server for this private object.
                // eslint-disable-next-line @next/next/no-img-element
                <img className={styles.preview} src={attachmentUrl ?? undefined} alt={faq.attachment_name ?? "참고자료"} />
              ) : null}
              {attachmentUrl ? (
                <a href={attachmentUrl} target="_blank" rel="noopener noreferrer">
                  열기
                </a>
              ) : (
                <span className={styles.error}>참고자료를 열지 못했습니다.</span>
              )}
            </div>
          )}
        </dd>
        <dt>생성일</dt>
        <dd>{formatFaqDate(faq.created_at)}</dd>
        <dt>수정일</dt>
        <dd>{formatFaqDate(faq.updated_at)}</dd>
      </dl>
      <div className={styles.actions}>
        <Link className={styles.buttonGhost} href={listHref}>
          목록
        </Link>
        <Link className={styles.buttonPrimary} href={editHref}>
          수정
        </Link>
        <DeleteFaqButton action={deleteFaq.bind(null, id, listQuery)} />
      </div>
    </article>
  );
}

function buildListHref(query: { q: string; status: string; sort: string; page: number }) {
  const params = new URLSearchParams();
  if (query.q) params.set("q", query.q);
  if (query.status) params.set("status", query.status);
  if (query.sort) params.set("sort", query.sort);
  if (query.page > 1) params.set("page", String(query.page));
  const search = params.toString();
  return search ? `/admin/faqs?${search}` : "/admin/faqs";
}

function buildEditHref(id: string, query: { q: string; status: string; sort: string; page: number }) {
  const params = new URLSearchParams();
  if (query.q) params.set("q", query.q);
  if (query.status) params.set("status", query.status);
  if (query.sort) params.set("sort", query.sort);
  if (query.page > 1) params.set("page", String(query.page));
  const search = params.toString();
  return search ? `/admin/faqs/${id}/edit?${search}` : `/admin/faqs/${id}/edit`;
}
