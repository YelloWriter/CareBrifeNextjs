import Link from "next/link";
import { redirect } from "next/navigation";
import { FAQ_PAGE_SIZE } from "../../../lib/faqs/constants";
import { listAdminFaqs } from "../../../lib/faqs/queries";
import { FaqConfigError, FaqQueryError } from "../../../lib/faqs/types";
import { faqListPath, formatFaqDate, parseFaqListQuery } from "../../../lib/faqs/validation";
import styles from "../admin.module.css";
import { FaqEmptyState, FaqLoadError } from "./faq-state";

function one(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function FaqListPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const raw = await searchParams;
  const query = parseFaqListQuery({
    q: one(raw.q),
    status: one(raw.status),
    sort: one(raw.sort),
    page: one(raw.page),
  });

  let result: Awaited<ReturnType<typeof listAdminFaqs>>;
  try {
    result = await listAdminFaqs(query);
  } catch (error) {
    if (error instanceof FaqConfigError || error instanceof FaqQueryError) return <FaqLoadError />;
    throw error;
  }

  const pageCount = Math.max(1, Math.ceil(result.total / FAQ_PAGE_SIZE));
  const safePage = result.total === 0 ? 1 : Math.min(query.page, pageCount);
  if (safePage !== query.page) {
    redirect(faqListPath({ ...query, page: safePage }));
  }

  const filtered = Boolean(query.q || query.status);
  const previous = faqListPath({ ...query, page: query.page - 1 });
  const next = faqListPath({ ...query, page: query.page + 1 });

  return (
    <section className={styles.panel}>
      <form className={styles.toolbar} action="/admin/faqs" method="get">
        <input type="hidden" name="page" value="1" />
        <label>
          질문 검색
          <input name="q" defaultValue={query.q} placeholder="질문 검색" />
        </label>
        <label>
          공개 여부
          <select name="status" defaultValue={query.status}>
            <option value="">전체</option>
            <option value="published">공개</option>
            <option value="unpublished">비공개</option>
          </select>
        </label>
        <label>
          정렬
          <select name="sort" defaultValue={query.sort}>
            <option value="order">노출 순서</option>
            <option value="updated_desc">최근 수정</option>
          </select>
        </label>
        <button className={styles.buttonPrimary} type="submit">
          검색
        </button>
      </form>
      <p className={styles.meta}>총 {result.total}건</p>
      {result.faqs.length === 0 ? (
        <FaqEmptyState filtered={filtered} />
      ) : (
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>질문</th>
                <th>공개</th>
                <th>순서</th>
                <th>첨부</th>
                <th>생성일</th>
                <th>수정일</th>
              </tr>
            </thead>
            <tbody>
              {result.faqs.map((faq) => (
                <tr key={faq.id}>
                  <td>
                    <Link href={detailHref(faq.id, query)}>{faq.question}</Link>
                  </td>
                  <td>{faq.is_published ? "공개" : "비공개"}</td>
                  <td>{faq.sort_order}</td>
                  <td>{faq.attachment_path ? "있음" : "없음"}</td>
                  <td>{formatFaqDate(faq.created_at)}</td>
                  <td>{formatFaqDate(faq.updated_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <div className={styles.pager}>
        <Link href={previous} aria-disabled={query.page <= 1}>
          이전
        </Link>
        <span>
          {query.page} / {pageCount}
        </span>
        <Link href={next} aria-disabled={query.page >= pageCount}>
          다음
        </Link>
      </div>
    </section>
  );
}

function detailHref(
  id: string,
  query: { q: string; status: string; sort: string; page: number },
) {
  const params = new URLSearchParams();
  if (query.q) params.set("q", query.q);
  if (query.status) params.set("status", query.status);
  if (query.sort) params.set("sort", query.sort);
  if (query.page > 1) params.set("page", String(query.page));
  const search = params.toString();
  return search ? `/admin/faqs/${id}?${search}` : `/admin/faqs/${id}`;
}
