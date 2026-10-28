# 오답 효과음 구현 계획

**Goal:** 오답을 누르면 짧고 부드럽게 올라가는 낮은 두 음을 재생한다.

**Architecture:** `src/App.tsx`의 기존 `playSound`에서 오답 음표·음량·시작 구간만 조절한다.

**Tech Stack:** React, TypeScript, Web Audio, Playwright.

**Spec:** `docs/superpowers/specs/2026-10-28-wrong-sound-design.md`

## 제약과 검토 대상

정답·완료 효과음과 음소거 설정을 유지한다. 브라우저별 재생 호출과 음소거 저장은 기존 Chromium·WebKit 통합 테스트로 확인한다. 실제 iPad 청감은 자동 검사로 대체하지 않는다.

## 작업

- [x] `src/App.tsx`에서 오답을 220Hz → 261.63Hz, 간격 75ms, 각 140ms, 음량 0.028, 시작 18ms로 변경한다.
- [x] `npm test`, `npm run check`, `npm run build`를 실행한다. 단위 테스트 13개와 TypeScript·게임 데이터 검사 및 빌드가 통과했다.
- [x] `npm run test:browser -- tests/browser/app.spec.ts -g '소리는 기본'`로 두 브라우저의 정답·오답 구분과 음소거 저장을 확인한다. Chromium·WebKit에서 각 1개, 총 2개 테스트가 통과했다. 로컬 서버 실행 권한으로 첫 시도가 차단되어 샌드박스 밖에서 동일 명령을 다시 실행했다.
- [x] 변경 범위와 실제 기기 청취 미검증 상태를 보고한다. 실제 iPad 청취는 미검증이다. 공개 배포는 수행하지 않았다.
