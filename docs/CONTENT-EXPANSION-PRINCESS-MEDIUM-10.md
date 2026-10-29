# 공주 보통 난이도 10개 추가

2026-10-29 요청에 따라 틀린그림찾기 공주 주제의 보통 난이도 게임 10개를 추가했다. 각 게임은 차이 8개이며 새 정답은 총 80개다. 기존 콘텐츠 60개·파일 520개의 SHA-256이 모두 유지됐다. 병행 작업의 주아 가족 콘텐츠 2개도 보존했다. 현재 등록 콘텐츠는 틀린그림찾기 41개와 숨은그림찾기 31개, 총 72개다.

## 추가한 게임

| 제목 | 로컬 게임 | 검수 이미지 |
| --- | --- | --- |
| 공주의 햇살 도서관 | [princess-medium-library-20261029](http://127.0.0.1:5173/?game=princess-medium-library-20261029) | [정답 표시](../work/content/princess-medium-library-20261029/review.png) |
| 공주의 딸기 제과실 | [princess-medium-bakery-20261029](http://127.0.0.1:5173/?game=princess-medium-bakery-20261029) | [정답 표시](../work/content/princess-medium-bakery-20261029/review.png) |
| 공주의 정원 음악회 | [princess-medium-concert-20261029](http://127.0.0.1:5173/?game=princess-medium-concert-20261029) | [정답 표시](../work/content/princess-medium-concert-20261029/review.png) |
| 공주의 겨울 선물방 | [princess-medium-snow-20261029](http://127.0.0.1:5173/?game=princess-medium-snow-20261029) | [정답 표시](../work/content/princess-medium-snow-20261029/review.png) |
| 공주의 연못 나들이 | [princess-medium-boat-20261029](http://127.0.0.1:5173/?game=princess-medium-boat-20261029) | [정답 표시](../work/content/princess-medium-boat-20261029/review.png) |
| 공주의 무지개 온실 | [princess-medium-greenhouse-20261029](http://127.0.0.1:5173/?game=princess-medium-greenhouse-20261029) | [정답 표시](../work/content/princess-medium-greenhouse-20261029/review.png) |
| 공주의 별빛 발코니 | [princess-medium-stars-20261029](http://127.0.0.1:5173/?game=princess-medium-stars-20261029) | [정답 표시](../work/content/princess-medium-stars-20261029/review.png) |
| 공주의 들꽃 소풍 | [princess-medium-picnic-20261029](http://127.0.0.1:5173/?game=princess-medium-picnic-20261029) | [정답 표시](../work/content/princess-medium-picnic-20261029/review.png) |
| 공주의 리본 작업실 | [princess-medium-sewing-20261029](http://127.0.0.1:5173/?game=princess-medium-sewing-20261029) | [정답 표시](../work/content/princess-medium-sewing-20261029/review.png) |
| 공주의 가을 과수원 | [princess-medium-harvest-20261029](http://127.0.0.1:5173/?game=princess-medium-harvest-20261029) | [정답 표시](../work/content/princess-medium-harvest-20261029/review.png) |

## 제작과 검수

Codex 내장 `image_gen`으로 원본 10장과 변경 그림 10장을 제작했다. 원본을 실제로 본 뒤 차이 8개를 계획했고, 이미지 도구에서 계획한 부분만 편집했다. 색깔·표정·개수·모양·무늬·유무를 게임당 6종 섞었다. 한 유형은 최대 2개다. 제과실의 첫 편집에서 누락된 고양이 입 표정은 별도 편집으로 수정했다. 성공한 원본과 모든 시도는 보존했다.

최종 원본·변경 그림은 1120×1400, 썸네일은 480×600이다. 크기 정규화와 포맷 변환은 `sharp`로 처리했고 그림을 자르지 않았다. 온실의 생성 결과는 1060×1484였으며 양쪽 모두 같은 방식으로 전체 그림을 1120×1400에 정규화했다. 코드로 사물이나 색을 편집하지 않았다.

원본·변경 그림 전체, 차이 80개의 양쪽 확대, 계획 영역 밖에서 변화가 큰 부분, 양쪽 정답 표시 이미지를 확인했다. 미세한 생성 질감 차이는 정답으로 취급하지 않는다. 판정 영역 160개는 실제 차이 위치에 맞췄다. 타원 중심과 경계 1440방향 표본으로 영역 간 560쌍의 겹침을 검사했고 겹침은 없었다. 왼쪽 가장자리에 있던 접힌 천 영역의 범위 오류를 수정했다.

`work/content/<game-id>/`에 `plan.json`, 실제 원본·편집 프롬프트, 수정 시도, `comparison.png`, `planned-detail-review.png`, `outside-review.png`, `review.png`, 제작자 확인 기록 `producer-review.json`을 보존했다. 실제 도구 반환 경로와 전체 썸네일은 `work/princess-medium-10-20261029/`에 있다. 일괄 상태는 `work/batches/princess-medium-10-20261029.json`에 기록했다. 성공 10개·실패 0개다.

## 검증

`npm test`의 단위 검사 24건과 Chromium·WebKit 브라우저 검사 2건을 통과했다. 두 브라우저에서 등록된 틀린그림찾기 41개·정답 337개를 양쪽 교대로 선택해 완료 화면까지 확인했다. 여기에는 새 공주 게임 10개·정답 80개가 포함된다. Chromium은 모든 틀린그림찾기의 가로·세로 화면을 저장했고 새 게임의 실제 배치를 시각 확인했다.

`npm run build`는 전체 72개 게임의 타입·데이터·파일 해시·빌드·산출물 검사를 통과했다. 세부 결과는 [검증 기록](verification/princess-medium-10-20261029.json)을 따른다. 실제 iPad A16·Apple Pencil 조작과 아이의 체감 난이도는 확인하지 않았다. 이번 추가 콘텐츠는 커밋·푸시·배포하지 않았다.

로컬 확인은 `npm run dev`로 실행한다. [공주의 햇살 도서관](http://127.0.0.1:5173/?game=princess-medium-library-20261029)에서 새 그림 쌍을 열 수 있다. 검수 이미지는 `npm run content -- review-image <game-id>`로 다시 만들 수 있다.
