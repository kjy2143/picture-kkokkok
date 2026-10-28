---
name: "그림콕콕"
description: "따뜻한 종이 위에서 내 속도로 그림을 찾는 놀이책장"
colors:
  ink: "#254b40"
  muted: "#586b5c"
  paper: "#faf6ec"
  yellow: "#f4bd50"
  coral: "#da674a"
  line: "#dddccf"
  accent-text: "#b84c30"
  surface: "#fffdf7"
  on-ink: "#fffaf0"
  control: "#eee9dd"
  selected-control: "#fffdf8"
  ink-hover: "#163a30"
  easy-bg: "#fff7df"
  easy-text: "#644400"
  medium-bg: "#e4efdd"
  medium-text: "#31562c"
  hard-bg: "#ffe4dc"
  hard-text: "#843b28"
  found: "#447356"
  answer: "#dc4831"
  hint: "#ffd447"
  white: "#fff"
typography:
  display:
    fontFamily: "NanumSquareRound, 'Apple SD Gothic Neo', sans-serif"
    fontSize: "32px"
    fontWeight: 700
    lineHeight: 1.35
    letterSpacing: "-0.03em"
  headline:
    fontFamily: "NanumSquareRound, 'Apple SD Gothic Neo', sans-serif"
    fontSize: "24px"
    fontWeight: 700
  title:
    fontFamily: "NanumSquareRound, 'Apple SD Gothic Neo', sans-serif"
    fontSize: "21px"
    fontWeight: 700
  body:
    fontFamily: "NanumSquareRound, 'Apple SD Gothic Neo', sans-serif"
    fontSize: "18px"
    fontWeight: 400
    lineHeight: 1.5
  label:
    fontFamily: "NanumSquareRound, 'Apple SD Gothic Neo', sans-serif"
    fontSize: "14px"
    fontWeight: 400
    lineHeight: 1.5
  completion:
    fontFamily: "NanumSquareRound, 'Apple SD Gothic Neo', sans-serif"
    fontSize: "32px"
    fontWeight: 700
  play-title:
    fontFamily: "NanumSquareRound, 'Apple SD Gothic Neo', sans-serif"
    fontSize: "20px"
    fontWeight: 700
    lineHeight: 1.35
rounded:
  badge: "9px"
  toolbar: "10px"
  control: "12px"
  surface: "16px"
  pill: "24px"
  circle: "50%"
spacing:
  small: "8px"
  inline: "12px"
  medium: "16px"
  section: "20px"
  grid: "24px"
  dialog: "28px"
components:
  button-primary:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.on-ink}"
    rounded: "{rounded.control}"
    padding: "12px 22px"
    height: "48px"
  button-primary-hover:
    backgroundColor: "{colors.ink-hover}"
  button-secondary:
    backgroundColor: "{colors.control}"
    textColor: "{colors.ink}"
    rounded: "{rounded.control}"
    padding: "12px 22px"
    height: "48px"
  button-danger:
    backgroundColor: "#a43f29"
    textColor: "{colors.white}"
    rounded: "{rounded.control}"
    padding: "12px 22px"
    height: "48px"
  button-icon:
    rounded: "{rounded.circle}"
    width: "44px"
    height: "44px"
    textColor: "{colors.ink}"
  button-play:
    backgroundColor: "{colors.control}"
    textColor: "{colors.ink}"
    rounded: "{rounded.toolbar}"
    padding: "10px 12px"
    height: "48px"
  button-play-hint:
    backgroundColor: "{colors.yellow}"
    textColor: "#513d06"
    rounded: "{rounded.toolbar}"
    padding: "10px 12px"
    height: "48px"
  button-play-icon:
    backgroundColor: "{colors.control}"
    textColor: "{colors.ink}"
    rounded: "{rounded.toolbar}"
    width: "48px"
    height: "48px"
  chip-theme:
    textColor: "{colors.ink}"
    rounded: "{rounded.pill}"
    padding: "8px 22px"
    height: "46px"
  chip-theme-selected:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.on-ink}"
  game-card:
    backgroundColor: "{colors.surface}"
    rounded: "{rounded.surface}"
    padding: "0"
  board-frame:
    backgroundColor: "{colors.control}"
    rounded: "{rounded.control}"
  dialog:
    backgroundColor: "{colors.on-ink}"
    rounded: "{rounded.surface}"
    padding: "28px"
    width: "460px"
---

# Design System: 그림콕콕

## Overview

**Creative North Star: "동화책의 놀이책장"**

따뜻한 종이 위에 선명한 그림을 올리는 놀이책장이다. 짙은 숲색 글자와 둥근 한국어 글꼴이 안내를 맡는다. 노란 도구와 주황색 정답 표시는 그림을 관찰하는 행동을 드러낸다.

큰 이미지와 여유 있는 간격이 화면의 중심이다. 부드러운 모서리와 얕은 그림자로 카드와 대화상자를 구분한다. 이 문서는 src/style.css, src/App.tsx, src/Board.tsx의 현재 로컬 구현과 .impeccable/review의 브라우저 에뮬레이션 스크린샷을 기록한다. 색은 기존 구현 판단이다. 2026-10-14에 사용자가 NanumSquareRound 적용, 플레이 헤더 축소, 4:5 세로 시범 게임 제작을 승인했다. 콘텐츠 승인과 공개는 별도다.

플레이는 넓은 가로 화면의 64px 도구 행과 원본 비율을 보존한 비교 그림을 사용한다. 48px 제어와 접힌 도움말이 그림에 남는 공간을 확보한다. 비교 그림은 남은 100dvh 높이에 맞추고 실제 그림 가장자리 사이 간격을 16px로 유지한다. 현재 모든 게임의 4:5 그림에 같은 비교 규칙을 적용한다.

**Key Characteristics:**

- 선명한 그림과 따뜻한 종이색
- 숲색 글자와 자체 호스팅 한국어 글꼴
- 둥근 제어와 얕은 그림자
- 양쪽 그림에 함께 나타나는 정답·힌트 표시

## Colors

종이와 숲을 바탕으로 노란 도구, 따뜻한 주황색 표시, 낮은 채도의 보조 면을 사용한다. 정확한 값은 frontmatter가 기준이다. Sidecar의 8단계 tonalRamp는 패널 미리보기를 위한 OKLCH 계산값이며 구현에 없는 새 색 척도를 정규화하지 않는다.

### Primary

- **숲색 잉크 (ink):** 기본 글자, 선택한 주제, 주요 행동, 카드 행동에 사용한다. 주요 버튼 호버는 ink-hover로 짙어진다.
- **햇살 노랑 (yellow):** 로고 배경, 힌트 버튼, 완료 체크 바탕, 작은 그림 장식에 사용한다.

### Secondary

- **따뜻한 주황 (coral):** 초점 외곽선과 작은 장식에 사용한다. 읽는 강조 글자는 더 짙은 accent-text를 쓴다.
- **정답 주황 (answer) / 힌트 노랑 (hint):** 이미지 위의 실선 정답 원과 점선 주변 힌트를 구분한다.
- **난이도 쌍:** easy-bg/easy-text, medium-bg/medium-text, hard-bg/hard-text는 쉬움·보통·어려움 배지의 면과 글자다. 텍스트를 함께 표시한다.
- **찾음 초록 (found):** 완료한 진행 원의 면과 테두리다. 체크는 white다.

### Neutral

- **따뜻한 종이 (paper):** 화면 전체 바탕.
- **밝은 카드 (surface):** 게임 카드 바탕.
- **밝은 크림 (on-ink):** 주요 버튼의 글자와 대화상자 바탕.
- **보조 잉크 (muted):** 설명과 상태 안내.
- **종이 경계 (line):** 헤더, 설정 구획, 주제와 아이콘 버튼의 테두리.
- **보조 면 (control) / 선택 면 (selected-control):** 보조 버튼·난이도 제어의 바탕과 선택한 난이도.

### Named Rules

**The Tool and Answer Rule.** 노란색은 힌트와 놀이 도구에, 주황색 원은 찾은 정답에 쓴다. 찾은 진행 상태는 숲색 체크로 구분한다.

## Typography

**Display Font:** NanumSquareRound. Apple SD Gothic Neo, sans-serif를 대체 글꼴로 둔다.
**Body Font:** 같은 NanumSquareRound. src/assets/fonts/NanumSquareRoundR.woff2와 NanumSquareRoundB.woff2를 @font-face로 자체 호스팅하며 각각 400과 700을 제공한다. 두 파일 모두 font-display: swap을 사용한다.

**Character:** 둥글고 열린 한국어 글자 형태를 일관되게 쓴다. 별도 영문 표시체나 고정폭 글꼴은 없다. 루트의 기본 크기는 16px, 줄높이는 1.5다. 구현은 font-synthesis: none을 사용하며 제목과 행동의 700은 실제 굵은 글꼴 파일로 표시한다.

### Hierarchy

- **Display:** 홈 놀이 안내. frontmatter의 display를 사용하며 540px 이하에서는 크기가 34px이다.
- **Headline:** 그림 목록 제목. 넓은 화면 24px, 540px 이하 22px. 설정 제목은 27px이다.
- **Title:** 카드 제목 21px/700. 게임 제목은 play-title의 20px/700, 줄높이 1.35이며 540px 이하 18px이다. 한 줄에서 넘치는 제목은 말줄임하며 전체 제목은 title 속성에 보존한다.
- **Body:** 홈 안내 18px, 540px 이하 15px. 설정 구획 제목과 효과음 행도 18px이다.
- **Label:** 카드 주제·진행과 난이도 배지는 13px. 플레이 진행 개수와 행동은 18px/700이며 540px 이하 행동은 16px이다. 접힌 도움말의 본문은 16px/1.7이다. 설정 설명은 14px/1.8이다.
- **Completion:** 완료 제목은 32px/700. 안내문 줄높이는 1.8이다.

### Named Rules

**The Quiet Supporting Type Rule.** 제목은 크게, 주제와 진행 안내는 작게 둔다. 색과 아이콘만으로 상태를 전달하지 않고 텍스트와 체크를 함께 쓴다.

## Layout

홈은 가운데 정렬한 최대 1240px 상자이며 기본 여백은 24px 40px 20px이다. 게임은 최대 1600px, 높이 100dvh, 여백 16px, 세로 간격 16px인 flex 열이다. 플레이 중에는 홈 브랜드 헤더와 로컬 검수 배너를 숨긴다. 플레이 도구 아래 얇은 경계가 비교 영역과 제어를 분리한다. 재사용되는 간격은 frontmatter의 spacing에 기록하며 엄격한 등차 척도로 확대하지 않는다.

홈 카드 목록은 3열과 24px 간격이다. 900px 이하에서는 2열, 홈 여백 20px 24px, 게임 여백 12px 16px과 세로 간격 12px이다. 540px 이하에서는 1열과 16px 간격, 홈 여백 18px 16px이며 게임 여백은 12px 16px이다. 주제 버튼은 줄바꿈한다. 목록 제목과 난이도 제어는 모바일에서 위아래로 놓는다.

플레이 헤더는 최소 64px이며 뒤로가기·제목·진행·행동을 한 줄에 놓는다. 900px 이하에서는 줄바꿈하고 아래 여백 8px을 둔다. 1100px 이하에서는 진행 원을 숨기고 개수 텍스트를 유지한다. 1180×820과 1180×720의 브라우저 측정에서 헤더는 64px, 820×1180에서는 113px, 390×844에서는 148px이었다. 한 줄 헤더는 넓은 가로 화면의 규칙이다.

비교 영역은 남은 높이를 채우는 size container이며 min-height: 0으로 화면 높이 안에 들어간다. 가로는 같은 크기 두 그림을 max-content 열로 가운데 모으고, 세로는 1열 2행으로 놓는다. 실제 그림 가장자리 사이 간격은 모든 화면에서 16px이다. 그림 틀의 폭은 가로에서 min(calc((100cqw - 16px) / 2), calc(100cqh * var(--board-ratio))), 세로에서 min(100cqw, calc((100cqh - 16px) * var(--board-ratio) / 2))로 정한다. 원본의 폭/높이가 --board-ratio와 SVG viewBox를 결정한다. 2026-10-15 사용자 결정으로 기본 18개를 재생성했고 유지한 animals-easy-picnic-portrait를 포함한 모든 그림은 1120×1400의 4:5를 사용한다. 기본 비교 그림은 원본을 자르지 않는다. 홈 카드 썸네일은 기존 3:2 틀과 object-fit: cover를 사용한다.

work/ui-critique/portrait-comparison-metrics.json에서 4:5 그림 한 장은 1180×820에서 566×707.5px, 1180×720에서 약 486.39×607.98px, 820×1180에서 406×507.5px로 측정됐다. 이 값은 브라우저 에뮬레이션 관측값이며 실기기 기준값으로 정규화하지 않는다.

대화상자는 고정된 전체 화면 덮개 중앙에 놓는다. 덮개 여백은 20px이며 내부 상자는 width: 100%, max-width: 460px, max-height: 90dvh, overflow: auto를 사용한다. 작은 화면에서 내부 여백은 22px이다. frontmatter의 button height와 dialog width는 대표 최소 높이와 최대 너비를 나타내며 정확한 제약은 이 설명과 sidecar CSS가 기준이다.

## Elevation & Depth

얕은 카드 그림자와 종이색 면 차이를 함께 쓴다. 비교 그림은 별도 그림자 없이 둥근 틀에 놓는다. 설정과 완료는 반투명 숲색 덮개 (#203b3260) 위로 떠오른다. 열린 놀이 도움말은 도구 아래 작은 종이색 면과 얕은 그림자로 놓인다.

### Shadow Vocabulary

- **카드 기본:** 0 5px 18px #3e493312.
- **카드 호버:** 0 9px 24px #3e493321; 위로 3px 이동.
- **대화상자:** 0 18px 65px #1c352838.
- **놀이 도움말:** 0 8px 24px #203b3230.

### Named Rules

**The Soft Lift Rule.** 카드는 기본 상태에서도 얕게 떠 있다. 호버에서만 조금 더 올라가며 대화상자는 가장 깊은 그림자를 쓴다.

## Shapes

카드와 대화상자의 큰 모서리는 surface (16px), 버튼과 그림 틀은 control (12px), 놀이 도구는 toolbar (10px), 난이도 배지는 badge (9px)다. 주제는 pill (24px), 아이콘 버튼과 진행·완료 표시는 circle (50%)이다. 카드와 그림 틀은 overflow: hidden으로 이미지 모서리도 함께 자른다. 기본 테두리는 1px이다. 선형 SVG 아이콘은 24px, stroke-width: 1.8, 둥근 끝과 접합을 사용한다.

## Components

### Buttons

둥근 면과 명확한 글자 행동을 쓴다. 주요·보조·삭제 버튼은 최소 48px 높이와 12px 22px 여백이다. 주요 버튼은 ink/on-ink와 ink-hover, 보조는 control/ink, 삭제 확인은 #a43f29/white다. 아이콘 버튼은 44px 원형, 투명 면, line 테두리이며 호버에 #f0e9d9 면을 쓴다. 모든 버튼의 focus-visible은 coral 3px 외곽선과 4px 간격이다. 비활성 버튼은 opacity: 0.65이며 현재 구현의 커서는 wait다. 동작 없는 상태까지 새 커서 규칙으로 일반화하지 않는다.

### Chips

주제는 46px 최소 높이, 8px 22px 여백, 17px 글자, line 테두리다. 선택 상태는 ink/on-ink, 비선택 호버는 #efe9d9다. 모바일은 43px 최소 높이, 8px 14px 여백, 15px 글자다. 난이도 선택은 control 면의 12px 상자 안에 놓이며 선택된 항목은 selected-control 면을 쓴다. 내부 항목은 40px 최소 높이, 8px 13px 여백, 9px 모서리다.

### Cards / Containers

카드 전체가 게임 선택 버튼이다. 이미지 위에 난이도와 완료 배지를 얹는다. 제목·주제·오프라인 여부·진행·시작 행동은 이미지 아래에 놓는다. 본문 여백은 17px 20px 20px이다. 호버 전환은 transform과 box-shadow에 0.18s ease-out을 사용한다. 빈 상태는 #f0ece0 바탕, 16px 모서리, 45px 20px 여백과 가운데 안내를 쓴다. 오류는 다시 불러오기 버튼을 제공한다.

### Navigation

홈의 로고 버튼으로 홈에 돌아간다. 게임에는 아이콘과 “다른 게임”을 함께 표시하는 48px 최소 높이의 투명 뒤로가기 버튼이 있다. 플레이 중 음소거는 도구 행에서 제공한다. 음소거 상태는 SVG 모양과 aria-pressed로 구분한다. 주제 탐색은 Chips 규칙을 따른다.

### Play Toolbar / Help

플레이 도구는 제목과 비교 그림에 남는 공간을 우선한다. 다시 풀기·힌트는 최소 48px 높이, 10px 12px 여백, 10px 모서리와 18px/700 글자를 쓴다. 다시 풀기는 control/ink, 힌트는 yellow/#513d06이다. 플레이 음소거와 도움말은 48px 정사각형이며 10px 모서리다. 홈의 원형 44px 아이콘 버튼과 구분한다. 540px 이하에서는 글자 행동의 여백을 9px 11px, 글자를 16px로 줄이며 최소 높이는 유지한다.

도움말은 native details/summary로 접고 펼친다. summary의 키보드 초점은 coral 3px 외곽선과 4px 간격이다. 본문은 도구 아래 12px 간격, 오른쪽 정렬, width: min(340px, calc(100vw - 32px)), 여백 16px, surface 면과 12px 모서리다. summary에는 “놀이 도움말” aria-label과 선형 SVG 아이콘을 제공한다.

### Comparison Board

두 그림은 같은 확대·이동 값을 공유한다. 어느 쪽 정답을 눌러도 두 쪽에 answer 색 7px 실선 원이 나타나며 크기는 정답 영역의 1.15배다. 채움은 #f4bd5030이다. 힌트는 영역의 1.75배, hint 색 5px 선, 10 6 점선, #f4bd503b 채움이며 2초 후 지운다. 두 표시 모두 non-scaling-stroke로 확대 후 선 굵기를 유지한다. 오답은 #4f4b4380의 3px 원을 500ms 표시한다.

정답·완료·오답은 서로 다른 효과음을 사용한다. 오답은 180Hz의 짧고 낮은 소리로 표시한다. 소리는 기본으로 켜져 있으며 사용자가 저장한 음소거 설정은 유지한다. 배경음악과 오답 감점은 없다.

두 손가락으로 1–4배 확대하고 이동한다. 8px를 넘는 움직임과 여러 포인터 제스처는 탭 정답으로 처리하지 않는다. Pencil 포인터는 들어올린 상태까지 다른 포인터의 시작을 막는다. 다시 풀기, 게임 진입, 방향 변경, 힌트 시작은 확대 상태를 초기화한다. 이 입력 동작은 코드에 구현되어 있으며 실제 iPad의 Pencil·터치 검증은 별도다.

### Progress / Dialogs

진행 개수는 18px/700과 tabular-nums를 사용한다. 진행 원은 24px, 간격 4px, 숫자 14px이며 찾은 뒤 found 면과 16px 체크로 바뀐다. 1100px 이하에서는 원을 숨기며 개수와 role=status 안내를 유지한다. 진행 원은 aria-hidden이다. 완료 상자는 노란 원형 체크, 칭찬 문구, 다음 게임과 다시 풀기를 제공한다. 완료 등장만 1s cubic-bezier(0.16, 1, 0.3, 1)로 아래 22px·0.94배에서 제자리로 이동한다. prefers-reduced-motion: reduce에서는 모든 전환과 애니메이션을 끈다.

다시 풀기는 찾은 정답이 있으면 확인창을 제공한다. 계속 풀기가 첫 초점을 받고 Escape로 취소할 수 있다. 확인하면 현재 게임의 정답·힌트·확대·이동과 오답 표시를 지우고 진행을 저장한다. 다른 게임의 기록은 유지한다.

설정과 완료는 dialog/aria-modal, 내부 첫 버튼 초점, Tab 순환, 닫힌 뒤 이전 초점 복원을 구현한다. Escape는 설정을 닫는다. 설정 삭제 동작은 구획·설명·추가 확인으로 표시한다. 텍스트 입력 필드는 현재 앱에 없다.

## Do's and Don'ts

### Do:

- **Do** 이미지의 비율을 유지하고 두 그림의 확대 상태를 공유한다.
- **Do** 키보드 초점에 주황색 외곽선을 유지한다.
- **Do** reduced-motion 설정에서 애니메이션과 전환을 끈다.
- **Do** 실제 주제·난이도·진행·오프라인 상태를 텍스트로 표시한다.

### Don't:

- **Don't** 정답 원과 힌트 원을 같은 선 스타일로 만든다.
- **Don't** 확대·이동 동작을 정답 탭으로 처리한다.
- **Don't** 플레이 중 앱 업데이트 동작을 노출한다.

검증 한계 / 비정규화 항목: 최초 구현은 별도 comp-first 시안 없이 PRD의 구도를 코드로 구현했다. 그 절차를 미래 디자인 규칙으로 만들지 않는다. 2026-10-14의 글꼴·헤더·세로 시범 제작 승인은 기록하지만 콘텐츠 승인으로 확대하지 않는다. 스크린샷과 치수는 브라우저 에뮬레이션이며 실제 iPad A16·Apple Pencil·주아 테스트, 기본 18개와 추가 시범 1개의 콘텐츠 승인, 첫 18개 공개 조건은 미완료다. 이 문서는 공개 승인이나 실기기 품질 증명이 아니다. 오프라인 상태의 기존 11px 보조 글자는 현재 구현의 사실이며 재사용 글자 척도로 채택하거나 이번 문서화에서 수리하지 않는다.

2026-10-28: 상세 페이지의 확대 초기화 버튼과 관련 도움말을 제거했다. 게임 진입은 `?game=<id>`와 history 항목을 추가한다. 목록에서 진입한 게임의 다른 게임 버튼은 이전 목록으로 돌아간다. 직접 링크 진입은 현재 항목을 목록 주소로 교체해 앱 밖으로 이동하지 않는다.

현재 운영 변경: 검수 미리보기 안내와 승인 절차를 제거했다. 등록된 게임 전체를 앱과 빌드에 포함한다. 데이터·산출물 자동 검사는 유지하며 공개 배포는 별도 동작이다.

## 2026-10-29 디자인 검토 반영

이 절은 앞선 날짜의 구현 수치 중 이번에 변경한 항목을 갱신한다. 부속 메타데이터의 기존 불일치를 별도로 복구한 기록은 아니다.

- 홈 소개는 넓은 화면에서 32px 한 줄 제목과 96×80px 장식으로 줄였다. 540px 이하에서는 28px 두 줄 제목과 64×80px 장식을 사용한다. 본문은 16px, 작은 화면에서는 15px이다.
- 1100px 이상 또는 960px 이상인 가로 화면에서는 홈을 4열로 표시하고 썸네일 틀을 원본과 같은 4:5로 사용한다. 기본 간격은 20px, 카드 제목은 20px/1.4, 본문 여백은 12px 14px 14px, 주제 아래 간격은 10px이다. 960~1099px 가로 화면에서는 간격 16px·제목 18px·본문 여백 12px를 사용해 1024px iPad 가로 화면에도 4열을 표시한다. 나머지 901~1099px 화면에서는 3열, 541~900px에서는 2열, 540px 이하에서는 1열을 유지하며 이 범위의 썸네일 틀은 기존 3:2다. 모든 화면에서 `object-fit: contain`으로 그림 전체를 표시한다. 남는 부분은 control 색으로 채운다. 그림 파일과 게임 버전은 변경하지 않는다.
- 난이도·완료 배지와 카드 주제·오프라인 여부·진행·행동 안내는 14px이다. 모든 버튼의 터치 영역은 최소 44×44px이며 플레이 도구는 기존 48px를 유지한다.
- 도움말은 버튼의 `aria-expanded`로 여닫고 상단과 그림 사이의 일반 문서 흐름에 배치한다. 그림을 덮지 않는다. 첫 진입 안내를 닫은 상태는 기기에 저장하고 필요할 때 다시 열 수 있다.
- 완료 창은 `그림 더 보기`, `다른 게임 고르기`, `다시 풀기`를 제공한다. 그림 더 보기와 Escape는 정답·완료 기록을 유지하며 창만 닫는다. 상단 다시 풀기와 완료 창 다시 풀기는 확인창을 거친다.
- 설정 효과음 행은 `aria-pressed`를 제공한다. 작업 결과는 해당 항목 아래 15px 상태 안내로 표시한다. 작업 중에는 중복 실행과 설정 닫기를 막는다.
- 그림은 키보드 초점을 받을 수 있다. 방향키는 위치 이동, Shift와 방향키는 미세 이동, Enter·Space는 선택, 더하기·빼기는 두 그림의 확대·축소다. 선택 위치가 화면 밖으로 나가면 두 그림을 함께 이동한다. 키보드 초점일 때만 선택 커서와 조작 안내를 표시한다.

넓은 가로 화면의 64px 도구 행, 4:5 비교 비율, 16px 그림 간격, 나눔스퀘어라운드, 저장된 효과음 설정과 주소·history 동작은 유지한다.

검증: iPad 가로 1180×820에서 첫 카드는 y=361px부터 표시됐다. iPad 세로 820×1180과 휴대폰 390×844에서도 그림 비율과 도움말 비겹침, 가로 넘침 없음을 확인했다. 단위 검사 14개, Chromium·WebKit 브라우저 검사 33개, 등록 게임 30개의 데이터·빌드 산출물 검사를 통과했다. WebKit CDP 터치 주입 1개는 지원 범위 밖이라 제외했다. 실제 iPad A16·Apple Pencil 검증과 공개 배포는 수행하지 않았다. 화면 증거는 `.impeccable/review/20261029-improved-*.png`에 기록했다.

4열 적용 추가 검증: Chromium·WebKit에서 1180·1100·1099·1024·960·959px 가로 화면과 1024·820·390px 세로 화면의 열 수, 썸네일 비율, 터치 영역과 넘침을 확인했다. 해당 브라우저 검사 2개와 `npm run build`를 통과했다. 1024×768과 960×768에서는 4열, 959×768과 1024×1366에서는 3열이다. 최신 적용 화면은 `.impeccable/review/20261029-ipad-grid-*.png`에 기록했다. 열린 비교안 탭은 실제 홈 주소로 전환했다.
