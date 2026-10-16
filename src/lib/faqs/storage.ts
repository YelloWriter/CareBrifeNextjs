import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import { ATTACHMENT_EXTENSIONS, FAQ_BUCKET, SIGNED_URL_SECONDS } from "./constants";
import type { AttachmentMime } from "./constants";

export async function uploadFaqAttachment(
  supabase: SupabaseClient,
  faqId: string,
  bytes: Uint8Array,
  mime: AttachmentMime,
) {
  const path = `${faqId}/${crypto.randomUUID()}.${ATTACHMENT_EXTENSIONS[mime]}`;
  const { error } = await supabase.storage.from(FAQ_BUCKET).upload(path, bytes, {
    contentType: mime,
    upsert: false,
  });
  if (error) return { error: error.message };
  return { path };
}

export async function removeFaqAttachment(supabase: SupabaseClient, path: string | null) {
  if (!path) return;
  await supabase.storage.from(FAQ_BUCKET).remove([path]);
}

export async function createFaqAttachmentUrl(supabase: SupabaseClient, path: string) {
  const { data, error } = await supabase.storage
    .from(FAQ_BUCKET)
    .createSignedUrl(path, SIGNED_URL_SECONDS);
  if (error || !data?.signedUrl) return null;
  return data.signedUrl;
}
