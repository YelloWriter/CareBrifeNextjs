"use client";

import { useActionState } from "react";
import { login } from "../../lib/admin/actions";
import styles from "./admin.module.css";

export function LoginForm() {
  const [state, action, pending] = useActionState(login, {});

  return (
    <form className={styles.panel} action={action}>
      {state.error ? <p className={styles.error}>{state.error}</p> : null}
      <div className={styles.field}>
        <label htmlFor="username">아이디</label>
        <input id="username" name="username" autoComplete="username" />
      </div>
      <div className={styles.field}>
        <label htmlFor="password">비밀번호</label>
        <input id="password" name="password" type="password" autoComplete="current-password" />
      </div>
      <div className={styles.actions}>
        <button className={styles.buttonPrimary} type="submit" disabled={pending}>
          로그인
        </button>
      </div>
    </form>
  );
}
