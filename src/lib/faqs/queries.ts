import "server-only";
import { FAQ_PAGE_SIZE } from "./constants";
import type { FaqListQuery, FaqRecord, PublicFaq } from "./types";
import { FaqConfigError, FaqQueryError } from "./types";
import { createAdminSupabase } from "../supabase/admin";
import { createPublicSupabase } from "../supabase/public";

const faqColumns =
  "id, question, answer, sort_order, is_published, attachment_path, attachment_name, attachment_mime_type, attachment_size, created_at, updated_at";

function escapeLike(value: string) {
  return value.replace(/[\\%_]/g, "\\$&");
}

export async function listPublishedFaqs(): Promise<PublicFaq[]> {
  const supabase = createPublicSupabase();
  if (!supabase) throw new FaqConfigError();
  const { data, error } = await supabase
    .from("faqs")
    .select("id, question, answer")
    .eq("is_published", true)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });
  if (error) throw new FaqQueryError();
  return (data ?? []) as PublicFaq[];
}

export async function listAdminFaqs(query: FaqListQuery) {
  const supabase = createAdminSupabase();
  if (!supabase) throw new FaqConfigError();
  let request = supabase.from("faqs").select(faqColumns, { count: "exact" });
  if (query.q) request = request.ilike("question", `%${escapeLike(query.q)}%`);
  if (query.status === "published") request = request.eq("is_published", true);
  if (query.status === "unpublished") request = request.eq("is_published", false);
  request =
    query.sort === "updated_desc"
      ? request.order("updated_at", { ascending: false })
      : request.order("sort_order", { ascending: true }).order("created_at", { ascending: true });
  const from = (query.page - 1) * FAQ_PAGE_SIZE;
  const { data, error, count } = await request.range(from, from + FAQ_PAGE_SIZE - 1);
  if (error) throw new FaqQueryError();
  return { faqs: (data ?? []) as FaqRecord[], total: count ?? 0 };
}

export async function getAdminFaq(id: string) {
  const supabase = createAdminSupabase();
  if (!supabase) throw new FaqConfigError();
  const { data, error } = await supabase.from("faqs").select(faqColumns).eq("id", id).maybeSingle();
  if (error) throw new FaqQueryError();
  return (data as FaqRecord | null) ?? null;
}

export async function nextSortOrder() {
  const supabase = createAdminSupabase();
  if (!supabase) throw new FaqConfigError();
  const { data, error } = await supabase
    .from("faqs")
    .select("sort_order")
    .order("sort_order", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) throw new FaqQueryError();
  return (data?.sort_order ?? 0) + 1;
}
