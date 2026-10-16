export const FAQ_BUCKET = "faq-attachments";
export const FAQ_PAGE_SIZE = 10;
export const MAX_ATTACHMENT_BYTES = 2 * 1024 * 1024;
export const SIGNED_URL_SECONDS = 300;

export const ATTACHMENT_EXTENSIONS = {
  "application/pdf": "pdf",
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
} as const;

export type AttachmentMime = keyof typeof ATTACHMENT_EXTENSIONS;

export const FAQ_MESSAGES = {
  questionRequired: "질문을 입력해주세요.",
  questionTooShort: "질문은 2자 이상 입력해주세요.",
  questionTooLong: "질문은 200자 이하로 작성해주세요.",
  answerRequired: "답변을 입력해주세요.",
  answerTooShort: "답변은 2자 이상 입력해주세요.",
  answerTooLong: "답변은 2,000자 이하로 작성해주세요.",
  sortRequired: "노출 순서를 입력해주세요.",
  sortInvalid: "노출 순서는 0 이상의 정수로 입력해주세요.",
  fileType: "지원하지 않는 파일 형식입니다.",
  fileSize: "파일은 2MB 이하만 첨부할 수 있습니다.",
  saveFailed: "저장하지 못했습니다. 잠시 후 다시 시도해주세요.",
  deleteFailed: "삭제하지 못했습니다. 잠시 후 다시 시도해주세요.",
} as const;
