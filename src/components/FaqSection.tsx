"use client";

import { useEffect, useState } from "react";
import type { PublicFaq } from "../lib/faqs/types";

type FaqState = "loading" | "ready" | "empty" | "error";

export function FaqSection() {
  const [state, setState] = useState<FaqState>("loading");
  const [faqs, setFaqs] = useState<PublicFaq[]>([]);

  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/faqs", { signal: controller.signal, cache: "no-store" })
      .then((response) => {
        if (!response.ok) throw new Error("faq");
        return response.json() as Promise<{ faqs?: PublicFaq[] }>;
      })
      .then((body) => {
        const next = Array.isArray(body.faqs) ? body.faqs : [];
        setFaqs(next);
        setState(next.length > 0 ? "ready" : "empty");
      })
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === "AbortError") return;
        setState("error");
      });
    return () => controller.abort();
  }, []);

  if (state === "loading") {
    return (
      <div data-faq-state="loading" className="visually-hidden">
        자주 묻는 질문을 불러오는 중
      </div>
    );
  }

  if (state === "error") {
    return (
      <div data-faq-state="error">
        <p style={{ margin: 0, color: "#687680", fontSize: 14, lineHeight: 1.7 }}>
          자주 묻는 질문을 불러오지 못했어요.
        </p>
      </div>
    );
  }

  return (
    <div data-faq-state={state}>
      {faqs.map((faq) => (
        <details key={faq.id}>
          <summary>{faq.question}</summary>
          <p>{faq.answer}</p>
        </details>
      ))}
    </div>
  );
}
