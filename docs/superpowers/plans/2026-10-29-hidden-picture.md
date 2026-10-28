# 숨은그림찾기 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development or superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 승인한 놀이 선택·목록·단일 그림 플레이를 구현하고 숨은그림 콘텐츠 30개를 추가한다.
**Architecture:** 기존 게임 ID와 저장소를 유지하며 kind=hidden으로 새 퍼즐을 구분한다. 기존 Board의 확대·이동·입력 엔진에 단일 그림 렌더링을 연결하고, 목표 목록은 별도 React 구성요소로 둔다. 콘텐츠 검사·내보내기·캐시는 새 게임의 모든 목표 이미지를 포함한다.
**Tech Stack:** 기존 React·TypeScript·Vite·IndexedDB·Cache Storage·sharp·Vitest·Playwright. 새 의존성 없음.
**Spec:** docs/design/hidden-object-20261029/brief.md, docs/HIDDEN-CONTENT.md

## Global Constraints

- 기존 틀린그림찾기 30개·기록·직접 링크 보존. 시간 제한·감점 없음.
- 숨은그림 6개 주제 × 5개, easy/medium/hard 각 10개. 7/8/10개 목표.
- 내장 image_gen으로 생성. 최종 장면·목표 이미지·정답 영역 시각 검수. 공개 배포 없음.
- 승인한 시안의 종이색·숲색·둥근 글꼴·가로 오른쪽 목표 목록 유지.

## Review Focus

- 기존 ?game 링크와 뒤로가기·앞으로가기·새로고침이 정확한 놀이 목록을 복원하는지.
- 이미 찾은 정답의 중복 터치·기록 재개·다시 풀기·힌트가 양쪽 게임에서 일관적인지.
- 목표 이미지 일부가 없을 때 오프라인 가능으로 잘못 표시하지 않는지.
- 새 콘텐츠 추가나 기존 그림 변경이 다른 게임의 진행 기록을 지우지 않는지.
- iPad 세로·휴대폰에서도 그림과 목표 목록이 잘리지 않고 조작 가능한지.

### Task 1: 콘텐츠 계약과 병렬 제작

**Files:** docs/HIDDEN-CONTENT.md, work/hidden-content/batch-30.json, content/games/hidden-*/**
**Interfaces:** metadata.kind=hidden; puzzle.original; puzzle.targets[{id,label,image,area}].
- [x] 3개 콘텐츠 에이전트가 각각 2개 주제·10개 게임을 제작·검수한다.
- [x] 실제 최종 이미지에서 정답 좌표와 목표 추출을 확정하고 검수 기록을 남긴다.

### Task 2: 데이터와 산출물

**Files:** src/types.ts, src/game.ts, src/cache.ts, scripts/content.mjs, tests/content.test.ts, tests/game.test.ts, tests/cache.test.ts
**Interfaces:** Puzzle union, gameKind(game), puzzleAnswers(puzzle), gameAssetUrls(game), catalog targetImages.
- [x] hidden 검사·내보내기·해시·누락 파일 거부·오프라인 필수 파일 검사를 테스트한다.
- [x] 기존 데이터 형식을 유지하며 새 퍼즐을 처리한다.
- [x] 관련 Vitest·타입 검사를 통과한다.

### Task 3: 화면과 탐색

**Files:** src/App.tsx, src/Board.tsx, src/HiddenTargets.tsx, src/style.css, tests/browser/hidden.spec.ts, 기존 browser specs
**Interfaces:** 선택 / ?mode=differences / ?mode=hidden / ?game=id; 기존 상세 링크의 놀이 추론.
- [x] 놀이 선택과 놀이별 목록·진행 상태·올바른 복귀 경로를 구현한다.
- [x] 단일 그림과 고정 목표 목록·찾음·힌트·완료·확대·저장·다시 풀기를 연결한다.
- [x] 기존 브라우저 테스트의 목록 진입을 새 경로에 맞추고 회귀를 검증한다.

### Task 4: 통합 검증과 문서

**Files:** docs/PRD.md, PRODUCT.md, DESIGN.md(실제 바뀐 시스템만), README.md, docs/verification/hidden-picture.json
- [x] 타입·단위·콘텐츠·빌드·브라우저 검증을 실행한다.
- [x] iPad 가로·세로와 휴대폰 캡처를 묶어 확인하고 물질적인 문제를 수정한다.
- [x] 별도 최종 리뷰를 받아 수정하고 실제 검증 범위·미확인 사항을 보고한다.

## Execution ruling

사용자가 이미 구현과 콘텐츠 서브에이전트 작업을 승인했다. 추가 계획 승인 질문 없이 실행한다. 전체 저장소가 기존부터 untracked이므로 다른 작업을 포함하는 일괄 commit은 하지 않는다.


## 2026-10-29 난이도 교정 Ruling

사용자가 v1의 쉬운 난이도와 목표 배경 노출·부자연스러운 숨김을 지적했다. 앱 구현과 30개 목표는 유지한다. 콘텐츠는 v1을 보존한 뒤 담당별 1개로 v2 기준을 검증하고 전체에 적용한다. 목표는 image_gen으로 배경 없는 cutout을 제작하며 장면 윤곽과 직접 대조한다. 단순 사각 crop을 최종 목표로 쓰지 않는다. 장면은 주변과 같은 재질의 자연 윤곽으로 숨긴다. 데이터 검사에 투명 목표 검증을 추가한다.

## Completion — 2026-10-29

30개 숨은그림·250개 목표 등록과 개선을 완료했다. 기존30개 gameplayRevision은 변하지 않았다. 단위24개, 최종 숨은 브라우저12개, UI 수정 후4개 검사와 production build의60개 산출물 검사가 통과했다. 독립 콘텐츠·코드 검수, 화면 리뷰의 수정3개 해결 판정, 기존 디자인 시스템 확장 확인을 마쳤다. 실제 iPad와 주아의 체감 난이도·공개 배포는 확인하지 않았다. 세부 근거와 시안 비교의 제한은 docs/verification/hidden-picture.json에 있다.
