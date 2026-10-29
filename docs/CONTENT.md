# 콘텐츠 제작과 검수

`$generate-game` 스킬은 `.agents/skills/generate-game/SKILL.md`에 있다. 프로젝트를 다시 열면 프로젝트 스킬로 발견할 수 있다. 생성은 Codex 내장 이미지 도구에서 수행하며 서버/API 자동 생성은 제공하지 않는다.

새 게임 제작과 기존 그림 수정 전에 [틀린그림찾기 제작 품질 가이드](GAME-GENERATION-GUIDE.md)를 읽는다. 차이 유형·난이도·이미지 검수·판정 영역의 기준은 이 가이드를 따른다. 이 문서는 파일 계약과 실행 명령을 다룬다.

## 파일 계약

게임별 완성본은 `content/games/<id>/`에 둔다. 아래는 틀린그림찾기 계약이며 숨은그림은 [별도 계약](HIDDEN-CONTENT.md)을 따른다. 틀린그림에서 공개 가능한 파일은 `puzzle.json`, `metadata.json`, 각 JSON에서 지정한 원본·변경·썸네일 세 파일뿐이다.

```json
{
  "schemaVersion": 1,
  "id": "animals-easy-picnic",
  "title": "숲속 친구들의 소풍",
  "theme": "동물",
  "difficulty": "easy",
  "thumbnail": "thumbnail.webp"
}
```

```json
{
  "schemaVersion": 1,
  "id": "animals-easy-picnic",
  "width": 1536,
  "height": 1024,
  "original": "original.png",
  "modified": "modified.png",
  "differences": [
    {
      "id": "difference-1",
      "description": "사과 색",
      "left": { "x": 0.47, "y": 0.755, "rx": 0.044, "ry": 0.06 },
      "right": { "x": 0.47, "y": 0.755, "rx": 0.044, "ry": 0.06 }
    }
  ]
}
```

두 번째 예시의 differences는 실제 게임에서는 난이도에 맞는 7·8·10개여야 한다. x/y는 중심, rx/ry는 타원의 반지름이다. 모두 이미지 크기에 정규화한 0~1 값이며 영역 전체가 이미지 안에 있어야 한다. 같은 차이는 양쪽에서 같은 ID를 사용한다.

## 명령

```sh
npm run content -- init animals-easy-new 동물 easy '새로운 동물 소풍'
# work/content/<id>에 원본·변경 이미지, metadata.json, puzzle.json, 썸네일 완성
npm run content -- stage animals-easy-new
npm run content -- review-image animals-easy-new
npm run dev
# 별도 승인 명령 없이 등록된 콘텐츠 전체를 빌드한다.
npm run build
```

`npm run dev`와 `npm run build`는 모두 등록된 게임 전체를 포함한다. 검수 승인 절차와 게임별 승인 기록은 사용하지 않는다. `npm run check`는 파일 형식·이미지 크기·정답 개수·좌표 범위를 검사한다.

`npm run build`는 데이터 검사와 함께 산출물의 누락·변조·허용되지 않은 파일을 검사한다. 등록 게임이나 파일이 빌드 후 바뀌면 다시 빌드해야 한다. 제목·썸네일 변경은 진행 기록을 유지하고, 그림·실제 정답 영역 변경은 해당 게임의 진행 버전을 바꾼다.

`work/content/<id>/review.png`는 선택적인 품질 확인 이미지다. 제작 자료와 과거 `reviews/` 기록은 공개 파일에 포함하지 않는다. 과거 승인 기록은 빌드 포함 여부에 영향을 주지 않는다.

## 검수 체크리스트

### 차이 유형과 세로 재생성 — 2026-10-15

사용자 정정에 따라 기존 가로 게임 18개를 삭제하고 가로 모드 좌우 비교에 맞는 4:5 세로 그림으로 새로 제작했다. ‘키 큰 나무 아래 소풍’은 2026-10-28 사용자 요청으로 목록에서 제거하고 `work/archive/removed-animals-easy-picnic-portrait-20261028/`에 보관했다. 2026-10-28~29에 12개를 추가해 현재 30개 게임·250개 정답이다. 모든 원본·변경 그림은 1120×1400이며 썸네일은 여백 없는 480×600이다. 추가 기록은 [30개 콘텐츠 확장](CONTENT-EXPANSION-30.md)을 따른다.

각 새 게임은 색깔·표정·개수·모양·무늬·유무를 섞었다. 쉬움 7개·보통 8개·어려움 10개의 정답을 유지한다. 계획과 프롬프트, 수정 시도는 `work/content/<id>/`, 일괄 상태는 `work/batches/portrait-replacement-18.json`에 있다. 이전 가로 원본은 활성 콘텐츠에서 제거하고 `work/archive/landscape-before-portrait-20261015/`에 제작 이력으로 보존했다.

차이 배분·난이도·이미지 검수·판정 영역의 기준은 [제작 품질 가이드](GAME-GENERATION-GUIDE.md)를 따른다. 자동 좌표 검사와 브라우저 테스트는 아이의 체감 난이도 검증을 대신하지 않는다.

### 이미지와 판정

- 정확히 난이도 개수만큼의 차이가 있고 의도하지 않은 차이가 없는가?
- 좌우 판정 영역이 실제 차이를 포함하고 다른 정답과 겹치지 않는가?
- 양쪽 어디서 눌러도 같은 정답이 처리되고 재터치 시 중복 처리되지 않는가?
- 확대 상태와 세로·가로에서 판정이 맞는가?
- 힌트가 주변을 보여주고 정답을 자동 처리하지 않는가?

Codex의 검증 통과는 부모의 직접 검수나 실제 iPad 검증을 의미하지 않는다.

## 일괄 계획

```sh
npm run batch -- all all 1
npm run content -- batch-status work/batches/<파일>.json <game-id> generated '생성 완료, 직접 검수 대기'
```

계획 파일은 이미지 도구의 작업 목록이다. npm 명령 자체는 이미지 생성 API를 호출하지 않는다. 실패 항목만 재실행하고 성공한 이미지는 보존한다.


## 숨은그림찾기 — 2026-10-29

숨은그림은 kind=hidden인 장면 한 장과 targets 목록을 사용한다. 목표는 물건 자체만 있는 투명 이미지이며 주변 배경을 잘라 보여주는 방식은 사용하지 않는다. [숨은그림 콘텐츠 계약](HIDDEN-CONTENT.md)이 파일·검수·보존 규칙의 기준이다. 기존 틀린그림찾기의 그림 쌍과 좌우 판정 규칙은 유지한다. 사용자 교정을 반영해 숨은그림 30개를 평면 잉크선·중성색 투명 목표로 제작하며, 30개 개선본을 등록했다. 기존 틀린그림30개·정답250개와 합쳐60개·정답500개다. 제작 자료와 실패 후보는 work/hidden-content에 보존했다. 최종 검사 근거는 [숨은그림 데이터 검사](verification/hidden-content-final.json)를 따른다.

후속 [물건 이름·형태 대조 검토](verification/hidden-shape-audit-20261029.md)에서 발견한 수정 필요 18개와 추가 확인 대상 17개를 [형태 개선 작업](verification/hidden-shape-fix-20261029.md)으로 처리했다. 19개 게임에서 장면 18장과 목표 카드 35개를 교정했다. 물건 이름·정답 ID·개수는 유지했으며 필요한 판정 영역을 조정했다. 수정 게임의 전체 목표 157개를 다시 시각 검수했고, 60개 게임 빌드·콘텐츠 단위 검사 5개·Chromium/WebKit 브라우저 검사 12개를 통과했다. 기존 틀린그림찾기 30개와 다른 숨은그림 11개는 파일 해시로 보존을 확인했다. 실제 iPad·주아 검증과 공개 배포는 수행하지 않았다.
