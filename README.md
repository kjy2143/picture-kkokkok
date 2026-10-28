# 그림콕콕

7살 주아와 가족을 위한 틀린그림찾기·숨은그림찾기 PWA. [제품 요구사항](docs/PRD.md)을 기준으로 구현한다. 배포 서비스는 가족 전용이며 부모가 기기를 인증한 뒤 아이가 플레이한다. 콘텐츠는 Mac의 Codex에서 생성·직접 검수한다.

가족 접근 인증은 Cloudflare Access의 부모 이메일 허용 목록과 이메일 일회용 코드를 사용한다. 배포 예정 주소에 부모 이메일 1개만 허용하는 Access 정책과 1주 세션을 등록했다. 2026-10-29 앱을 배포했고 미인증 요청 9종의 차단을 확인했다. 부모 이메일의 실제 로그인·기기 검증은 아직 수행하지 않았다. [배포·인증 검토와 확정 범위](docs/DEPLOYMENT-AND-ACCESS-REVIEW.md)를 참고한다.

운영 주소: [그림콕콕](https://picture-kkokkok.jooa-bingo.workers.dev/). 처음에는 허용된 부모 이메일로 인증한다. [첫 배포 확인 결과](docs/verification/deployment-20261029.json)를 참고한다.

## 로컬 실행

Node.js 22 이상에서 실행한다.

```sh
npm ci
npm run dev
```

로컬 실행과 공개용 빌드는 등록된 게임 전체를 포함한다. 검수 승인 명령이나 수동 확인 기록은 요구하지 않는다. 제작 품질 가이드와 파일·정답 데이터 검사는 유지한다.

기존 틀린그림찾기는 **30개·정답 250개**다. 주제별 5개이며 쉬움·보통·어려움은 각각 10개다. 2026-10-28~29에 기존 18개를 보존하고 [새 게임 12개](docs/CONTENT-EXPANSION-30.md)를 추가했다.

숨은그림찾기 **30개·정답 250개**를 추가해 두 놀이를 합쳐 60개·정답 500개다. 숨은그림도 6개 주제에 5개씩이며 쉬움·보통·어려움이 각각 10개다. 별도 놀이 선택 화면과 목록에서 고른다. 가로에서는 큰 장면과 오른쪽 목표 목록을, 세로에서는 장면 아래 목표 목록을 표시한다. 주변 배경 없는 목표 그림과 같은 선·색의 위장된 장면을 사용한다. [숨은그림 콘텐츠 계약](docs/HIDDEN-CONTENT.md)을 따른다.

[검수 목록](http://127.0.0.1:5173/work/content-expansion/review.html)에서 정답 표시 이미지와 실제 게임을 열 수 있다. 가로·세로 화면 캡처와 정답 목록도 준비했다. 목록을 다시 만들려면 `node scripts/prepare-content-review.mjs`를 실행한다. [게임별 목록](docs/CONTENT-REVIEW.md)을 참고한다.

### iPad에서 개발 페이지 접속

```sh
npm run dev
```

Mac과 iPad를 같은 Wi-Fi에 연결한다. 터미널에 표시되는 `http://Mac의-IP:5173/` 주소를 iPad Safari에서 연다. 검수 목록 주소도 함께 표시된다. 기본 `npm run dev`는 등록된 게임 전체를 포함해 Mac과 iPad 모두에서 접속할 수 있는 개발 서버를 실행한다. Mac에서는 기존 `http://127.0.0.1:5173/`도 사용할 수 있다. `npm run dev:ipad`는 같은 명령의 별칭이다.

서버가 실행 중이고 Mac이 깨어 있어야 접속할 수 있다. 연결되지 않으면 macOS 방화벽의 Node.js 수신 연결 허용과 Wi-Fi의 기기 간 연결 차단 여부를 확인한다. Wi-Fi가 바뀌면 명령을 다시 실행해 현재 주소를 확인한다.

HTTP 개발 연결에서는 화면·손가락·Apple Pencil·효과음·진행 기록을 확인할 수 있다. Service Worker와 오프라인 PWA 검증은 신뢰할 수 있는 HTTPS 환경에서 진행한다. HTTP 접속에서는 오프라인 저장을 건너뛰며 게임 플레이는 유지한다. IP나 포트가 달라지면 Safari의 진행 기록은 별도 저장된다.

## 검사와 빌드

```sh
npm test
npm run check
npm run build
npm run preview
```

빌드는 등록된 게임 전체를 포함하며 파일 형식·정답 데이터·산출물 해시와 허용 목록을 자동 검사한다.

브라우저 테스트는 등록된 콘텐츠를 포함한 로컬 빌드를 사용한다. 배포는 별도 명령으로 실행한다.

```sh
PLAYWRIGHT_BROWSERS_PATH=.cache/playwright npx playwright install chromium webkit
npm run test:browser
# 테스트 후 공개용 산출물을 다시 만들려면
npm run build
```

## 제작과 공개

- [게임 생성·검수 명령과 JSON 계약](docs/CONTENT.md)
- [틀린그림찾기 제작 품질 가이드](docs/GAME-GENERATION-GUIDE.md)
- [가로 모드 비교용 18개 재생성 결과](docs/PORTRAIT-REGENERATION.md)
- [첫 공개·수동 기기 검증·복구 절차](docs/RELEASE.md)
- [구현 상태와 확인 결과](docs/IMPLEMENTATION.md)
- 프로젝트 전용 스킬: `.agents/skills/generate-game/SKILL.md`, `$generate-game 동물 쉬움 1개`

앱 회원가입, 서버 진행 기록 동기화, 어드민, 사용 통계는 제공하지 않는다. 웹 접근 인증은 Cloudflare Access에서 처리한다. `npm run deploy`는 로컬 산출물을 자동 검사하지만 원격 Access 정책은 검사하지 않는다. 실제 업로드 전에 [가족 전용 접근 보호 절차](docs/RELEASE.md)를 따라야 한다.
