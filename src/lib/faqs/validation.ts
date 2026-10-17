import {
  ATTACHMENT_EXTENSIONS,
  FAQ_MESSAGES,
  MAX_ATTACHMENT_BYTES,
  type AttachmentMime,
} from "./constants";
import type { FaqField, FaqFormValues } from "./types";

const textLength = (value: string) => Array.from(value).length;

export function readFormValues(formData: FormData): FaqFormValues {
  return {
    question: String(formData.get("question") ?? ""),
    answer: String(formData.get("answer") ?? ""),
    sortOrder: String(formData.get("sortOrder") ?? ""),
    isPublished: formData.get("isPublished") === "on",
  };
}

export function validateFaqText(values: FaqFormValues) {
  const fieldErrors: Partial<Record<FaqField, string>> = {};
  const question = values.question.trim();
  const answer = values.answer.trim();
  const sortRaw = values.sortOrder.trim();

  if (!question) fieldErrors.question = FAQ_MESSAGES.questionRequired;
  else if (textLength(question) < 2) fieldErrors.question = FAQ_MESSAGES.questionTooShort;
  else if (textLength(question) > 200) fieldErrors.question = FAQ_MESSAGES.questionTooLong;

  if (!answer) fieldErrors.answer = FAQ_MESSAGES.answerRequired;
  else if (textLength(answer) < 2) fieldErrors.answer = FAQ_MESSAGES.answerTooShort;
  else if (textLength(answer) > 2000) fieldErrors.answer = FAQ_MESSAGES.answerTooLong;

  let sortOrder: number | null = null;
  if (!sortRaw) fieldErrors.sortOrder = FAQ_MESSAGES.sortRequired;
  else if (!/^\d+$/.test(sortRaw)) fieldErrors.sortOrder = FAQ_MESSAGES.sortInvalid;
  else {
    sortOrder = Number(sortRaw);
    if (!Number.isSafeInteger(sortOrder) || sortOrder > 1_000_000) {
      fieldErrors.sortOrder = FAQ_MESSAGES.sortInvalid;
      sortOrder = null;
    }
  }

  return {
    fieldErrors,
    question,
    answer,
    sortOrder,
    isPublished: values.isPublished,
  };
}

export function normalizeDeclaredMime(type: string) {
  if (type === "image/jpg" || type === "image/pjpeg") return "image/jpeg";
  return type;
}

export function detectAttachmentMime(bytes: Uint8Array): AttachmentMime | null {
  if (bytes.length >= 5 && bytes[0] === 0x25 && bytes[1] === 0x50 && bytes[2] === 0x44 && bytes[3] === 0x46 && bytes[4] === 0x2d) {
    return "application/pdf";
  }
  if (bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) {
    return "image/jpeg";
  }
  if (
    bytes.length >= 8 &&
    bytes[0] === 0x89 &&
    bytes[1] === 0x50 &&
    bytes[2] === 0x4e &&
    bytes[3] === 0x47 &&
    bytes[4] === 0x0d &&
    bytes[5] === 0x0a &&
    bytes[6] === 0x1a &&
    bytes[7] === 0x0a
  ) {
    return "image/png";
  }
  if (
    bytes.length >= 12 &&
    bytes[0] === 0x52 &&
    bytes[1] === 0x49 &&
    bytes[2] === 0x46 &&
    bytes[3] === 0x46 &&
    bytes[8] === 0x57 &&
    bytes[9] === 0x45 &&
    bytes[10] === 0x42 &&
    bytes[11] === 0x50
  ) {
    return "image/webp";
  }
  return null;
}

export function validateAttachment(file: File) {
  if (file.size > MAX_ATTACHMENT_BYTES) {
    return { error: FAQ_MESSAGES.fileSize };
  }
  const declared = normalizeDeclaredMime(file.type);
  if (declared && !(declared in ATTACHMENT_EXTENSIONS)) {
    return { error: FAQ_MESSAGES.fileType };
  }
  return { declared: declared as AttachmentMime | "" };
}

export async function readValidatedAttachment(file: File) {
  const preliminary = validateAttachment(file);
  if ("error" in preliminary && preliminary.error) return { error: preliminary.error };
  const bytes = new Uint8Array(await file.arrayBuffer());
  if (bytes.byteLength > MAX_ATTACHMENT_BYTES) return { error: FAQ_MESSAGES.fileSize };
  const detected = detectAttachmentMime(bytes);
  if (!detected) return { error: FAQ_MESSAGES.fileType };
  if (preliminary.declared && preliminary.declared !== detected) {
    return { error: FAQ_MESSAGES.fileType };
  }
  return {
    bytes,
    mime: detected,
    size: bytes.byteLength,
    name: safeAttachmentName(file.name, ATTACHMENT_EXTENSIONS[detected]),
  };
}

function safeAttachmentName(name: string, extension: string) {
  const base = name.split(/[/\\]/).pop()?.trim() || `attachment.${extension}`;
  const cleaned = base.replace(/[^\w.\- ()가-힣]/g, "_").slice(0, 180);
  return cleaned || `attachment.${extension}`;
}

export function faqListPath(query: {
  q?: string;
  status?: string;
  sort?: string;
  page?: number;
}) {
  const params = new URLSearchParams();
  const q = query.q?.trim();
  if (q) params.set("q", q);
  if (query.status === "published" || query.status === "unpublished") {
    params.set("status", query.status);
  }
  if (query.sort === "updated_desc" || query.sort === "order") {
    params.set("sort", query.sort);
  }
  if (query.page && query.page > 1) params.set("page", String(query.page));
  const search = params.toString();
  return search ? `/admin/faqs?${search}` : "/admin/faqs";
}

export function parseFaqListQuery(input: {
  q?: string;
  status?: string;
  sort?: string;
  page?: string;
}) {
  const status =
    input.status === "published" || input.status === "unpublished" ? input.status : "";
  const sort = input.sort === "updated_desc" ? "updated_desc" : "order";
  const parsedPage = Number(input.page);
  const page = Number.isInteger(parsedPage) && parsedPage > 0 ? parsedPage : 1;
  return { q: input.q?.trim() ?? "", status, sort, page } as const;
}

export function formatFaqDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("ko-KR", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Seoul",
  }).format(date);
}

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function isFaqId(value: string) {
  return UUID_PATTERN.test(value);
}
