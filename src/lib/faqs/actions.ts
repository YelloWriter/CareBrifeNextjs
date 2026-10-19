"use server";

import { revalidatePath } from "next/cache";
import { redirect, unstable_rethrow } from "next/navigation";
import { FAQ_MESSAGES, FAQ_PAGE_SIZE } from "./constants";
import { faqListPath, readFormValues, readValidatedAttachment, validateFaqText } from "./validation";
import type { FaqFormState } from "./types";
import { requireAdminSession } from "../admin/session";
import { createAdminSupabase } from "../supabase/admin";
import { removeFaqAttachment, uploadFaqAttachment } from "./storage";

function failure(values: FaqFormState["values"], fieldErrors?: FaqFormState["fieldErrors"], error?: string): FaqFormState {
  return { values, fieldErrors, error };
}

async function saveFaq(formData: FormData, id?: string): Promise<FaqFormState> {
  await requireAdminSession();
  const values = readFormValues(formData);
  const text = validateFaqText(values);
  if (Object.keys(text.fieldErrors).length > 0 || text.sortOrder === null) {
    return failure(values, text.fieldErrors);
  }

  const file = formData.get("attachment");
  const hasFile = file instanceof File && file.size > 0;
  let uploaded: Awaited<ReturnType<typeof readValidatedAttachment>> | null = null;
  if (hasFile) {
    uploaded = await readValidatedAttachment(file);
    if ("error" in uploaded) return failure(values, { attachment: uploaded.error });
  }

  const supabase = createAdminSupabase();
  if (!supabase) return failure(values, undefined, FAQ_MESSAGES.saveFailed);

  const faqId = id ?? crypto.randomUUID();
  let previousPath: string | null = null;
  if (id) {
    const existing = await supabase
      .from("faqs")
      .select("attachment_path")
      .eq("id", id)
      .maybeSingle();
    if (existing.error || !existing.data) return failure(values, undefined, FAQ_MESSAGES.saveFailed);
    previousPath = existing.data.attachment_path;
  }

  let newPath: string | null = null;
  if (uploaded && !("error" in uploaded)) {
    const stored = await uploadFaqAttachment(supabase, faqId, uploaded.bytes, uploaded.mime);
    if ("error" in stored) return failure(values, undefined, FAQ_MESSAGES.saveFailed);
    newPath = stored.path;
  }

  const payload = {
    question: text.question,
    answer: text.answer,
    sort_order: text.sortOrder,
    is_published: text.isPublished,
    ...(newPath && uploaded && !("error" in uploaded)
      ? {
          attachment_path: newPath,
          attachment_name: uploaded.name,
          attachment_mime_type: uploaded.mime,
          attachment_size: uploaded.size,
        }
      : {}),
  };

  const write = id
    ? await supabase.from("faqs").update(payload).eq("id", id).select("id").maybeSingle()
    : await supabase.from("faqs").insert({ id: faqId, ...payload }).select("id").maybeSingle();

  if (write.error || !write.data) {
    await removeFaqAttachment(supabase, newPath);
    return failure(values, undefined, FAQ_MESSAGES.saveFailed);
  }

  if (newPath && previousPath && previousPath !== newPath) {
    await removeFaqAttachment(supabase, previousPath);
  }

  revalidatePath("/");
  revalidatePath("/admin/faqs");
  revalidatePath(`/admin/faqs/${write.data.id}`);
  redirect(`/admin/faqs/${write.data.id}`);
}

export async function createFaq(_state: FaqFormState, formData: FormData): Promise<FaqFormState> {
  try {
    return await saveFaq(formData);
  } catch (error) {
    unstable_rethrow(error);
    return failure(readFormValues(formData), undefined, FAQ_MESSAGES.saveFailed);
  }
}

export async function updateFaq(
  id: string,
  _state: FaqFormState,
  formData: FormData,
): Promise<FaqFormState> {
  try {
    return await saveFaq(formData, id);
  } catch (error) {
    unstable_rethrow(error);
    return failure(readFormValues(formData), undefined, FAQ_MESSAGES.saveFailed);
  }
}

export async function deleteFaq(
  id: string,
  listQuery: { q: string; status: string; sort: string; page: number },
  _state: { error?: string },
  _formData: FormData,
): Promise<{ error?: string }> {
  try {
    await requireAdminSession();
    const supabase = createAdminSupabase();
    if (!supabase) return { error: FAQ_MESSAGES.deleteFailed };
    const existing = await supabase
      .from("faqs")
      .select("id, attachment_path")
      .eq("id", id)
      .maybeSingle();
    if (existing.error || !existing.data) return { error: FAQ_MESSAGES.deleteFailed };
    const removed = await supabase.from("faqs").delete().eq("id", id).select("id");
    if (removed.error || !removed.data?.length) return { error: FAQ_MESSAGES.deleteFailed };
    await removeFaqAttachment(supabase, existing.data.attachment_path);

    const filtered = supabase.from("faqs").select("id", { count: "exact", head: true });
    const counted = listQuery.q
      ? filtered.ilike("question", `%${listQuery.q.replace(/[\\%_]/g, "\\$&")}%`)
      : filtered;
    const statusQuery =
      listQuery.status === "published"
        ? counted.eq("is_published", true)
        : listQuery.status === "unpublished"
          ? counted.eq("is_published", false)
          : counted;
    const { count } = await statusQuery;
    const total = count ?? 0;
    const lastPage = Math.max(1, Math.ceil(total / FAQ_PAGE_SIZE));
    const page = Math.min(listQuery.page, lastPage);
    revalidatePath("/");
    revalidatePath("/admin/faqs");
    redirect(
      faqListPath({
        q: listQuery.q,
        status: listQuery.status,
        sort: listQuery.sort,
        page,
      }),
    );
  } catch (error) {
    unstable_rethrow(error);
    return { error: FAQ_MESSAGES.deleteFailed };
  }
}
