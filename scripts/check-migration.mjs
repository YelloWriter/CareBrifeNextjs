import assert from "node:assert/strict";
import { chromium } from "playwright";

const base = process.env.TEST_BASE_URL || "http://127.0.0.1:3000";
const browser = await chromium.launch({
  executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE || undefined,
});
const errors = [];

try {
  const context = await browser.newContext({ viewport: { width: 1440, height: 1000 }, reducedMotion: "reduce" });
  const page = await context.newPage();
  page.on("pageerror", (error) => errors.push(error.message));
  await page.addInitScript(() => {
    window.__printCalls = 0;
    window.print = () => { window.__printCalls += 1; };
    Object.defineProperty(navigator, "share", { configurable: true, value: async (data) => { window.__shared = data; } });
    Reflect.deleteProperty(Navigator.prototype, "gpu");
    window.SpeechRecognition = class {
      constructor() { window.__recognition = this; }
      start() { queueMicrotask(() => this.onstart?.()); }
      stop() { queueMicrotask(() => this.onend?.()); }
      abort() { this.stop(); }
    };
  });

  await page.goto(base);
  await page.locator("#parent-story").waitFor();
  await page.getByRole("link", { name: /진료한장 만들어보기/ }).first().click();
  await page.waitForURL("**/#create-report");
  await page.locator("#visitGoal").fill("전환 확인용 가상 예시");
  await page.locator("#mainSymptom").fill("가상의 입력 항목");
  await page.waitForFunction(() => document.querySelector(".preview-pane").textContent.includes("전환 확인용 가상 예시"));
  await page.locator("#timeline-period-1").fill("예시 시점");
  await page.locator("#timeline-detail-1").fill("첫 번째 가상 사건");
  await page.getByRole("button", { name: "시기별 사건 추가하기" }).click();
  await page.locator("#timeline-period-2").fill("예시 시점");
  await page.locator("#timeline-detail-2").fill("두 번째 가상 사건");
  await page.waitForFunction(() => document.querySelector(".preview-pane").textContent.includes("두 번째 가상 사건"));
  await page.getByRole("button", { name: "타임라인 사건 2 삭제", exact: true }).click();
  await page.waitForFunction(() => !document.querySelector(".preview-pane").textContent.includes("두 번째 가상 사건"));
  console.log("PASS same-page CTA, input/preview and timeline add/delete");

  await page.getByRole("button", { name: "영어", exact: true }).click();
  await page.waitForFunction(() => document.documentElement.lang === "en");
  assert.equal(await page.locator("#visitGoal").inputValue(), "전환 확인용 가상 예시");
  await page.goBack();
  await page.waitForFunction(() => document.documentElement.lang === "ko");
  assert.equal(await page.locator("#visitGoal").inputValue(), "전환 확인용 가상 예시");
  console.log("PASS language switch/back preserves draft");

  await page.getByRole("button", { name: "PDF로 저장하기 · 인쇄하기", exact: true }).click();
  assert.equal(await page.evaluate(() => window.__printCalls), 1);
  await page.getByRole("button", { name: "공유하기", exact: true }).click();
  await page.waitForFunction(() => window.__shared?.text.includes("전환 확인용 가상 예시"));
  assert.match(decodeURIComponent(await page.locator(".mail-button").getAttribute("href")), /전환 확인용 가상 예시/);
  console.log("PASS original print invocation, share payload and mail link (browser APIs mocked)");

  await page.getByRole("button", { name: "음성으로 입력하기", exact: true }).click();
  await page.getByRole("button", { name: "음성 입력 멈추기", exact: true }).waitFor();
  await page.evaluate(() => {
    const result = [{ transcript: "음성 버튼 확인용 예시" }];
    result.isFinal = true;
    window.__recognition.onresult({ resultIndex: 0, results: [result] });
  });
  await page.waitForFunction(() => document.querySelector("#parent-story").value.includes("음성 버튼 확인용 예시"));
  await page.getByRole("button", { name: "음성 입력 멈추기", exact: true }).click();
  await page.getByRole("button", { name: "음성으로 입력하기", exact: true }).waitFor();
  console.log("PASS microphone click-start/click-stop and transcript (recognition mocked)");

  await page.locator("#parent-story").fill("가상의 예시 문장을 정리합니다.");
  await page.getByRole("button", { name: "AI로 항목 자동 채우기", exact: true }).click();
  await page.waitForFunction(() => document.querySelector(".ai-status").textContent.includes("문장 기준으로 먼저 채웠어요"));
  console.log("PASS existing non-WebGPU organization fallback");

  for (const route of ["/en", "/?lang=en", "/en?lang=ko", "/legacy-path"]) {
    await page.goto(base + route);
    await page.locator("#parent-story").waitFor();
    const expected = route === "/en" || route === "/?lang=en" ? "en" : "ko";
    await page.waitForFunction((lang) => document.documentElement.lang === lang, expected);
  }
  for (const width of [390, 1440]) {
    await page.setViewportSize({ width, height: 844 });
    await page.goto(base);
    await page.locator("#parent-story").waitFor();
    await page.evaluate(async () => { await document.fonts.ready; await Promise.all([...document.images].map((image) => image.decode().catch(() => {}))); });
    assert.deepEqual(await page.locator("img").evaluateAll((images) => images.filter((image) => image.naturalWidth === 0).map((image) => image.src)), []);
  }
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto(base);
  await page.locator("#faq-title").waitFor();
  await page.waitForFunction(() => {
    const state = document.querySelector("[data-faq-state]")?.getAttribute("data-faq-state");
    return state === "ready" || state === "empty" || state === "error";
  });
  const faqState = await page.locator("[data-faq-state]").getAttribute("data-faq-state");
  if (faqState === "ready") {
    const first = (await page.locator(".faq-list summary").first().innerText()).replace(/\s+/g, " ").trim();
    assert.equal(first, "진료한장은 병을 진단해주는 서비스인가요?");
    console.log("PASS homepage FAQ loaded through /api/faqs");
  } else if (faqState === "empty") {
    console.log("PASS homepage FAQ area stayed empty without breaking the page");
  } else {
    console.log("PASS homepage stayed usable when the FAQ request failed");
  }
  assert.deepEqual(errors, []);
  console.log("PASS direct language/query/fallback URLs, images and no browser exceptions");
} finally {
  await browser.close();
}
