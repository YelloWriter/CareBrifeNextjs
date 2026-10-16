export type FaqRecord = {
  id: string;
  question: string;
  answer: string;
  sort_order: number;
  is_published: boolean;
  attachment_path: string | null;
  attachment_name: string | null;
  attachment_mime_type: string | null;
  attachment_size: number | null;
  created_at: string;
  updated_at: string;
};

export type PublicFaq = Pick<FaqRecord, "id" | "question" | "answer">;

export type FaqListQuery = {
  q: string;
  status: "" | "published" | "unpublished";
  sort: "order" | "updated_desc";
  page: number;
};

export type FaqFormValues = {
  question: string;
  answer: string;
  sortOrder: string;
  isPublished: boolean;
};

export type FaqField = "question" | "answer" | "sortOrder" | "attachment";

export type FaqFormState = {
  error?: string;
  fieldErrors?: Partial<Record<FaqField, string>>;
  values: FaqFormValues;
};

export class FaqConfigError extends Error {
  constructor() {
    super("Supabase 환경 변수가 없습니다.");
    this.name = "FaqConfigError";
  }
}

export class FaqQueryError extends Error {
  constructor() {
    super("FAQ를 불러오지 못했습니다.");
    this.name = "FaqQueryError";
  }
}
