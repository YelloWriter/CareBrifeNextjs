# CareBrifeNextjs 작업 범위

- 사용자 지시: 현재 화면·문구·기능을 그대로 유지하고 Next.js로 전환한 뒤, 2026-10-16 요청에 따라 이미 있는 FAQ만 Supabase 기반 관리로 바꿉니다. FAQ 외의 새 기능·화면·UI 라이브러리는 추가하지 않습니다.
- 기준 커밋 `6b2effd`. `src/styles.css`와 `public/`은 원본으로 유지합니다. `src/App.tsx`는 FAQ 영역만 공개 조회로 바꿀 수 있고, `src/i18n.ts`는 그 FAQ 상태 문구의 영어 번역만 추가할 수 있습니다. 그 밖의 변경은 현재 사용자 요청 범위부터 확인합니다.
- App Router는 기존 브라우저 앱을 감쌉니다. `original-app.tsx`의 클라이언트 전용 로딩은 window/음성 API/현지 날짜/DOM 번역 동작을 보존하기 위한 것입니다.
- 진료 입력은 브라우저 메모리에서만 처리합니다. 증상, 복용약, 리포트, 음성, 개인정보, 건강정보는 API·DB·로그·분석으로 전송하거나 Supabase에 저장하지 않습니다.
- Supabase에는 FAQ 콘텐츠(`faqs`)와 관리용 참고자료 버킷(`faq-attachments`)만 둡니다. Admin 쓰기는 서버 전용 `SUPABASE_SECRET_KEY`를 사용하며, 그 비밀키를 `NEXT_PUBLIC_` 이름으로 노출하지 않습니다.
- 변경할 원격 저장소는 공개 `YelloWriter/CareBrifeNextjs` 하나뿐입니다. `previous-origin`의 비공개 `YelloWriter/carebrief`, Firebase Hosting `carebrief-co-kr`, `carebrief.co.kr`은 변경·배포하지 않습니다.
- 비밀값·빌드 결과·로컬 백업을 커밋하지 않습니다. 유료 서비스나 요금제 변경을 하지 않습니다.
- 타입 검사·운영 빌드와 원본 대비 화면·입력·언어·타임라인·음성 버튼·인쇄·공유 동작, 그리고 FAQ 공개 조회와 Admin CRUD를 검증합니다. 실제 마이크 성공과 브라우저 API 모의 검증을 구분하고, FAQ의 실제 Supabase 왕복과 환경 변수 없이 실패한 조회도 구분합니다.
