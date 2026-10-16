# 진료한장 — CareBrifeNextjs

[GitHub](https://github.com/YelloWriter/CareBrifeNextjs) · [Next.js 배포](https://carebrief-iota.vercel.app/)

현재 화면·문구·기능을 그대로 유지하고 실행 환경만 Next.js App Router로 전환한 저장소입니다. 원본 기준은 `6b2effd`입니다. 2026-10-16 요청으로, 이미 있던 자주 묻는 질문만 Supabase에서 관리합니다. 증상 입력, AI, 음성, 타임라인, 리포트, 인쇄, 공유, 베타 신청은 이전과 같습니다.

부모님과 따로 사는 자녀가 부모님의 증상, 복용약, 최근 변화와 의료진께 묻고 싶은 내용을 정리하고 **A4 한 장 리포트**로 미리 확인하는 검증용 정적 웹사이트입니다.

핵심 카피는 “부모님의 진료를 준비하는 가장 다정한 한 장, 진료한장”입니다. 이 서비스는 진단·처방 서비스가 아니라 **진료 전 정보 정리 서비스**입니다.

## 주요 기능

- 모바일 우선 랜딩페이지와 데스크톱 2단 입력·미리보기 화면
- 증상, 진료 이력, 복용약, 질문, 가져갈 자료 입력
- 같은 시기의 사건을 한 행으로 묶는 진료 타임라인
- 자연어로 길게 적은 이야기를 브라우저 내 무료 AI로 항목별 자동 정리
- AI 응답을 토큰 단위로 받아 구조화된 항목으로 채우고, AI 실행이 어려운 기기에서는 문장 기준 기본 정리로 자동 전환
- 한국어, 영어 페이지와 언어별 브라우저 음성 입력
- 빈 항목을 자동으로 제외하는 A4 한 장 리포트
- 의료진께 확인할 질문 최대 3개 표시
- 브라우저 인쇄 기능을 이용한 인쇄 및 PDF 저장
- 완성한 리포트 내용을 기기의 공유 기능이나 메일 앱으로 보내기
- 사용자 입력을 서버로 전송하거나 저장하지 않는 브라우저 상태 기반 구조

## 기술 구성

- Next.js 16 App Router
- React 19
- TypeScript
- WebLLM
- Vercel
- Supabase: FAQ 테이블 `faqs`, 비공개 버킷 `faq-attachments`

Next.js는 페이지 실행과 배포를 담당합니다. 진료 입력은 브라우저 메모리 안에서만 처리합니다. Supabase에는 FAQ 문장과 관리용 참고자료만 저장하며, 이름·연락처·증상·복용약·리포트 같은 개인정보와 건강정보는 저장하지 않습니다.

## FAQ

홈의 자주 묻는 질문은 `is_published = true`인 행만 `sort_order`, `created_at` 순으로 보여 줍니다. 기존 `faq-section` / `faq-list`와 `<details>` / `<summary>` 구조를 유지합니다. 조회에 실패해도 FAQ 영역만 안내하고, 리포트·입력·음성·베타 신청은 그대로 동작합니다.

관리 화면은 다음 주소입니다.

- `/admin/faqs`
- `/admin/faqs/new`
- `/admin/faqs/[id]`
- `/admin/faqs/[id]/edit`

목록은 질문 검색(`q`), 공개 필터(`status=published|unpublished`), 정렬(`sort=order|updated_desc`), 10개 단위 페이지(`page`)를 지원합니다. 등록·수정·삭제와 참고자료 교체는 서버에서 검증합니다. 참고자료는 PDF, JPEG, PNG, WEBP이며 2MB 이하입니다. 이 파일은 홈에 표시하지 않습니다.

Admin 화면에는 로그인 절차가 없습니다. 확인은 Vercel Preview에서 하고, 인증이나 별도의 접근 제어를 넣기 전에는 Production 관리 화면으로 쓰지 않습니다. `main`에 바로 합치지 않습니다.

환경 변수 이름만 사용합니다. 값은 GitHub, README, 코드에 적지 않습니다.

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
SUPABASE_SECRET_KEY=
```

`SUPABASE_SECRET_KEY`는 서버 전용입니다. `NEXT_PUBLIC_SUPABASE_SECRET_KEY`처럼 브라우저로 전달되는 이름은 사용하지 않습니다. 로컬에서는 `.env.local`에 넣고, Vercel에서는 같은 이름의 Environment Variables를 Preview에 넣습니다. 이름 예시만 `.env.example`에 있습니다.

공개 조회는 publishable key와 RLS를 사용합니다. 공개 역할은 게시된 FAQ를 읽기만 할 수 있습니다. 등록·수정·삭제는 서버의 secret key로 처리합니다.

## 무료 AI와 음성 입력

자연어 자동 정리는 `@mlc-ai/web-llm`과 브라우저의 WebGPU를 이용해 사용자 기기 안에서 실행됩니다. 처음 사용할 때 공개 모델 파일을 내려받아 브라우저 캐시에 보관하며, 입력 문장은 외부 LLM API로 전송하지 않습니다.

이 구조에는 API 키, 유료 계정, 결제수단, 사용량 기반 API 호출이 없습니다. 따라서 무료 호출량을 소진해 유료 구간으로 넘어가는 경로 자체가 없습니다. 모델을 내려받을 수 없거나 WebGPU를 지원하지 않는 환경에서는 문장 기준 기본 정리로 전환되며, 사용자는 아래의 수동 입력 화면에서 결과를 계속 고칠 수 있습니다.

AI 응답은 토큰 단위로 받아 JSON 스키마에 맞춰 정리합니다. WebGPU 미지원, 모델 준비 실패 또는 응답 해석 실패가 생기면 입력 문장에서 명시적으로 확인되는 표현을 기준으로 기본 항목을 먼저 채우며, 사용자가 결과를 직접 확인하고 고칠 수 있게 안내합니다.

서비스용 외부 LLM API 토큰은 정적 웹사이트 코드에 넣지 않습니다. 브라우저에 배포되는 API 토큰은 방문자에게 노출될 수 있고, 외부 무료 LLM에 증상·복용약 문장을 보내면 별도의 민감정보 처리 검토와 고지가 필요하기 때문입니다.

음성 입력은 브라우저가 제공하는 `SpeechRecognition` 또는 `webkitSpeechRecognition` 기능을 사용합니다. 진료한장 서버나 별도 음성 API로 녹음 파일을 전송하거나 저장하지 않으며 유료 API 호출도 없습니다. 다만 음성 처리 위치와 보관 정책은 사용 중인 브라우저 제공업체의 정책을 따를 수 있으므로, 민감한 건강정보를 말하기 전에 브라우저의 개인정보 처리 안내를 확인해야 합니다. 음성 인식 미지원, 권한 거부 또는 처리 오류가 발생하면 음성 기능은 즉시 멈추고 직접 입력 방식으로 돌아갑니다.

## 로컬 실행

Node.js 22 LTS 환경에서 다음 순서로 실행합니다. (최소 Node.js 20.9)

```bash
npm ci
npm run dev
```

화면에 표시되는 로컬 주소를 브라우저에서 열어 확인합니다.

언어별 페이지 경로는 다음과 같습니다.

- 한국어: `/`
- 영어: `/en`

Next.js App Router의 선택적 catch-all 경로가 기존 SPA와 같은 주소를 제공합니다. 언어 전환, `?lang=en`과 뒤로 가기는 기존 앱 로직을 그대로 사용합니다.

## 타입 확인과 빌드

```bash
npm run typecheck
npm run build
```

빌드 결과물은 `.next`에 생성됩니다. 기존 `dist`는 현재 Next.js 빌드 결과물이 아닙니다.

빌드된 결과를 로컬에서 확인하려면 다음을 실행합니다.

```bash
npm run preview
```

## Next.js 전환 범위와 배포

- `src/app/layout.tsx`: 기존 CSS와 HTML 메타데이터, `#root` 컨테이너를 연결합니다.
- `src/app/[[...path]]/page.tsx`: 기존 단일 앱과 언어별 주소를 연결합니다.
- `src/app/original-app.tsx`: 기존 앱을 브라우저에서 실행합니다. 원본이 `window`, 음성 API, 브라우저 현지 날짜를 초기화 시 사용하므로 `next/dynamic`의 `ssr: false`로 기존 동작을 보존합니다.
- 화면을 서버 렌더링하도록 재작성하거나 입력을 서버로 보내지 않습니다. AI·음성·미리보기·타임라인·공유·인쇄·언어 전환 코드는 원본 그대로입니다.
- 공개 저장소 **YelloWriter/CareBrifeNextjs**만 갱신합니다. 비공개 **YelloWriter/carebrief** 저장소는 이 작업의 대상이 아닙니다.
- Vercel 프로젝트 `carebrief`를 재사용합니다. Framework Next.js, Build `npm run build`. FAQ 확인은 Preview 배포에서 하고, Production 도메인이나 `carebrief.co.kr`은 이 작업에서 바꾸지 않습니다.
- Preview에 `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, `SUPABASE_SECRET_KEY`가 있어야 홈 FAQ와 Admin 저장이 동작합니다. Production에 예전에 있던 `SUPABASE_URL` 이름은 이 기능에서 읽지 않습니다.
- **carebrief.co.kr의 Firebase Hosting은 기존 Vite 버전을 그대로 유지합니다.** 이 저장소의 `firebase.json`, `.firebaserc`는 기존 배포 참조용이며 이번 전환에서 변경하거나 배포하지 않습니다. 남아 있는 과거 `dist`를 Firebase에 올리지 않습니다.

유료 서비스·요금제 변경은 하지 않습니다.

## 전환 검증 (2026-10-15)

- `npm run build`, `npm run typecheck` 통과.
- 원본 `6b2effd` 대비 App·CSS·번역·이미지 파일 변경 없음.
- 같은 날짜·글꼴·모션 조건에서 390/1440px 히어로와 입력 화면 비교: 모바일 2장 차이 0픽셀, 데스크톱 차이 각각 32/201픽셀(0.004% 미만). 전체 화면 문구 일치.
- 기존 CTA·입력/미리보기·타임라인 추가/삭제·언어 전환 후 입력 유지·뒤로 가기·음성 버튼 시작/종료·정리 대체 경로·인쇄/공유/메일 연결 검사 통과.
- 마이크·공유·인쇄 API는 모의 이벤트로 연결을 검사했습니다. 실제 음성 인식 품질, 기기 공유 창, 프린터/PDF 저장 성공을 뜻하지 않습니다. WebGPU 모델 다운로드·추론은 이번 전환 검사에 포함하지 않았습니다.
- 원본의 동작과 레이아웃을 보존합니다. 390px에서 원본과 전환본 모두 문서 너비 408px인 기존 가로 넘침도 임의로 수정하지 않았습니다.

재현하려면 빌드 후 별도 터미널에서 `npm run start`를 실행하고 다음을 실행합니다.

```sh
npx playwright install chromium
npm run test:smoke
# 배포 확인
TEST_BASE_URL=https://carebrief-iota.vercel.app npm run test:smoke
```

기존 Chrome을 사용할 경우 `PLAYWRIGHT_CHROMIUM_EXECUTABLE`에 실행 파일 절대 경로를 지정합니다. 검사는 가상 예시만 입력하고 원격 데이터는 저장하지 않습니다.

## 개인정보 저장 안내

- 입력한 정보는 현재 브라우저의 React 상태에서 리포트 미리보기를 만드는 동안만 사용됩니다.
- 입력값을 서버로 전송하거나 Firebase에 저장하는 코드가 없습니다.
- 자연어 AI 정리는 브라우저 안에서 실행되며 외부 LLM API에 입력값을 보내지 않습니다.
- 음성 입력은 진료한장 서버나 별도 유료 API를 사용하지 않지만, 브라우저 제공업체의 음성 처리 정책이 적용될 수 있습니다.
- 페이지를 새로고침하면 입력한 내용은 사라집니다.
- 공유하기나 메일 보내기는 사용자가 버튼을 누를 때만 기기의 공유 기능 또는 메일 앱으로 리포트 내용을 전달합니다.
- 민감한 건강정보를 입력하기 전에 실제 운영 주체의 개인정보 처리 방식을 반드시 안내해야 합니다.
- 본 서비스는 진단이나 처방을 제공하지 않습니다.

## Google Forms 링크

베타테스터 버튼은 현재 아래 Google Forms 공유 링크에 연결되어 있습니다.

```ts
const BETA_FORM_URL =
  "https://docs.google.com/forms/d/e/1FAIpQLSdv7-MYk37xpZkBIXTOJsZLTyOBeV0_8FSu5pX_eRMaf_SwUA/viewform?usp=header";
```

다른 설문으로 변경할 때는 `src/App.tsx` 상단의 `BETA_FORM_URL` 값만 새 공유 링크로 교체합니다. 버튼은 새 탭에서 Google Forms를 열며, 베타테스터 신청은 유료 가입이나 결제가 아닙니다.

## 배포 전 확인

- 반영할 GitHub 저장소가 `YelloWriter/CareBrifeNextjs`인지 확인
- `BETA_FORM_URL`의 Google Forms 링크 확인
- `npm run typecheck` 통과 확인
- `npm run build` 통과 확인
- WebGPU 지원 브라우저에서 자연어 자동 정리 확인
- 음성 입력 지원 브라우저에서 마이크 권한, 시작, 중지 흐름 확인
- 실제 모바일 화면에서 입력 → 미리보기 → 인쇄 흐름 확인
- 브라우저 인쇄 화면에서 A4 한 장 출력 확인
