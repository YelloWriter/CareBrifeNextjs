import type { ReactNode } from "react";
import Link from "next/link";
import { logout } from "../../../lib/admin/actions";
import { requireAdminSession } from "../../../lib/admin/session";
import styles from "../admin.module.css";

export default async function FaqAdminLayout({ children }: { children: ReactNode }) {
  await requireAdminSession();

  return (
    <>
      <header className={styles.header}>
        <div>
          <p className={styles.kicker}>CAREBRIEF</p>
          <h1>FAQ 관리</h1>
        </div>
        <nav className={styles.nav}>
          <Link href="/admin/faqs">목록</Link>
          <Link href="/admin/faqs/new">새 FAQ</Link>
          <form action={logout}>
            <button className={styles.buttonGhost} type="submit">
              로그아웃
            </button>
          </form>
        </nav>
      </header>
      {children}
    </>
  );
}
