# 콘텐츠 30개 확장

2026-10-28~29 사용자 요청으로 새 게임 12개를 추가했다. 기존 18개 게임의 이미지·정답·메타데이터·썸네일 해시는 유지했다. 최종 목록은 30개 게임·250개 정답이다. 주제별 5개, 쉬움·보통·어려움 각각 10개다.

## 추가한 게임

| 주제 | 난이도 | 제목 | 실제 게임 | 검수 이미지 |
|---|---|---|---|---|
| 동물 | 쉬움 | 숲속 친구들의 텃밭 | [게임](http://127.0.0.1:5173/?game=animals-easy-garden) | [정답 표시](../work/content/animals-easy-garden/review.png) |
| 동물 | 보통 | 눈밭의 겨울 놀이터 | [게임](http://127.0.0.1:5173/?game=animals-medium-snow) | [정답 표시](../work/content/animals-medium-snow/review.png) |
| 우주 | 보통 | 화성 탐사차의 발견 | [게임](http://127.0.0.1:5173/?game=space-medium-rover) | [정답 표시](../work/content/space-medium-rover/review.png) |
| 우주 | 어려움 | 별을 찾는 천문대 | [게임](http://127.0.0.1:5173/?game=space-hard-observatory) | [정답 표시](../work/content/space-hard-observatory/review.png) |
| 공주 | 어려움 | 공주님의 유리 온실 | [게임](http://127.0.0.1:5173/?game=princess-hard-greenhouse) | [정답 표시](../work/content/princess-hard-greenhouse/review.png) |
| 공주 | 쉬움 | 백조 호수의 나들이 | [게임](http://127.0.0.1:5173/?game=princess-easy-lake) | [정답 표시](../work/content/princess-easy-lake/review.png) |
| 동화 | 쉬움 | 아기 용의 꽃밭 | [게임](http://127.0.0.1:5173/?game=fairytale-easy-dragon) | [정답 표시](../work/content/fairytale-easy-dragon/review.png) |
| 동화 | 보통 | 요정 마을의 풍차 | [게임](http://127.0.0.1:5173/?game=fairytale-medium-windmill) | [정답 표시](../work/content/fairytale-medium-windmill/review.png) |
| 교통 | 보통 | 구름 공항의 아침 | [게임](http://127.0.0.1:5173/?game=transport-medium-airport) | [정답 표시](../work/content/transport-medium-airport/review.png) |
| 교통 | 어려움 | 출동 준비 소방서 | [게임](http://127.0.0.1:5173/?game=transport-hard-rescue) | [정답 표시](../work/content/transport-hard-rescue/review.png) |
| 일상 | 어려움 | 뚝딱뚝딱 장난감 공방 | [게임](http://127.0.0.1:5173/?game=daily-hard-workshop) | [정답 표시](../work/content/daily-hard-workshop/review.png) |
| 일상 | 쉬움 | 햇살 가득 빨래하는 날 | [게임](http://127.0.0.1:5173/?game=daily-easy-laundry) | [정답 표시](../work/content/daily-easy-laundry/review.png) |

## 제작과 검수

원본과 변경 그림은 Codex 내장 image_gen으로 제작했다. 기존과 같은 질감의 동화책 그림, 4:5 세로 구도, 1120×1400으로 맞췄다. 크기 정규화·포맷 변환·썸네일 제작만 sharp로 처리했다. 썸네일은 여백 없는 480×600이다. 게임마다 4종 이상의 차이를 섞었고 쉬움·보통·어려움의 정답 수는 7·8·10개다.

실제 원본을 보고 차이를 계획한 뒤 편집했다. 원본과 변경 그림 전체 및 각 정답 주변의 양쪽 확대 이미지를 대조했다. 풍차 날개 과다 삭제, 남은 양말 위치 이동, 객차 삭제에 따른 손 위치 변경을 발견해 수정했다. 최종 판정 영역은 양쪽 각각 확인하고, 타원 중심·경계 720방향 표본으로 서로 겹치지 않는지 검사했다.

각 게임의 제작 자료는 `work/content/<game-id>/`에 있다. `prompts.json`에는 실제 생성·편집·수정 프롬프트와 도구 반환 경로를 기록했다. `plan.json`에는 유형·원본 상태·변경 상태·좌우 영역을 기록했다. `difference-details.png`는 양쪽 정답 주변 확대 비교이며, `producer-review.json`은 제작자 확인 기록이다. 승인 기록은 작성하지 않았다. 일괄 진행·기존 파일 해시는 `work/batches/expansion-30-20261028.json`에 있다.

## 검증

파일·해상도·정답 수·유형 배분·기존 파일 보존 검사를 통과했다. `npm test`는 14개, `npm run test:browser`는 Chromium·WebKit 총 25개를 통과했다. WebKit CDP 터치 주입 1개는 기존 제외 항목이다. 두 브라우저에서 30개 게임의 정답 250개를 양쪽 교대로 선택해 완료까지 확인했다. `npm run build`는 30개 콘텐츠의 타입·데이터·빌드·산출물 검사를 통과했다. 결과는 [검증 기록](verification/content-expansion-30.json)에 있다.

실제 iPad A16·Apple Pencil·주아의 체감 난이도는 확인하지 않았다. 공개 배포는 수행하지 않았다. 로컬에서 `npm run dev`를 실행하고 [전체 목록](CONTENT-REVIEW.md)에서 게임과 정답 표시 이미지를 확인할 수 있다.
