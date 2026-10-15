# CareBrifeNextjs 작업 범위

- 사용자 지시: 현재 화면·문구·기능을 그대로 유지하고 Next.js로만 전환합니다. 새 기능·화면·DB·UI 라이브러리를 추가하지 않습니다.
- 기준 커밋 `6b2effd`. `src/App.tsx`, `src/styles.css`, `src/i18n.ts`, `public/`을 원본으로 유지합니다. 변경이 필요하면 현재 사용자 요청 범위부터 확인합니다.
- App Router는 기존 브라우저 앱을 감쌉니다. `original-app.tsx`의 클라이언트 전용 로딩은 window/음성 API/현지 날짜/DOM 번역 동작을 보존하기 위한 것입니다.
- 입력은 기존처럼 브라우저 메모리에서만 처리합니다. API·DB·로그·분석으로 전송하지 않습니다.
- 변경할 원격 저장소는 공개 `YelloWriter/CareBrifeNextjs` 하나뿐입니다. `previous-origin`의 비공개 `YelloWriter/carebrief`, Firebase Hosting `carebrief-co-kr`, `carebrief.co.kr`은 변경·배포하지 않습니다.
- 비밀값·빌드 결과·로컬 백업을 커밋하지 않습니다. 유료 서비스나 요금제 변경을 하지 않습니다.
- 타입 검사·운영 빌드와 원본 대비 화면·입력·언어·타임라인·음성 버튼·인쇄·공유 동작을 검증합니다. 실제 마이크 성공과 브라우저 API 모의 검증을 구분합니다.
