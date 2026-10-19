import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { hasAdminSession } from "../../lib/admin/session";
import styles from "./admin.module.css";
import { LoginForm } from "./login-form";

export const metadata: Metadata = {
  title: "관리자 로그인 | 진료한장",
};

export default async function AdminIndexPage() {
  if (await hasAdminSession()) redirect("/admin/faqs");

  return (
    <>
      <header className={styles.header}>
        <div>
          <p className={styles.kicker}>CAREBRIEF</p>
          <h1>관리자 로그인</h1>
        </div>
      </header>
      <LoginForm />
    </>
  );
}
