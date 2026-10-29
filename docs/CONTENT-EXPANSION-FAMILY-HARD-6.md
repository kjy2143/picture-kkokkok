# 주아 가족 어려움 게임 6개 — 2026-10-29

주아·아빠·엄마의 참고 캐릭터로 틀린그림찾기 3개와 숨은그림찾기 3개를 추가했다. 모두 일상 주제, 어려움, 정답 10개다. 기존 게임은 보존했다.

| 종류     | 제목                    | 로컬 플레이                                                               |
| -------- | ----------------------- | ------------------------------------------------------------------------- |
| 틀린그림 | 주아 가족의 별빛 캠핑   | [열기](http://127.0.0.1:5173/?game=daily-hard-jua-family-camping)         |
| 틀린그림 | 주아 가족의 빵 굽는 날  | [열기](http://127.0.0.1:5173/?game=daily-hard-jua-family-bakery)          |
| 틀린그림 | 주아 가족의 바닷가 탐험 | [열기](http://127.0.0.1:5173/?game=daily-hard-jua-family-seaside)         |
| 숨은그림 | 주아 가족의 숲속 도서관 | [열기](http://127.0.0.1:5173/?game=hidden-daily-hard-jua-family-library)  |
| 숨은그림 | 주아 가족의 수족관 탐험 | [열기](http://127.0.0.1:5173/?game=hidden-daily-hard-jua-family-aquarium) |
| 숨은그림 | 주아 가족의 겨울 다락방 | [열기](http://127.0.0.1:5173/?game=hidden-daily-hard-jua-family-attic)    |

틀린그림은 1120×1400, 4:5다. 각 게임은 색깔 2개·표정 1개·개수 2개·모양 2개·무늬 2개·유무 1개다. 소매 단추·초콜릿 조각·조개 홈·나침반 등 부분 구조를 살피게 하고 주변 묘사를 늘렸다. 판정 범위를 좁혀 난이도를 높이지 않았다.

숨은그림은 1448×1086, 4:3이다. 목표 10개 모두 다른 사물의 결·무늬·주름 안에 계획했다. 카드에는 주변 위치 단서가 없는 중성색 투명 PNG를 쓴다. 실제 장면의 방향과 주요 부품을 카드와 나란히 비교했다. 다락방 포크는 최종 장면에 실제 존재하는 네 갈래와 열린 사이 공간을 카드에 반영했다. 초기 계획의 세 갈래 요청이 그대로 구현됐다고 보고하지 않는다. 도서관·수족관 연필의 각진 아래 끝과 다락방 깃털의 기울기도 최종 장면을 기준으로 반영했다.

의미 있는 그림 생성·편집은 내장 `image_gen`으로 수행했다. `sharp`는 크기 정규화·WebP 변환·썸네일·투명 시트 분리·검수 합성에 사용했다. 최종 장면, 목표 카드, 정답 타원과 브라우저 화면을 각각 확인했다.

제작 자료는 다음 위치에 있다. `work/`는 배포·Git 추적 대상이 아니다.

- 틀린그림: `work/content/daily-hard-jua-family-{camping,bakery,seaside}/`의 원본·편집 PNG, `plan.json`, 실제 프롬프트 `*-prompt.txt`, `review.png`, `review.json`.
- 숨은그림: `work/hidden-content/hidden-daily-hard-jua-family-{library,aquarium,attic}/`의 수정 전·최종 장면, 실제 프롬프트, 투명 목표 시트, `target-comparison.png`, `review.png`, `review.json`.
- 일괄 출처·보존·화면: `work/family-content/hard-expansion-20261029/`. 이미지 도구의 실제 출력 경로를 JSON으로 기록했다. 가족 참고 원본은 기존 `work/family-content/references/`에만 둔다.

검증 근거는 [검증 기록](verification/family-hard-6-20261029.json)과 `tests/browser/family-hard-content.spec.ts`를 따른다. 브라우저 복원 검사는 IndexedDB에 저장된 정답 수를 확인한 뒤 새로고침한다. 정답 표시 직후 저장 완료 전에 강제로 새로고침하는 경우는 이 복원 검사의 보장 범위에 포함하지 않는다. 기존 앱의 비동기 저장 방식은 이번 콘텐츠 작업에서 변경하지 않았다.

실제 iPad·Apple Pencil과 주아의 체감 난이도는 확인하지 않았다. 공개 배포와 커밋은 수행하지 않았다.
