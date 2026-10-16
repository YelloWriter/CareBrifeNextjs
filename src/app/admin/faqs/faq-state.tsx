import Link from "next/link";
import styles from "../admin.module.css";

export function FaqLoadError() {
  return (
    <section className={styles.panel}>
      <p className={styles.error}>FAQ를 불러오지 못했습니다.</p>
      <p className={styles.help}>서버 환경 변수를 확인한 뒤 다시 시도해주세요.</p>
      <div className={styles.actions}>
        <Link className={styles.buttonPrimary} href="/admin/faqs">
          다시 시도
        </Link>
      </div>
    </section>
  );
}

export function FaqEmptyState({ filtered }: { filtered: boolean }) {
  if (filtered) {
    return (
      <div className={styles.empty}>
        <strong>조건에 맞는 FAQ가 없습니다.</strong>
      </div>
    );
  }
  return (
    <div className={styles.empty}>
      <strong>등록된 FAQ가 없습니다.</strong>
      <p>첫 FAQ를 등록해보세요.</p>
      <div className={styles.actions}>
        <Link className={styles.buttonPrimary} href="/admin/faqs/new">
          새 FAQ
        </Link>
      </div>
    </div>
  );
}
