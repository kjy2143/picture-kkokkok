---
version: 1
slug: "src-app-tsx"
primary_target: "src/App.tsx"
related_targets: ["src/ModeSelection.tsx","src/HiddenTargets.tsx","src/Board.tsx","src/style.css"]
---

# 숨은그림찾기 확장 방향 계약

## Surface

Operate. 7살 주아가 iPad에서 놀이 종류와 그림을 고르고 스스로 끝까지 찾는다. 기존 틀린그림찾기 경험·그림·기록은 보존한다.

## Visual world

기존 동화책의 놀이책장. #faf6ec 종이, #254b40 숲색 글자, #f4bd50 힌트, #b84c30 강조 글자, #dc4831 정답 원. NanumSquareRound 400·700. 새 브랜드 방향을 만들지 않는다.

## FIRST VIEWPORT

첫 화면은 같은 크기의 실제 그림 선택 2개로 규칙을 보여준다. 틀린그림은 실제 한 쌍, 숨은그림은 한 장과 목표 예시다. 목록은 놀이 선택 복귀·현재 놀이 이름·주제·난이도·실제 콘텐츠 카드다. 플레이는 낮은 도구 행과 장면 한 장·고정 목표 목록이다.

## Signature interaction

숨은 모양을 누르면 장면에 정답 원, 목표에 찾음 체크를 함께 남긴다. 목표를 먼저 누를 필요가 없다. 확대·이동해도 목표 목록은 움직이지 않는다. 힌트는 영역 주변과 해당 목표를 잠깐 강조하며 자동 정답 처리하지 않는다.

## Responsive

iPad 가로는 장면 왼쪽·목표 오른쪽, 세로와 휴대폰은 장면 위·목표 아래다. 장면은 원본을 자르지 않는다. 목표 7·8·10개 모두 확인 가능하게 한다. 기존 비교 그림의 4:5·동기 확대 규칙은 유지한다.

## QUALITY BAR

아이에게 실제로 대응하는 목표 그림, 누를 수 있는 영역, 중복 처리 방지, 저장 후 복원, 모두 저장됐을 때만 오프라인 가능, 올바른 종류로 돌아가는 탐색이 기준이다. 원본·목표·판정 영역을 각각 시각 검수한다. 자동 통과를 실제 iPad·주아 검증이라고 보고하지 않는다.

## Approved references and scope change

2026-10-29 사용자가 ‘시안대로 구현 진행. 서브에이전트로 컨텐츠 30개 생성.’이라고 승인했다. docs/design/hidden-object-20261029/01-choose-game.png, 02-hidden-library.png, 03-hidden-play.png가 구조·색·문구의 기준이다. 시안의 단일 카드 목록은 후속 30개 요청에 따라 격자로 확장한다. 생성 시안의 예시 그림과 상태 값은 실제 콘텐츠와 저장 기록으로 교체한다. 컴포넌트는 의미 있는 HTML·텍스트·입력으로 구현하며 시안 이미지를 앱 화면으로 붙이지 않는다.

## User correction: hidden content

첫 제작 중 사용자가 난이도가 낮고 목표의 배경이 노출되며 숨긴 물건이 주변과 다르다고 지적했다. 숨은그림 장면은 첨부 책을 참고한 2D 잉크 윤곽·평면 색면으로 조정한다. 목표는 중성색의 투명 물건 모양으로 만들며 주변 맥락을 잘라 보여주지 않는다. 이 수정은 예시 comp의 입체 일러스트보다 우선한다. UI의 색·글꼴·탐색·고정 목표 목록은 유지한다.

## Direction contract — final review record

THESIS: 아이가 놀이를 먼저 고르고 그림 속 모양을 직접 누르는 기존 놀이책장을 확장한다. 사용자가 지정한 선택 → 목록 → 플레이를 따른다.

OWN-WORLD: 기존 종이색·숲색 글자·노란 힌트와 NanumSquareRound, 실제 게임 그림, 기존 버튼·필터 체계를 잇는다.

STORY: 첫 화면에서 두 놀이의 규칙을 그림으로 이해하고, 주제·난이도로 그림을 고른 뒤 목표 모양을 끝까지 찾는다.

FIRST VIEWPORT: 같은 크기의 놀이 선택 두 개를 둔다. 숨은 목록은 실제 30개 그림 격자다. 가로 플레이는 큰 장면과 오른쪽 목표, 세로와 휴대폰은 장면 아래 목표다.

FORM: 기존 세계와 사용자 지정 흐름의 확장이다. concept roll과 새 방향 seed는 실행하지 않았다. seed: not-run-existing-world-user-specified-flow. 이 값은 난수 seed나 과거 명령의 결과가 아니다. 승인 PNG의 구조·색·행동은 참조하되 실제30개 목록·기기 대응·사용자의 후속 콘텐츠 교정을 적용했다. 최종 검수에서 숨은 목록의 활성 난이도는 승인 PNG처럼 숲색 면과 밝은 글자로 맞춘다.

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance

## Verification limits and retrospective comparison

초기 구현 전에 build-phase state/spec·hero gate·comp-diff를 실행하지 않았다. 이 단계의 과거 종료나 점수를 소급해 만들지 않는다. 최종 검수에서 승인 PNG의 1505×1045 크기로 실제 화면을 다시 캡처하고 비교 산출물을 만든다. 이 자료는 완성본 대조이며 과거 hero gate 통과 기록이 아니다. 각 콘텐츠의 원본 생성 PNG·정확한 프롬프트·실패 시도·최종 검수 기록은 work/hidden-content/<id>/에 보존한다. UI 미리보기 두 장은 기존 실제 게임을 축소한 자료다.
