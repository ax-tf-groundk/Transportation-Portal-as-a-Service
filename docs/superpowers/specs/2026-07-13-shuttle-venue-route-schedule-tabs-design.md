# 행사장 셔틀(shuttle-venue.html) 노선×날짜 탭 + U자형 노선도 — 설계 문서

- **작성일**: 2026-07-13
- **상태**: 승인 완료 (브레인스토밍 대화로 확정)
- **대상 파일**: `aphrs-2026-transport/shuttle-venue.html`, `aphrs-2026-transport/assets/transport.css`
- **데이터 출처**: `D:\Works\Active\APHRS2026\APHRS 2026 행사장 셔틀 운영 계획_260713.pptx` → 정리본 `D:\Works\Active\APHRS2026\APHRS2026_행사장셔틀_노선및시간표_정리.md`

---

## 1. 배경 / 문제

현재 `shuttle-venue.html`은 "운행 노선"과 "운행 시간표"가 서로 다른 정적 섹션으로 분리돼 있고, 시간표는 **날짜 구분 없는 가짜(placeholder) 시간**이 하드코딩돼 있다. 실제로는 노선(A/B)뿐 아니라 **날짜(10/21~24)마다 운영시간대·배차간격이 전부 다르고**, 10/23에는 Faculty Dinner 전용 셔틀이 별도로 추가된다 — 이 데이터는 방금 공식 PPTX에서 확보했다.

또한 두 노선 모두 **왕복(호텔→BEXCO / BEXCO→호텔)** 구조인데, 현재는 이를 별개의 "귀환" 카드로 어색하게 표현하고 있다.

## 2. 목표

1. 노선 탭(A/B)을 선택하면 **노선도(U자형)와 시간표가 함께 바뀐다**.
2. 그 안에 날짜 탭(10/21·22·23·24)을 두어, **선택한 날짜의 실제 운영시간표만** 보인다.
3. 왕복 노선을 **U자형(위=가는 편, 아래=오는 편, 오른쪽에서 곡선으로 연결)** 다이어그램으로 표현한다.
4. 10/23 탭 안에는 Faculty Dinner 셔틀(노선 무관 공통 노출)이 포함된다.
5. 가짜 시간표 데이터를 PPTX 기반 실제 수치로 전량 교체한다.

## 3. 정보구조 / 상태관리

### 3.1 상태 축 2개 (직교)

- **노선축** `data-vr`: `a` | `b`
- **날짜축** `data-vd`: `1021` | `1022` | `1023` | `1024`

`airport-transfer.html`의 `html[data-mode]` 관용구와 동일하게, **빌드 없는 정적 HTML + CSS 토글**로 구현한다(브레인스토밍에서 확정 — 이 프로젝트는 시종일관 정적 HTML이 정본이라, 시간표 데이터를 JS 객체로 옮기면 이 페이지만 관례가 어긋나 유지보수 시 grep으로 못 찾는 문제가 생김. 방문자 경험엔 영향 없지만 팀 컨벤션 일관성을 위해 정적 HTML 8블록 방식 채택).

```html
<html lang="ko" data-vr="a" data-vd="1021">
```

각 콘텐츠 블록(노선도+시간표 세트)은 `vr-a`/`vr-b` 클래스와 `vd-1021`~`vd-1024` 클래스를 **함께** 가진다. CSS는 두 조건을 AND로 결합해 숨김 처리:

```css
html:not([data-vr="a"]) .vr-a{display:none}
html:not([data-vr="b"]) .vr-b{display:none}
html:not([data-vd="1021"]) .vd-1021{display:none}
html:not([data-vd="1022"]) .vd-1022{display:none}
html:not([data-vd="1023"]) .vd-1023{display:none}
html:not([data-vd="1024"]) .vd-1024{display:none}
```

→ 8개(2×4) 블록 전부 정적으로 미리 렌더링, 탭 클릭 시 JS는 `data-vr`/`data-vd` 속성만 바꾼다(로직은 `airport-transfer.html`의 tab click 핸들러와 동일 패턴 재사용).

### 3.2 탭 UI 레이아웃

```
[ A 노선 ]  [ B 노선 ]          ← 1단: 노선 탭 (.limo-tabs 스타일 재사용)
[10/21] [10/22] [10/23] [10/24] ← 2단: 날짜 탭 (동일 컴포넌트, 색만 구분)

┌─ U자형 노선도 (선택된 노선 1개만) ───────┐
│  기점 → 중간 → BEXCO                    │
│  기점 ← 중간 ← BEXCO   (곡선 연결)       │
└──────────────────────────────────────────┘

운영시간 안내 문구 (날짜별)
[가는 편 시간표]   [오는 편 시간표]

(10/23 한정, 노선 무관 공통 노출)
┌─ Faculty Dinner 셔틀 안내 + 시간표 ──────┐
└──────────────────────────────────────────┘
```

Faculty Dinner 블록은 `vd-1023` 클래스만 가지고 `vr-a`/`vr-b` 어느 쪽에도 속하지 않음 → 날짜만 10/23이면 노선 선택과 무관하게 노출.

## 4. U자형 노선도 마크업 (CSS `border-radius` 연결)

정류장이 노선당 3개(기점·중간·BEXCO)뿐이라 `airport-transfer.html`의 다중 정류장용 CSS Grid 기법은 과함 — 참고 사이트(busansandan.rideus.net)의 `line-forward`/`line-reverse`/`line-end` **박스 border-radius 연결 기법**을 3정류장 규모로 단순화해서 차용한다.

```html
<div class="uroute vr-a vd-1021">
  <div class="uroute-row">
    <div class="uroute-stop"><span class="ar">→</span>파라다이스</div>
    <div class="uroute-stop"><span class="ar">→</span>시그니엘</div>
    <div class="uroute-stop uroute-end"><span class="ar">→</span>BEXCO</div>
  </div>
  <div class="uroute-row uroute-return">
    <div class="uroute-stop uroute-end"><span class="ar">→</span>BEXCO</div>
    <div class="uroute-stop"><span class="ar">→</span>시그니엘</div>
    <div class="uroute-stop"><span class="ar">→</span>파라다이스</div>
  </div>
</div>
```

- 각 행은 좌→우 읽기(화살표 `→`로 진행 방향 표시). 아래 행(귀환)도 시각적으로 좌→우 배치하되, 맨 왼쪽 라벨이 "BEXCO"로 시작해 실제로는 반대 방향 이동임을 자연스럽게 인지시킴(사용자 확정 사항: "화살표가 양 종점과 기점에서 좌에서 우로").
- 오른쪽 끝(`.uroute-end`, 위/아래 공통 "BEXCO")을 감싸는 wrapper에 `border-radius`(우측만 둥글게, `0 40px 40px 0`류)를 적용해 위·아래 행이 오른쪽에서 하나의 곡선으로 이어지는 것처럼 보이게 한다 — 참고 사이트의 `.line-end.line-forward{border-radius:0 40px 40px 0}` / `.line-end.line-reverse{border-radius:40px 0 0 40px}` 조합을 그대로 응용.
- 왼쪽 끝(기점)은 열린 채로 둔다(닫힌 도형 아님 — "왼쪽으로 90도 돌린 U자, 열린 쪽이 좌측"이라는 요구사항 그대로).

## 5. 데이터 반영 (실제 PPTX 수치)

`APHRS2026_행사장셔틀_노선및시간표_정리.md`의 표를 그대로 8블록에 옮긴다. 날짜별 핵심 차이:

| 날짜 | 운영시간 요약 |
|---|---|
| 10/21(수) | 집중 07:00-10:00 · 일반 08:30-17:00 · 집중 17:30-18:20 |
| 10/22(목) | 집중 07:20-08:00 · 일반 09:00-17:00 · 집중 17:00-18:30 · **리셉션 19:40/19:50** |
| 10/23(금) | 집중 07:20-08:00 · 일반 09:00-17:00 · 집중 17:00-17:30 · **17시 이후 시그니엘까지 연장** · **Faculty Dinner 셔틀 별도** |
| 10/24(토) | 집중 07:20-08:00 · 일반 09:00-14:30 · 집중 15:20-16:00 (폐회일 단축) |

노선 A(파라다이스·시그니엘)와 노선 B(웨스틴조선·파크하얏트)는 소요시간·정차 간격이 미세하게 다르므로 블록마다 실제 표의 숫자를 그대로 사용한다(반올림·추정 금지).

Faculty Dinner 셔틀(10/23 전용): 만찬장행 17:00-17:30(10분 간격, 베뉴 셔틀 활용) + 귀환 20:00~20:18(2분 간격, 10대, 시그니엘→웨스틴조선→파크하얏트→(BEXCO 연장)). 기존 "TBD" 문구를 실제 확정 시각으로 교체.

## 6. 영향 범위 / 삭제 대상

- 기존 "운행 노선"(`#rt-h`) 섹션의 `.route-rows` 3카드(A/B/귀환) → 새 탭 구조로 대체, **삭제**.
- 기존 "운행 시간표"(`#sc-h`) 섹션의 `.sched-grid` 가짜 3열 표 → 새 탭 구조 안으로 흡수, **삭제**.
- 기존 "Faculty Dinner 셔틀"(`#fd-h`) 독립 섹션 → 10/23 탭 안으로 이동, 기존 섹션은 **삭제**(내용은 유지·시간만 확정치로 교체).
- 그랜드조선 해운대 투숙객 안내(`.warn-box`, 파라다이스 정류장 이용 안내)는 노선 A 공통 안내이므로 **유지**하되 위치를 새 구조 안(노선 A 블록 하단 또는 탭 구조 상단 공통 영역)으로 재배치.
- `transport.css`에 `.uroute`/`.uroute-row`/`.uroute-stop`/`.uroute-end` 등 신규 규칙 추가. 날짜·노선 탭 버튼은 `airport-transfer.html`의 `.limo-tab`/`.limo-tabs` 클래스를 그대로 재사용(신규 클래스 불필요, 페이지 간 일관성 유지).

## 7. 범위 밖 (YAGNI)

- 실시간 배차 위치, 만석 알림 등 동적 기능 없음(기존과 동일, 정적 데모).
- 모바일 전용 별도 레이아웃은 두지 않음 — `airport-transfer.html`의 반응형 탭 CSS(`@media(max-width:760px)`)를 그대로 상속.
- 언어 토글(ko/en)은 기존 `ko-only`/`en-only` 패턴 그대로 유지, 신규 로직 없음.

## 8. 검증 기준

- 노선 탭 A/B 전환 시 U자형 노선도 + 시간표가 즉시 함께 바뀌는지 (스크린샷 확인).
- 날짜 탭 4개 각각에서 표시되는 시간이 정리 문서의 실제 수치와 1:1 일치하는지.
- 10/23 탭에서 노선 A/B 어느 쪽을 선택해도 Faculty Dinner 블록이 항상 보이는지.
- 데스크톱(1280) 렌더 확인 우선, 이후 모바일(390) 탭 줄바꿈·U자형 다이어그램 붕괴 여부 확인.
- 버전 문자열(`?v=`, `SITE_VERSION`) 갱신 후 캐시 무효화 확인.
