# 배포 환경과 접근 인증 검토

검토일: 2026-10-29. 검토 후 사용자가 **가족 전용**을 선택했다. PRD·README·운영 문서에 접근 범위를 반영했다. 앱 배포는 실행하지 않았다. 후속 요청에서 부모 이메일을 전달받아 Cloudflare Access 설정을 등록했다.

## 확정 범위와 남은 설정

서비스 접근 범위는 가족 전용으로 확정했다. 배포 환경은 기존 Cloudflare Workers Static Assets를 유지하며 Cloudflare Access의 부모 이메일 허용 목록과 이메일 일회용 코드 방식으로 준비한다. 기존 오프라인 기능은 유지한다. 애플리케이션·허용 정책의 세션을 1주로 설정했다. 실제 기기에서 재로그인 간격을 확인해야 한다.

부모 이메일 1개를 전달받아 정확한 이메일만 허용하는 Access 정책과 이메일 일회용 코드 인증을 등록했다. 현재 보호는 배포 예정 기본 호스트 이름에 적용했다. Worker는 아직 없으므로 Worker 단위 보호는 적용하지 않았다. 미리보기 우회를 막기 위해 `wrangler.jsonc`에 `preview_urls: false`를 명시했다. 사용자 도메인이나 미리보기를 추가하려면 먼저 같은 보호를 적용해야 한다.

허용 이메일과 설정 식별자는 Git에서 제외되는 `work/deployment/family-access.json`에 권한 600으로 보관했다. 실제 앱 배포·부모 로그인·기기 검증은 수행하지 않았다. 아래 비교는 결정을 내릴 때 사용한 검토 자료다.

## 권고

배포 환경은 현재 설정된 **Cloudflare Workers Static Assets**를 유지한다. 가족에게만 제공하려면 **Cloudflare Access + 부모 이메일 허용 목록 + 이메일 일회용 코드**를 사용한다. 누구나 플레이하도록 공개할 경우에는 현재처럼 로그인 없이 제공할 수 있다.

접근 제한의 목적은 허용하지 않은 사람이 서버의 앱·게임 파일을 새로 받지 못하게 하는 것이다. 이미 기기에 저장된 게임의 회수까지 보장하지 않는다. 현재 오프라인 기능을 유지한다면 이 경계를 받아들여야 한다.

## 저장소에서 확인한 사실

| 항목 | 확인 결과 | 근거 |
| --- | --- | --- |
| 앱 구성 | React·Vite 기반 정적 PWA. 현재 런타임 서버 API와 로그인 구현 없음 | `package.json`, `src/`, `wrangler.jsonc` |
| 배포 구성 | `dist`를 Workers Static Assets로 배포. SPA 경로 처리 설정 있음 | `wrangler.jsonc` |
| 배포 실행 | 로컬 산출물 검사 후 `wrangler deploy` 실행 | `scripts/deploy.mjs`, `docs/RELEASE.md` |
| 검토 전 요구사항 | 누구나 로그인 없이 플레이. 검토 후 사용자 선택으로 가족 전용으로 변경 | `docs/PRD.md` 2절·7.2절 |
| 진행 기록 | IndexedDB에 기기별 저장. 로그인·기기 간 동기화 없음 | `src/storage.ts` |
| 오프라인 | 앱 기본 파일 사전 저장. 열어본 게임은 Cache Storage에 저장 | `vite.config.ts`, `src/cache.ts`, `src/sw.ts` |
| 이미지 응답 | `/games/*`에 `Cache-Control: public, max-age=31536000, immutable` 설정 | `public/_headers` |
| 기존 빌드 크기 | 30개 게임, 164개 파일, 266,632,598바이트(254.28 MiB). 최대 파일 4,630,711바이트(4.42 MiB) | 검토 시점의 기존 `dist` 측정 |

크기는 기존 산출물의 측정값이다. 이번 검토에서 새 빌드를 만들거나 현재 소스와 산출물의 일치를 검증하지 않았다. 후속 요청에서는 브라우저로 Cloudflare 계정을 조회했다. 기존 Workers·Pages 애플리케이션은 3개이며 그림콕콕 Worker는 없었다. 기존 서비스와 계정 전체 Access 정책은 변경하지 않았다.

## 배포 환경 비교

| 후보 | 적합성 | 접근 제한과 비용 | 판단 |
| --- | --- | --- | --- |
| Cloudflare Workers Static Assets | 현재 설정과 배포 스크립트를 그대로 활용 | 정적 파일 요청 무료·무제한, 저장 추가 비용 없음. Access는 별도 Zero Trust 무료 플랜 50명 한도 | 1순위 |
| Cloudflare Pages | 사전 빌드한 정적 사이트를 Direct Upload로 배포 가능 | 접근 제한 범위를 별도로 구성해야 함 | Workers에서 이전할 실익이 적음 |
| Vercel | 정적 앱 배포 후보 | 현재 공식 문서는 모든 플랜에서 Vercel Authentication으로 운영 주소까지 보호 가능하다고 안내. 방문자에게 접근 권한이 있는 Vercel 계정 필요. 공유 비밀번호는 Pro에서 프로젝트당 월 $20 추가 | 개발자용 미리보기에는 적합하지만 가족 이용에 우선하지 않음 |
| Netlify | 정적 앱 배포 후보 | 기본 공유 비밀번호 보호는 Pro 이상. Credit-based Free·Personal에서는 비밀번호 보호 미제공 | 이 서비스 때문에 이전할 이유가 적음 |

Cloudflare 무료 정적 파일 한도는 Worker 버전당 20,000개, 파일당 25 MiB다. 기존 `dist`는 두 한도 안에 있다. 총 디렉터리 크기 254 MiB와 개별 파일 25 MiB 한도는 다른 값이다.

위 무료 비용 판단은 정적 파일 제공과 Access 무료 사용자 한도에 근거한다. 사용자 도메인을 구매하면 도메인 비용은 별도다. 자체 인증 Worker나 다른 유료 기능을 추가하면 해당 기능의 요금·요청 한도를 다시 계산한다.

근거: [Cloudflare 정적 파일 요금](https://developers.cloudflare.com/workers/static-assets/billing-and-limitations/), [플랫폼 한도](https://developers.cloudflare.com/workers/platform/limits/), [Zero Trust 요금](https://www.cloudflare.com/plans/), [Pages Direct Upload](https://developers.cloudflare.com/pages/get-started/direct-upload/), [Vercel Deployment Protection](https://vercel.com/docs/deployment-protection), [Netlify Password Protection](https://docs.netlify.com/manage/security/secure-access-to-sites/password-protection/).

## 인증 방식 비교

| 방식 | 사용 경험 | 제한 범위 | 판단 |
| --- | --- | --- | --- |
| 로그인 없는 공개 | 주소로 즉시 플레이 | 누구나 앱·이미지·정답 JSON 다운로드 가능 | 공개 서비스라면 충분 |
| Cloudflare Access 이메일 허용 목록 | 부모가 허용된 이메일로 코드를 받아 로그인. 세션이 유지되는 동안 아이는 바로 플레이 | Cloudflare가 서버 요청을 확인. 허용 이메일별 접근 관리 가능 | 가족·소수 초대용 권고 |
| 서버에서 확인하는 가족 공통 비밀번호 | 비밀번호 입력 후 세션 쿠키 사용 | 공유받은 사람을 구분하거나 한 명만 차단하기 어려움 | 이메일 로그인 불편이 큰 경우의 차선책 |
| 앱 회원가입·소셜 로그인 | 사용자별 가입·로그인 필요 | 파일 제공도 서버 인증과 연결해야 실제 보호 가능 | 기기 간 기록 동기화·유료화 등 계정 기능이 필요해질 때 재검토 |

비밀 주소, `robots.txt`, `noindex`는 접근 인증이 아니다. React 화면에서 PIN을 비교하거나 `localStorage` 값으로 화면만 숨기면 이미지·JSON 직접 요청을 막지 못한다. 정적 앱에 로그인 SDK만 붙여도 같은 문제가 남는다.

공통 비밀번호를 자체 구현한다면 Worker Secret, 서버 검증, 서명된 세션, `HttpOnly`·`Secure` 쿠키, 시도 횟수 제한, 정적 파일보다 먼저 실행되는 인증 처리가 필요하다. Workers의 기본 정적 파일 우선 처리 상태에서 Worker 코드만 추가하면 파일 요청이 인증을 건너뛸 수 있다. `run_worker_first`로 인증을 먼저 실행하면 Worker 요청 사용량도 고려해야 한다. 현재 서비스에는 Access를 쓰는 편이 관리할 코드가 적다.

근거: [Access 이메일 코드](https://developers.cloudflare.com/cloudflare-one/integrations/identity-providers/one-time-pin/), [정적 파일과 Worker 실행 순서](https://developers.cloudflare.com/workers/static-assets/routing/worker-script/).

## 가족 전용일 때의 제안 구성

```text
iPad Safari / 홈 화면 PWA
        ↓ 서버 요청
Cloudflare Access
  부모 이메일 허용 목록 + 이메일 일회용 코드
        ↓ 허용한 요청
Workers Static Assets
  앱 + 목록 + 게임 이미지 + 정답 JSON

기기에 저장된 게임 → 오프라인에서 직접 실행
진행 기록 → 기존 IndexedDB에 저장
```

Worker의 Access 설정에서 `All traffic`을 선택하는 방식을 권고한다. 현재 공식 문서는 Worker 단위 보호가 사용자 도메인, routes, `workers.dev`, 미리보기 주소를 함께 보호하며 Static Assets도 보호한다고 안내한다. 사용자 도메인을 먼저 구매할 필요는 없다.

허용 정책은 부모의 정확한 이메일 주소만 포함한다. `gmail.com` 같은 전체 이메일 도메인이나 모든 사용자를 허용하지 않는다. 이메일 코드 로그인 자체와 허용 대상 설정은 별도다. 아이의 이메일이나 Cloudflare 관리 계정은 필요하지 않다.

세션은 우선 7일로 제안한다. 더 적은 재로그인을 원하면 가족 소유 기기에 한해 최대 한 달 범위에서 조정할 수 있다. 공식 문서의 기본 애플리케이션 세션은 24시간이며 최대 한 달이다. 실제 로그인 간격은 애플리케이션·정책·전역 세션 설정을 함께 확인해야 한다.

인증 추가로 진행 기록이 서버에 올라가거나 기기 사이에 동기화되지는 않는다. 도메인·프로토콜·포트를 바꾸면 저장소 오리진이 달라져 기존 기록을 자동으로 이어받지 못한다. 장기간 사용할 주소를 정한 뒤 홈 화면에 추가하는 편이 낫다. Cloudflare Access에는 인증 이메일 등 접속 기록이 생기므로 게임 내 사용 통계를 수집하지 않는 것과 구분한다.

근거: [Workers Access와 Static Assets 보호](https://developers.cloudflare.com/workers/configuration/cloudflare-access/), [Access 세션 관리](https://developers.cloudflare.com/cloudflare-one/access-controls/access-settings/session-management/).

## PWA와 인증을 함께 사용할 때

현재 `src/sw.ts`는 앱 이동 시 저장된 `index.html`을 제공하고 게임 파일도 캐시에서 먼저 찾는다. 서버 요청이 없으면 Access는 실행되지 않는다. 오프라인뿐 아니라 온라인 상태에서도 캐시에 있는 화면·파일은 그대로 열릴 수 있다.

따라서 가족용 운영에서는 다음 정책을 제안한다.

- 한 번 허용된 기기에 저장된 게임은 오프라인에서도 계속 플레이한다.
- 새 게임 다운로드와 서버에서 받는 업데이트에는 유효한 인증이 필요하다.
- 허용 목록 제거·세션 취소는 이후 서버 요청을 차단하며 다운로드된 파일을 원격 삭제하지 않는다.
- 엄격한 매 실행 인증이 필요하면 오프라인 요구사항부터 바꾸고 서버 재검증 흐름을 설계한다. 이미 복사된 파일의 회수는 별도 문제다.

Access 설정만으로 가족용 접근 제한을 시작할 수 있지만, 만료 후 이용 경험을 위해 아래 앱 대응도 필요하다.

1. 인증 만료와 일반적인 다운로드 실패를 구분하고 부모에게 재로그인 동작을 제공한다. Cache Storage와 Service Worker가 가로채지 않는 서버 확인 경로를 설계한다.
2. `/cdn-cgi/access/*`와 필요한 인증 경로는 Service Worker의 SPA 이동 처리에서 제외한다. 현재는 `/games/`와 `/cdn-cgi/access` 경로를 모두 이동 제외 목록에 반영했다.
3. 로그인 HTML·인증 실패 응답이 게임 JSON이나 앱 업데이트 파일로 저장되지 않는지 확인한다.
4. Safari와 홈 화면 PWA 각각에서 첫 로그인·재실행·세션 만료·로그아웃·오프라인을 확인한다. 두 환경의 로그인 상태 공유는 확인 전 보장하지 않는다.
5. 현재 게임 파일의 장기 `public` 캐시 헤더가 선택한 비공개 정책에 맞는지 검토한다. HTTP 캐시 설정과 앱의 Cache Storage는 별개이며, 헤더 변경만으로 기존 오프라인 파일이 사라지지는 않는다.

Access 애플리케이션 저장과 단일 이메일 허용 규칙·1주 세션을 Cloudflare 화면에서 확인했다. Service Worker 인증 경로 제외는 소스에 반영했다. 실제 부모 로그인·PWA 만료·로그아웃 동작은 아직 검증하지 않았다.

## 적용 순서와 결정할 사항

1. 접근 범위는 가족 전용으로 확정했다. PRD·README·제품 문서에 반영했다.
2. 기존 오프라인 기능을 유지하는 구성으로 준비한다. 허용할 부모 이메일 1개를 전달받았고 애플리케이션·정책 세션을 1주로 설정했다.
3. Zero Trust와 이메일 허용 정책을 준비한다. 처음 업로드하는 동안에도 무인증 접근이 열리지 않도록 사전 계정 단위 보호 또는 접근 경로 비활성화 등 배포 순서를 정한다.
4. Worker 전체 트래픽을 보호하고 앱의 인증 만료·Service Worker 처리를 보완한다.
5. 미인증 환경에서 운영 주소·미리보기 주소·JS·`catalog.json`·이미지·`puzzle.json` 직접 요청이 차단되는지 확인한다. 허용하지 않은 이메일도 확인한다.
6. 허용한 iPad에서 온라인·홈 화면 PWA·오프라인·만료 후 재로그인을 확인한 뒤 사용한다.

기기 기록과 제작 자료는 현재처럼 로컬에 둔다. 접근 제어는 웹 배포 경로를 보호하므로, 별도로 공개한 저장소나 파일 보관소에 같은 콘텐츠가 있다면 그 경로도 확인해야 한다.

가족 전용 접근 보호가 실제로 적용됐는지는 원격 정책과 미인증·허용 이메일 요청으로 확인해야 한다. 문서 반영이나 로컬 빌드 성공만으로 적용 완료를 판단하지 않는다.
