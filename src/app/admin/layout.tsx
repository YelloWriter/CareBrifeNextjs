import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";
import styles from "./admin.module.css";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "FAQ 관리 | 진료한장",
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className={styles.shell}>
      <header className={styles.header}>
        <div>
          <p className={styles.kicker}>CAREBRIEF</p>
          <h1>FAQ 관리</h1>
        </div>
        <nav className={styles.nav}>
          <Link href="/admin/faqs">목록</Link>
          <Link href="/admin/faqs/new">새 FAQ</Link>
        </nav>
      </header>
      <p className={styles.notice}>
        이 화면에는 로그인 절차가 없습니다. Vercel Preview에서 내용을 확인하고,
        접근 제어를 추가하기 전에는 Production 관리 화면으로 사용하지 않습니다.
      </p>
      {children}
    </div>
  );
}
