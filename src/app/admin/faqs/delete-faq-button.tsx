"use client";

import { useActionState, useRef } from "react";
import { useFormStatus } from "react-dom";
import styles from "../admin.module.css";

function DeleteSubmit() {
  const { pending } = useFormStatus();
  return (
    <button className={styles.buttonDanger} type="submit" disabled={pending}>
      {pending ? "삭제 중..." : "삭제"}
    </button>
  );
}

export function DeleteFaqButton({
  action,
}: {
  action: (
    state: { error?: string },
    formData: FormData,
  ) => Promise<{ error?: string }>;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [state, formAction] = useActionState(action, {});
  return (
    <>
      <button
        className={styles.buttonDanger}
        type="button"
        onClick={() => dialogRef.current?.showModal()}
      >
        삭제
      </button>
      <dialog className={styles.dialog} ref={dialogRef}>
        <p>이 FAQ를 삭제하시겠습니까? 삭제한 FAQ는 복구할 수 없습니다.</p>
        {state.error ? <p className={styles.error}>{state.error}</p> : null}
        <form action={formAction}>
          <button
            className={styles.buttonGhost}
            type="button"
            onClick={() => dialogRef.current?.close()}
          >
            취소
          </button>
          <DeleteSubmit />
        </form>
      </dialog>
    </>
  );
}
