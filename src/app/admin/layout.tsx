import type { Metadata } from "next";
import type { ReactNode } from "react";
import styles from "./admin.module.css";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "FAQ 관리 | 진료한장",
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: { children: ReactNode }) {
  return <div className={styles.shell}>{children}</div>;
}
