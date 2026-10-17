"use client";

import { startTransition, useActionState, useEffect, useState } from "react";
import styles from "../admin.module.css";
import type { FaqFormState, FaqFormValues } from "../../../lib/faqs/types";

export function FaqForm({
  action,
  initial,
  cancelHref,
  existingFileName,
}: {
  action: (state: FaqFormState, formData: FormData) => Promise<FaqFormState>;
  initial: FaqFormState;
  cancelHref: string;
  existingFileName?: string | null;
}) {
  const [state, formAction, pending] = useActionState(action, initial);
  const [values, setValues] = useState<FaqFormValues>(initial.values);

  useEffect(() => {
    setValues(state.values);
  }, [state]);

  return (
    <form
      className={styles.panel}
      onSubmit={(event) => {
        event.preventDefault();
        const data = new FormData(event.currentTarget);
        startTransition(() => {
          formAction(data);
        });
      }}
    >
      {state.error ? <p className={styles.error}>{state.error}</p> : null}
      <div className={styles.field}>
        <label htmlFor="question">질문</label>
        <input
          id="question"
          name="question"
          value={values.question}
          aria-invalid={Boolean(state.fieldErrors?.question)}
          onChange={(event) => setValues((current) => ({ ...current, question: event.target.value }))}
        />
        {state.fieldErrors?.question ? (
          <span className={styles.error}>{state.fieldErrors.question}</span>
        ) : null}
      </div>
      <div className={styles.field}>
        <label htmlFor="answer">답변</label>
        <textarea
          id="answer"
          name="answer"
          value={values.answer}
          aria-invalid={Boolean(state.fieldErrors?.answer)}
          onChange={(event) => setValues((current) => ({ ...current, answer: event.target.value }))}
        />
        {state.fieldErrors?.answer ? (
          <span className={styles.error}>{state.fieldErrors.answer}</span>
        ) : null}
      </div>
      <div className={styles.field}>
        <label htmlFor="sortOrder">노출 순서</label>
        <input
          id="sortOrder"
          name="sortOrder"
          inputMode="numeric"
          value={values.sortOrder}
          aria-invalid={Boolean(state.fieldErrors?.sortOrder)}
          onChange={(event) => setValues((current) => ({ ...current, sortOrder: event.target.value }))}
        />
        {state.fieldErrors?.sortOrder ? (
          <span className={styles.error}>{state.fieldErrors.sortOrder}</span>
        ) : null}
      </div>
      <label className={styles.check}>
        <input
          type="checkbox"
          name="isPublished"
          checked={values.isPublished}
          onChange={(event) =>
            setValues((current) => ({ ...current, isPublished: event.target.checked }))
          }
        />
        공개
      </label>
      <div className={styles.field}>
        <label htmlFor="attachment">관리용 참고자료</label>
        <input
          id="attachment"
          name="attachment"
          type="file"
          accept="application/pdf,image/jpeg,image/png,image/webp"
          disabled={pending}
        />
        <p className={styles.help}>
          홈페이지에는 표시되지 않습니다. PDF, JPEG, PNG, WEBP 형식이며 2MB 이하만 첨부할 수 있습니다.
          {existingFileName ? ` 현재 파일: ${existingFileName}` : ""}
        </p>
        {state.fieldErrors?.attachment ? (
          <span className={styles.error}>{state.fieldErrors.attachment}</span>
        ) : null}
      </div>
      <div className={styles.actions}>
        <button className={styles.buttonPrimary} type="submit" disabled={pending}>
          {pending ? "저장 중..." : "저장"}
        </button>
        <a className={styles.buttonGhost} href={cancelHref} aria-disabled={pending}>
          취소
        </a>
      </div>
    </form>
  );
}
