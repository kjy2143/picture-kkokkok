# 숨은그림 물건 이름·형태 대조 검토 — 2026-10-29

후속 [형태 개선 작업](hidden-shape-fix-20261029.md)에서 아래 수정 필요 18개와 추가 확인 대상 17개를 모두 처리했다. 이 문서의 관찰·비교 이미지·파일 해시는 수정 전 상태의 기록이다.

현재 등록된 숨은그림 **30개·목표 250개**를 검토했다. **수정 필요 18개(11개 게임)**와 재검토 권장 17개를 발견했다. 나머지 215개에서는 이번 기준으로 명확한 문제를 발견하지 못했다. 이는 전체 품질·난이도 합격을 뜻하지 않는다.

검토 요청에서 지적한 ‘우리 집 아침 식탁’의 종·나비·숟가락 문제를 모두 확인했다. 공개 콘텐츠 파일과 앱 코드는 변경하지 않았다. 공개 배포도 수행하지 않았다.

## 검토 범위와 방법

- 옛 제작 원본이나 이전 검수 합격 기록 대신 현재 `content/games/hidden-*/scene.webp`, 목표 PNG, `puzzle.json`을 기준으로 삼았다.
- 30개 장면 전체를 보고 목표 위치의 확대 그림 250개와 카드 250개를 각각 대조했다. 의심 항목은 추가로 확대했다.
- 이름이 같은 종류의 물건을 가리키는지, 특징적인 구조가 남아 있는지, 카드와 장면의 주요 윤곽·부품 수·끝 모양이 대응하는지 확인했다.
- 위장에 필요한 색·재질·방향 변화는 오류로 보지 않았다. 다른 사물 안에 숨겼다는 이유만으로 오류로 판정하지 않았다. 물건을 알아보는 핵심 특징이 없어지거나 카드와 다른 외곽이 되는 경우를 구분했다.
- ‘수정 필요’는 시각적으로 확인한 문제다. ‘재검토 권장’은 해석이 갈리거나 위장과 형태 훼손의 경계가 불분명한 항목이다.

자동 검사 `npm run content -- check`는 ‘60개 게임 데이터 검사 통과’였다. 데이터 검사는 이름의 뜻과 그림의 형태를 검증하지 않으므로 아래 문제와 양립한다. 실제 iPad·주아의 식별 및 난이도는 확인하지 않았다. 기존 틀린그림찾기 30개는 카드·장면 대조 구조가 없어 이번 시각 검토 범위에서 제외했다.

[전체 비교표 및 확대 이미지](../../work/reviews/hidden-shape-audit-20261029/) · [250개 항목 상태·원본 SHA-256·상세 기록](hidden-shape-audit-20261029.json)

## 수정 필요 18개

### 이름 불일치 — 9개

| 게임·목표 | 확인한 문제 | 권장 수정 |
| --- | --- | --- |
| [우리 집 아침 식탁 · 2번 종](../../work/reviews/hidden-shape-audit-20261029/hidden-daily-easy-01.png) | 카드와 장면 모두 전등갓이다. 종을 구분하는 종추가 없고 천장 전선과 연결된다. | 종을 유지하려면 종추·벌어진 입구를 가진 종 윤곽을 장면과 카드에 함께 만든다. 전등으로 이름만 바꾸면 일반 사물 찾기가 되므로 숨김 기준도 다시 확인한다. |
| [우리 집 아침 식탁 · 7번 나비](../../work/reviews/hidden-shape-audit-20261029/hidden-daily-easy-01.png) | 카드와 장면 모두 가운데 매듭과 아래로 늘어진 끈 두 가닥이 있다. 나비의 몸통·더듬이가 없고 커튼을 묶는 리본으로 읽힌다. | 나비를 유지하려면 몸통·더듬이·위아래 날개를 가진 윤곽으로 두 그림을 함께 고친다. |
| [시끌벅적 과일 가게 · 3번 종](../../work/reviews/hidden-shape-audit-20261029/hidden-daily-hard-04.png) | 갓 아래 물방울형 전구와 전선이 보인다. 카드도 전구를 그대로 그려 종보다 조명으로 읽힌다. | 전구를 종추로 취급하지 말고 종의 구조로 장면과 카드를 다시 제작한다. |
| [시끌벅적 과일 가게 · 7번 포크](../../work/reviews/hidden-shape-audit-20261029/hidden-daily-hard-04.png) | 장면의 도구 끝은 막혀 있고 내부에 길쭉한 구멍 세 개가 있다. 카드의 포크처럼 끝이 갈라진 살이 없다. 구멍 난 뒤집개로 보인다. | 포크를 유지하려면 끝이 열린 여러 갈래의 살을 만든다. 뒤집개로 바꾸려면 카드와 이름을 함께 고친다. |
| [즐거운 캠핑장 · 9번 별](../../work/reviews/hidden-shape-audit-20261029/hidden-daily-hard-05.png) | 정답 위치에는 가운데 노란 꽃술과 둥근 흰 꽃잎 다섯 장이 있다. 카드의 별 윤곽과 다르고 꽃으로 읽힌다. | 다른 꽃과 구별되는 별 윤곽을 계획해 장면과 카드를 함께 교정한다. |
| [별빛 우주 정원 · 5번 깃털](../../work/reviews/hidden-shape-audit-20261029/hidden-space-medium-02.png) | 카드와 장면 모두 매끈한 잎 가장자리와 가지처럼 갈라지는 잎맥이 있다. 주변 잎과 구별되는 깃털의 깃가지·깃대 단서가 부족해 잎으로 읽힌다. | 깃털을 유지하려면 노출된 깃대와 깃가지가 보이는 고유한 외곽을 장면과 카드에 만든다. |
| [동물 친구들의 버스 · 7번 나비](../../work/reviews/hidden-shape-audit-20261029/hidden-transport-easy-01.png) | 카드와 장면 모두 매듭과 늘어진 끈을 가진 리본이다. 나비의 몸통·더듬이 구조가 없다. | 나비를 유지하려면 나비의 구조를 가진 위장 윤곽으로 다시 제작한다. |
| [비행장 견학 · 4번 포크](../../work/reviews/hidden-shape-audit-20261029/hidden-transport-medium-03.png) | 카드와 수레 무늬의 살이 손잡이 방향에 직각으로 붙어 있다. 포크보다 손잡이 달린 빗의 구조다. | 포크의 살과 손잡이가 같은 길이 방향을 향하도록 장면과 카드를 함께 고친다. |
| [비행장 견학 · 8번 종](../../work/reviews/hidden-shape-audit-20261029/hidden-transport-medium-03.png) | 매달린 갓 아래 흰 전구가 보이고 위에는 전선이 있다. 카드도 같은 조명 구조라 종으로 부르기 어렵다. | 전등의 전구를 종추로 간주하지 말고 종의 특징을 갖춘 윤곽을 다시 계획한다. |

### 물건 형태 어색함 — 2개

| 게임·목표 | 확인한 문제 | 권장 수정 |
| --- | --- | --- |
| [토끼의 작은 정원 · 6번 초승달](../../work/reviews/hidden-shape-audit-20261029/hidden-animals-easy-01.png) | 카드와 천의 양 끝이 모두 둥글고 두껍다. 뾰족한 두 끝과 안쪽 원호를 가진 초승달보다 구부러진 양말·콩 형태에 가깝다. | 초승달의 두 끝이 가늘어지는 윤곽으로 장면과 카드를 함께 교정한다. |
| [은하 도서관 · 7번 숟가락](../../work/reviews/hidden-shape-audit-20261029/hidden-space-hard-05.png) | 카드와 책갈피 무늬 모두 양 끝에 같은 크기의 타원형 뜨는 부분이 있다. 일반적인 숟가락의 한쪽 머리·한쪽 손잡이 구조가 아니다. | 한쪽 끝을 가느다란 손잡이로 바꾸고 다른 쪽만 뜨는 부분으로 남긴다. |

### 카드·장면 윤곽 불일치 — 7개

| 게임·목표 | 확인한 문제 | 권장 수정 |
| --- | --- | --- |
| [우리 집 아침 식탁 · 4번 숟가락](../../work/reviews/hidden-shape-audit-20261029/hidden-daily-easy-01.png) | 카드는 한쪽에만 뜨는 부분이 있다. 의자 무늬는 양 끝이 타원으로 부풀고 가운데가 잘록해 양쪽 머리 형태다. | 장면의 한쪽 끝을 가느다란 손잡이로 교정하고 같은 윤곽으로 목표를 제작한다. |
| [시끌벅적 과일 가게 · 4번 망치](../../work/reviews/hidden-shape-audit-20261029/hidden-daily-hard-04.png) | 카드의 망치 머리는 반듯한 직사각형이다. 상자 무늬의 머리는 굴곡과 잘록한 부분이 있는 다른 윤곽이다. | 장면에서 사용할 망치 종류와 머리 윤곽을 먼저 정하고 카드도 동일하게 맞춘다. |
| [바닷속 음악회 · 8번 리본](../../work/reviews/hidden-shape-audit-20261029/hidden-animals-medium-04.png) | 카드는 좌우 매듭 고리만 있다. 장면에는 매듭 아래로 내려오는 긴 끈 두 가닥이 추가된다. | 고리와 늘어진 끈의 개수·길이를 장면과 카드에서 맞춘다. |
| [공주의 꽃다발 · 5번 열쇠](../../work/reviews/hidden-shape-audit-20261029/hidden-princess-easy-01.png) | 카드에는 위쪽 나선 고리 하나와 짧은 이 두 개가 있다. 장면에서는 자루 오른쪽의 큰 두 번째 나선이 붙어 카드와 다른 열쇠 윤곽을 만든다. | 정답 열쇠의 고리·자루·이를 주변 문양과 구분한 뒤 카드와 같은 윤곽으로 정리한다. |
| [동물 친구들의 버스 · 2번 물고기](../../work/reviews/hidden-shape-audit-20261029/hidden-transport-easy-01.png) | 카드는 왼쪽에 두 갈래 꼬리가 있다. 장면의 왼쪽 끝은 둥글게 말린 소용돌이여서 물고기 꼬리의 갈라짐이 없다. | 왼쪽 꼬리의 두 갈래 구조를 카드와 장면에서 맞춘다. |
| [동물 친구들의 버스 · 4번 숟가락](../../work/reviews/hidden-shape-audit-20261029/hidden-transport-easy-01.png) | 카드는 짧고 곧은 손잡이로 끝난다. 버스 문 손잡이는 아래에서 U자로 꺾여 옆의 둥근 부품으로 이어져 끝 윤곽이 다르다. | 숟가락으로 읽히는 하나의 완결된 윤곽을 정하고 주변 문 부품과 분리해 목표에도 반영한다. |
| [눈 내리는 역 · 8번 조개](../../work/reviews/hidden-shape-audit-20261029/hidden-transport-hard-05.png) | 카드는 부채꼴 조개와 아래 받침이다. 장면은 부채꼴 위에 천이 이어지고 아래에는 긴 술 여러 가닥이 달려 조개 전체 윤곽과 다르다. | 천 속에서 하나의 조개로 닫히는 윤곽을 만들고 그 실제 형태와 카드의 테두리를 맞춘다. |

## 재검토 권장 17개

아래는 확정 오류 개수에 포함하지 않았다. 실제로 같은 물건의 윤곽을 끝까지 따라갈 수 있는지 확인할 필요가 있다.

| 게임·목표 | 의심되는 부분 | 다음 확인 |
| --- | --- | --- |
| [놀이터의 오후 · 6번 사과](../../work/reviews/hidden-shape-audit-20261029/hidden-daily-easy-02.png) | 장면은 하트형 잎에 가깝고 카드에 있는 사과 꼭지가 명확하지 않다. | 꼭지와 과일 밑부분을 확대해 확인하고 사과 고유의 단서를 보강한다. |
| [시끌벅적 과일 가게 · 2번 리본](../../work/reviews/hidden-shape-audit-20261029/hidden-daily-hard-04.png) | 리본의 고리·늘어진 부분이 모두 잎으로 이어져 카드의 리본 끈 끝과 다르다. | 잎 모양으로 위장하더라도 리본의 매듭·고리·끈 끝이 함께 읽히는지 확인한다. |
| [시끌벅적 과일 가게 · 10번 신발](../../work/reviews/hidden-shape-audit-20261029/hidden-daily-hard-04.png) | 카드는 둥근 앞코와 굽·밑창이 있는 신발이다. 돌바닥 무늬는 각진 윤곽과 끈 위주여서 앞코와 밑창의 대응이 약하다. | 원근 차이를 고려해도 같은 신발로 대응되는지 재검토한다. |
| [다람쥐의 도토리 집 · 8번 나비](../../work/reviews/hidden-shape-audit-20261029/hidden-animals-medium-03.png) | 카드는 둥글고 넓은 윗날개다. 장면은 끝이 좁아지고 톱니가 있는 잎 모양 윗날개다. 몸통과 더듬이는 확인된다. | 나비 이름은 유지할 수 있으나 네 날개의 바깥 윤곽과 비율을 더 가깝게 맞춘다. |
| [바닷속 음악회 · 3번 장갑](../../work/reviews/hidden-shape-audit-20261029/hidden-animals-medium-04.png) | 장갑 카드와 산호 윤곽 모두 긴 중앙 부분의 좌우에 돌출부가 있다. 엄지가 두 개인 벙어리장갑으로 오해할 수 있다. | 손목 주름과 엄지를 구분해 엄지 하나·나머지 손가락 묶음 하나로 명확하게 정리한다. |
| [성의 작은 찻집 · 1번 깃털](../../work/reviews/hidden-shape-audit-20261029/hidden-princess-easy-02.png) | 카드는 둥근 깃가지가 있지만 장면은 뾰족한 톱니 잎과 가지의 연결로 읽힌다. | 깃털의 외곽과 노출된 깃대를 장면에서 따로 식별할 수 있는지 확인한다. |
| [성의 작은 찻집 · 6번 초승달](../../work/reviews/hidden-shape-audit-20261029/hidden-princess-easy-02.png) | 정답은 찻잔 받침의 노출된 띠다. 컵에 가린 부분 때문에 카드의 두 뾰족한 끝과 닫힌 초승달 윤곽이 모두 드러나는지 불명확하다. | 실제 보이는 경계만으로 초승달이 완성되는지 재검토한다. |
| [무도회 준비실 · 1번 깃털](../../work/reviews/hidden-shape-audit-20261029/hidden-princess-medium-03.png) | 꽃다발 안의 톱니 잎 여러 장과 겹친다. 카드의 깃털 하나를 대응시킬 외곽과 깃대의 분리가 약하다. | 깃털 하나의 윤곽이 다른 잎에 가리지 않고 끝까지 이어지는지 확인한다. |
| [꼬마 용의 숲속 집 · 3번 물고기](../../work/reviews/hidden-shape-audit-20261029/hidden-fairytale-easy-01.png) | 카드는 가늘고 긴 몸에 두 갈래 꼬리가 있다. 장면의 물결은 더 넓은 몸을 만들며 꼬리가 주변 물결과 합쳐져 있다. | 눈·몸·두 갈래 꼬리가 카드와 한 물고기로 대응되는지 확인한다. |
| [꼬마 용의 숲속 집 · 5번 깃털](../../work/reviews/hidden-shape-audit-20261029/hidden-fairytale-easy-01.png) | 장면에서는 고사리 잎의 갈라지는 잔잎으로 읽힌다. 카드의 하나로 이어진 깃털 가장자리와 구조가 다르다. | 깃대·깃가지로 읽히는 윤곽과 고사리 잔잎의 경계를 구분할 수 있는지 확인한다. |
| [구름 위의 놀이터 · 6번 하트](../../work/reviews/hidden-shape-audit-20261029/hidden-fairytale-medium-04.png) | 카드 자체가 하트와 큰 나선의 결합이다. 장면은 구름 소용돌이와 경계가 이어져 일반적인 하트의 두 둥근 윗부분과 아래 꼭짓점이 약하다. | 하트 하나의 완결된 외곽을 정하고 주변 구름 선과 구분한다. |
| [우주 정거장의 축제 · 2번 활](../../work/reviews/hidden-shape-audit-20261029/hidden-space-hard-04.png) | 정답 위치는 원형 창틀의 일부다. 카드에 있는 활시위의 곧은 선을 장면에서 명확하게 분리하기 어렵다. | 활 몸체의 두 끝을 잇는 시위를 포함해 같은 활이 완성되는지 확인한다. |
| [동물 친구들의 버스 · 6번 열쇠](../../work/reviews/hidden-shape-audit-20261029/hidden-transport-easy-01.png) | 펜스의 둥근 기둥과 가로대가 열쇠처럼 이어지지만 세로 기둥이 크게 내려와 카드의 열쇠 끝과 다르다. | 열쇠 머리·자루·이를 어느 경계로 읽을지 정하고 닫힌 윤곽을 확인한다. |
| [비행장 견학 · 3번 왕관](../../work/reviews/hidden-shape-audit-20261029/hidden-transport-medium-03.png) | 왕관 카드의 밑변에 대응하는 선이 수풀에 없다. 수관의 둥근 돌출부만으로 왕관을 추측해야 한다. | 왕관 윗부분과 밑부분을 함께 식별할 수 있는지 확인한다. |
| [비행장 견학 · 6번 리본](../../work/reviews/hidden-shape-audit-20261029/hidden-transport-medium-03.png) | 카드는 대칭인 네 갈래 리본이다. 장면은 목을 두른 스카프의 매듭과 비대칭인 긴 끈으로 구성된다. | 매듭·고리·끈의 실제 개수와 길이에 맞춰 카드의 형태를 대조한다. |
| [북적북적 항구 · 5번 망치](../../work/reviews/hidden-shape-audit-20261029/hidden-transport-hard-04.png) | 장면에는 수평 긴 들보·수직 기둥·대각 지지대가 있다. 그중 어느 부분이 카드의 짧은 망치 머리와 긴 자루인지 경계가 불명확하다. | 크레인 전체를 망치로 간주하지 말고 머리와 자루만으로 완성되는 윤곽을 확인한다. |
| [눈 내리는 역 · 10번 하트](../../work/reviews/hidden-shape-audit-20261029/hidden-transport-hard-05.png) | 정답 위치는 겹친 눈더미다. 카드의 두 둥근 윗부분과 가운데 홈을 같은 눈덩이 경계에서 분리하기 어렵다. | 하트의 두 윗부분·가운데 홈·아래 꼭짓점이 하나의 외곽에 있는지 확인한다. |

## 게임별 검토 범위

‘추가 문제 미발견’은 이번 이름·형태 대조에서의 판정이다. 위장 품질·배치·재미·난이도·실기기 입력 합격을 뜻하지 않는다.

| 게임 | 목표 수 | 수정 필요 | 재검토 권장 | 추가 문제 미발견 |
| --- | ---: | ---: | ---: | ---: |
| [토끼의 작은 정원](../../work/reviews/hidden-shape-audit-20261029/hidden-animals-easy-01.png) | 7 | 1 | 0 | 6 |
| [숲속 친구들의 소풍](../../work/reviews/hidden-shape-audit-20261029/hidden-animals-easy-02.png) | 7 | 0 | 0 | 7 |
| [다람쥐의 도토리 집](../../work/reviews/hidden-shape-audit-20261029/hidden-animals-medium-03.png) | 8 | 0 | 1 | 7 |
| [바닷속 음악회](../../work/reviews/hidden-shape-audit-20261029/hidden-animals-medium-04.png) | 8 | 1 | 1 | 6 |
| [동물 마을의 가을 장터](../../work/reviews/hidden-shape-audit-20261029/hidden-animals-hard-05.png) | 10 | 0 | 0 | 10 |
| [달 토끼의 산책](../../work/reviews/hidden-shape-audit-20261029/hidden-space-easy-01.png) | 7 | 0 | 0 | 7 |
| [별빛 우주 정원](../../work/reviews/hidden-shape-audit-20261029/hidden-space-medium-02.png) | 8 | 1 | 0 | 7 |
| [로봇의 행성 탐험](../../work/reviews/hidden-shape-audit-20261029/hidden-space-medium-03.png) | 8 | 0 | 0 | 8 |
| [우주 정거장의 축제](../../work/reviews/hidden-shape-audit-20261029/hidden-space-hard-04.png) | 10 | 0 | 1 | 9 |
| [은하 도서관](../../work/reviews/hidden-shape-audit-20261029/hidden-space-hard-05.png) | 10 | 1 | 0 | 9 |
| [공주의 꽃다발](../../work/reviews/hidden-shape-audit-20261029/hidden-princess-easy-01.png) | 7 | 1 | 0 | 6 |
| [성의 작은 찻집](../../work/reviews/hidden-shape-audit-20261029/hidden-princess-easy-02.png) | 7 | 0 | 2 | 5 |
| [무도회 준비실](../../work/reviews/hidden-shape-audit-20261029/hidden-princess-medium-03.png) | 8 | 0 | 1 | 7 |
| [보석 공방의 오후](../../work/reviews/hidden-shape-audit-20261029/hidden-princess-hard-04.png) | 10 | 0 | 0 | 10 |
| [장미 정원의 축제](../../work/reviews/hidden-shape-audit-20261029/hidden-princess-hard-05.png) | 10 | 0 | 0 | 10 |
| [꼬마 용의 숲속 집](../../work/reviews/hidden-shape-audit-20261029/hidden-fairytale-easy-01.png) | 7 | 0 | 2 | 5 |
| [요정의 꽃잎 배](../../work/reviews/hidden-shape-audit-20261029/hidden-fairytale-easy-02.png) | 7 | 0 | 0 | 7 |
| [버섯 마을의 빵집](../../work/reviews/hidden-shape-audit-20261029/hidden-fairytale-medium-03.png) | 8 | 0 | 0 | 8 |
| [구름 위의 놀이터](../../work/reviews/hidden-shape-audit-20261029/hidden-fairytale-medium-04.png) | 8 | 0 | 1 | 7 |
| [마법사의 장난감 가게](../../work/reviews/hidden-shape-audit-20261029/hidden-fairytale-hard-05.png) | 10 | 0 | 0 | 10 |
| [동물 친구들의 버스](../../work/reviews/hidden-shape-audit-20261029/hidden-transport-easy-01.png) | 7 | 3 | 1 | 3 |
| [꽃길을 달리는 기차](../../work/reviews/hidden-shape-audit-20261029/hidden-transport-medium-02.png) | 8 | 0 | 0 | 8 |
| [비행장 견학](../../work/reviews/hidden-shape-audit-20261029/hidden-transport-medium-03.png) | 8 | 2 | 2 | 4 |
| [북적북적 항구](../../work/reviews/hidden-shape-audit-20261029/hidden-transport-hard-04.png) | 10 | 0 | 1 | 9 |
| [눈 내리는 역](../../work/reviews/hidden-shape-audit-20261029/hidden-transport-hard-05.png) | 10 | 1 | 1 | 8 |
| [우리 집 아침 식탁](../../work/reviews/hidden-shape-audit-20261029/hidden-daily-easy-01.png) | 7 | 3 | 0 | 4 |
| [놀이터의 오후](../../work/reviews/hidden-shape-audit-20261029/hidden-daily-easy-02.png) | 7 | 0 | 1 | 6 |
| [우리 동네 도서관](../../work/reviews/hidden-shape-audit-20261029/hidden-daily-medium-03.png) | 8 | 0 | 0 | 8 |
| [시끌벅적 과일 가게](../../work/reviews/hidden-shape-audit-20261029/hidden-daily-hard-04.png) | 10 | 3 | 2 | 5 |
| [즐거운 캠핑장](../../work/reviews/hidden-shape-audit-20261029/hidden-daily-hard-05.png) | 10 | 1 | 0 | 9 |

## 수정 작업 시 적용할 기준

1. 종·나비·포크처럼 다른 물건으로 읽히는 항목부터 고친다. 이름만 바꾸어 전등·리본 자체를 찾게 하면 숨은 모양 찾기라는 목표가 약해질 수 있으므로 장면과 카드를 함께 재계획한다.
2. 장면에 확정한 윤곽을 기준으로 투명 목표를 제작한다. 카드에서 부품을 더하거나 빼지 않는다. 중성색과 단순화는 허용하되 머리·손잡이·꼬리·끈·날개의 핵심 구조를 유지한다.
3. 수정한 각 항목의 이름·카드·장면을 다시 대조한다. 장면을 편집하면 같은 게임의 다른 목표와 판정 영역도 재확인한다. 기존 성공 버전은 보존한다.

기존 제작 기록은 종을 전등갓 윤곽으로, 나비를 커튼 끈 네 갈래로 인정했다. 이번 사용자 교정과 현재 시각 검토에서는 그 유사성만으로 물건의 정체성이 보존됐다고 보지 않는다. 이전 ‘검토 완료’ 기록은 이 후속 검토의 문제를 해소한 근거가 아니다.
