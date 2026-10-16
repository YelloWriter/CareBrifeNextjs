import Link from "next/link";
import styles from "../../admin.module.css";

export default function FaqNotFound() {
  return (
    <section className={styles.panel}>
      <h2>FAQ를 찾을 수 없습니다.</h2>
      <div className={styles.actions}>
        <Link className={styles.buttonPrimary} href="/admin/faqs">
          목록
        </Link>
      </div>
    </section>
  );
}
