# 행사장 셔틀(shuttle-venue.html) 노선×날짜 탭 + 직선 노선도 — 설계 문서

- **작성일**: 2026-07-13 (2026-07-14 1차 개정 — U자형 → 직선 노선도, 날짜 탭을 시간표 영역으로 이동, 시간표 형식을 공항↔호텔 페이지 형식으로 변경 / 2026-07-14 2차 개정 — 텍스트 화살표 노선도를 시각적 노선도로 교체, 방향별 시간표 내 집중/일반 서브테이블 통합 / 2026-07-14 3차 개정 — 시각적 노선도 구현을 ITS SVG 이식에서 **이 프로젝트 자체의 기존 `.route-map` 컴포넌트 재사용**으로 전환)
- **상태**: 승인 완료 (브레인스토밍 대화로 확정, 구현 완료 후 사용자 피드백으로 §2·§3.2·§4·§6 재개정 → 2차로 §2·§4·§6·§7·§8 추가 재개정 → 3차로 §4·§6·§7·§8 아키텍처 교체)
- **대상 파일**: `aphrs-2026-transport/shuttle-venue.html`(인라인 `<style>` 소폭 추가만, 신규 JS 없음)
- **데이터 출처**: `D:\Works\Active\APHRS2026\APHRS 2026 행사장 셔틀 운영 계획_260713.pptx` → 정리본 `D:\Works\Active\APHRS2026\APHRS2026_행사장셔틀_노선및시간표_정리.md`
- **디자인 참고 (3차 개정으로 교체)**: `aphrs-2026-transport/airport-transfer.html`이 이미 쓰고 있는 `.route-map`/`.rm-track`/`.rm-line`/`.rm-stop`/`.rm-dot`/`.rm-label`(CSS Grid 기반 순수 CSS 노선도, `transport.css` "Route Map" 섹션 ~L713+) + 같은 섹션의 미사용 `.rm-live`/`.rm-time`(펄스 애니메이션 있는 "실시간 위치" 배지, 정의는 돼 있으나 어떤 HTML에서도 쓰인 적 없던 죽은 CSS). ~~`its-2026-gangneung`의 `.rroute`/`buildSnake()` SVG 이식~~은 2차 개정에서 채택했으나, 이 프로젝트 자체에 더 가벼운(JS 0줄, 이미 검증된) 동등 컴포넌트가 있음을 뒤늦게 발견해 3차 개정에서 폐기.

> **2026-07-14 1차 개정 배경**: 최초 구현(U자형, 참고 사이트 busansandan.rideus.net의 곡선 연결 기법 차용)을 실제 렌더로 확인한 사용자가 "참고 사이트는 정류장이 16+8개라 곡선 다이어그램이 필요했지만, 우리 노선은 3정류장뿐이라 과했다"고 판단 — 노선도를 **날짜와 무관한 고정 직선 2줄**(가는 편/오는 편)로 단순화하고, 날짜 탭은 노선도가 아니라 **시간표 영역에만** 걸리도록 재배치. 시간표 형식도 세로형(행=회차)에서 `airport-transfer.html`의 가로형(열=회차, 행=정류장)으로 변경.
>
> **2026-07-14 2차 개정 배경**: 사용자가 `its-2026-gangneung`의 `.rroute` 노선도(점+연결선+대각선 라벨, 노선명 배지, "Live location" 버튼, 접이식 시간표)를 참고자료로 제시 — "노선도 스타일이 명확하고 노선 이름 표시, 실시간 차량 위치 보기 버튼 표기가 필요"하다는 요청. 브레인스토밍으로 범위를 좁힘: **노선도만 시각화로 교체**(정류장 3개뿐이라 U자형 곡선은 여전히 불필요 — 1차 개정의 "곡선은 과하다" 판단과 모순 없음), **접이식 시간표는 채택하지 않음**(실제 데이터가 균일 배차가 아니라 구간별로 배차간격이 달라 ITS의 균일-headway 자동생성 로직이 맞지 않음 — 기존 실데이터 기반 표를 그대로 사용), 대신 시간표 쪽에서는 그동안 같은 방향 안에서 "집중 운행"/"일반 운행"(+리셉션) 라벨로 나뉘어 있던 서브테이블들을 **시간순 하나의 표로 통합**(사용자 표현: "운행시간은 일반과 집중 구분말고 시간순으로"). **가는 편/오는 편의 방향별 분리는 유지**(다이어그램도 방향마다 별도 1개씩, 시간표도 방향마다 별도 블록 — 이 부분은 절대 합치지 않음, 사용자가 과거 반복된 실수 지점으로 명시 지적). "실시간 위치 확인" 버튼은 데모 placeholder 링크로 추가하고, 기존 "실시간 추적 미제공" 안내문과의 모순은 문구 수정으로 해소.
>
> **2026-07-14 3차 개정 배경**: 구현 계획 수립 중 `aphrs-2026-transport/airport-transfer.html`을 다시 살펴보다가, 2차 개정에서 ITS로부터 이식하려던 것과 **정확히 같은 목적의 컴포넌트가 이 프로젝트 자체에 이미 있음**을 발견 — `.route-map`(CSS Grid 노선도, 13~15개 정류장에서 이미 검증됨) + `.rm-live`(펄스 점 애니메이션까지 갖춘 "실시간 위치" 배지 스타일, 그러나 어떤 페이지에서도 실제로 쓰인 적 없는 죽은 CSS — 다른 프로젝트에서 새로 이식할 필요 없이 그대로 활성화하면 됨). 다른 리포(ITS)의 JS(`buildSnake`)를 포팅하는 대신 **같은 리포 안의 기존 CSS-only 컴포넌트를 재사용**하는 쪽이 신규 코드가 없고(JS 0줄), 이미 이 사이트에서 검증됐고, 탭 전환 시 숨겨진 컨테이너의 SVG 폭 계산 문제 자체가 발생하지 않는다는 점에서 명백히 우월해 채택.
>
> **2026-07-14 4차 개정 배경**: Task 1~3(CSS + 노선 A/B 마크업) 구현·리뷰 승인 후 실제 렌더 스크린샷을 본 사용자가 3가지 문제를 지적 — ① **게슈탈트 위반**: `.rm-head`(배지+텍스트+Live버튼)가 `.route-map` 카드 밖에 형제로 떠 있어 테두리(공통 영역)로 묶이지 않고 근접성만으로 느슨하게 암시됨. ② **중복 정보**: 이미 선택된 "A 노선" 탭과 똑같은 "A" 배지를 카드에 또 붙였고, "시그니엘 → 파라다이스 → BEXCO" 텍스트도 바로 아래 다이어그램이 이미 보여주는 정보를 그대로 반복. "가는 편"/"오는 편"이라는 방향 라벨보다 목적지 기준("행사장행"/"호텔행")이 더 직관적이라는 지적. ③ **비효율적 여백**: `.rm-track`의 185px 상단 패딩은 `airport-transfer.html`의 13~15개 정류장·긴 라벨 기준값이라, 3개 정류장·짧은 라벨뿐인 이 페이지엔 과도하게 큼. 대응: `.rm-head`를 `.route-map` 카드 **안으로** 이동(공통 영역으로 헤더+다이어그램 통합), 배지·정류장나열 텍스트 삭제, "가는 편"/"오는 편"을 "행사장행"/"호텔행"(ko)·"To Venue"/"To Hotel"(en)로 교체, `shuttle-venue.html` 전용으로 `.rm-track` 상단 패딩을 축소하는 스코프 오버라이드 추가(공유 `transport.css` 자체는 불변, `airport-transfer.html`엔 영향 없음). 아래 §4·§6·§8은 이 4차 개정을 반영한 최종본이다(§1·§2·§3·§5·§7은 3차 개정본 그대로 유효 — 방향 분리·placeholder 버튼·YAGNI 원칙은 변경 없음).

---

## 1. 배경 / 문제

현재 `shuttle-venue.html`은 "운행 노선"과 "운행 시간표"가 서로 다른 정적 섹션으로 분리돼 있고, 시간표는 **날짜 구분 없는 가짜(placeholder) 시간**이 하드코딩돼 있다. 실제로는 노선(A/B)뿐 아니라 **날짜(10/21~24)마다 운영시간대·배차간격이 전부 다르고**, 10/23에는 Faculty Dinner 전용 셔틀이 별도로 추가된다 — 이 데이터는 방금 공식 PPTX에서 확보했다.

또한 두 노선 모두 **왕복(호텔→BEXCO / BEXCO→호텔)** 구조인데, 현재는 이를 별개의 "귀환" 카드로 어색하게 표현하고 있다.

## 2. 목표

1. 노선 탭(A/B)을 선택하면 **그 노선의 노선도(직선 2줄)와 시간표 영역이 함께 바뀐다**. 노선도 자체는 날짜와 무관하게 고정 — 같은 노선이면 10/21이든 10/24든 동일하다.
2. 시간표 영역에 날짜 탭(10/21·22·23·24)을 두어, **선택한 날짜의 실제 운영시간표만** 보인다(노선도는 그대로, 표만 바뀜).
3. 왕복 노선을 **직선 2줄(위=가는 편, 아래=오는 편)** 로 표현한다 — U자형 곡선 연결은 정류장이 3개뿐인 이 노선 규모에는 과한 표현이라 폐기.
4. 10/23 탭 안에는 Faculty Dinner 셔틀(노선 무관 공통 노출)이 포함된다.
5. 가짜 시간표 데이터를 PPTX 기반 실제 수치로 전량 교체하고, 표 형식을 `airport-transfer.html`과 동일하게 **열=회차, 행=정류장**으로 통일한다.
6. **(2차 개정, 구현은 3차 개정에서 route-map 재사용으로 확정)** 텍스트 화살표 노선도를 **점+연결선+대각선 라벨이 있는 시각적 노선도**로 교체하고, 노선명을 배지+타이틀로 명확히 표시하며, "실시간 위치 확인" 데모 버튼을 붙인다. 가는 편·오는 편은 **각각 독립된 다이어그램**으로 그린다(하나로 합치거나 캡션으로 대체하지 않는다).
7. **(2차 개정)** 방향별 시간표(가는 편/오는 편 — 이 분리는 유지) *안에서* "집중 운행"/"일반 운행"/"리셉션 운행"으로 나뉘어 있던 서브테이블을 시간순 하나의 표로 통합한다. 접이식(요약 1줄 + 펼치기)은 채택하지 않는다 — 항상 펼쳐진 상태 유지.

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

→ 8개(2×4) 시간표 블록 전부 정적으로 미리 렌더링, 탭 클릭 시 JS는 `data-vr`/`data-vd` 속성만 바꾼다(로직은 `airport-transfer.html`의 tab click 핸들러와 동일 패턴 재사용).

**노선도(`.uroute`)는 예외적으로 `vr-a`/`vr-b`만 가지고 `vd-*` 클래스는 갖지 않는다** — 날짜와 무관하게 고정된 콘텐츠이므로 노선당 1쌍(가는 편+오는 편, 각각 독립된 route-map 카드 — 총 4개)만 존재하며, 날짜 탭 클릭은 노선도에 아무 영향을 주지 않는다. 시간표 쪽(`.sched-note`, `.sched-dir`)만 `vr-*` + `vd-*`를 함께 가져 8개 조합으로 토글된다.

### 3.2 탭 UI 레이아웃 (2026-07-14 개정)

```
[ A 노선 ]  [ B 노선 ]          ← 노선 탭 (.vtabs)

┌─ 노선도 (선택된 노선 1개만, 날짜 무관 고정) — route-map 재사용(3차 개정) ┐
│  [A] 가는 편·시그니엘→파라다이스→BEXCO   실시간 위치 확인(준비중) │
│       ●───────●───────◉   (route-map: 점+선+대각선 라벨)        │
│  [A] 오는 편·BEXCO→파라다이스→시그니엘   실시간 위치 확인(준비중) │
│       ◉───────●───────●   (역방향 — 별도 route-map 카드)        │
└────────────────────────────────────────────────────────────────┘
   ※ 노선당 카드 2개(가는 편·오는 편 각 1개, 총 4개) — 정류장 3개라
     기존 route-map 컴포넌트 그대로 3칸 직선(U자형 곡선 불필요), 날짜 탭과 무관

[10/21] [10/22] [10/23] [10/24] ← 날짜 탭 (.vtabs.vtabs-date) — 여기부터가 시간표 영역

운영시간 안내 문구 (날짜별)
┌─ 가는 편 시간표 (열=회차, 행=정류장, airport 페이지 형식) ─┐
│  2차 개정: 집중/일반/리셉션 구분 없이 시간순 표 1개로 통합 │
└────────────────────────────────────────────────────────────┘
┌─ 오는 편 시간표 (동일 형식, 방향 분리는 유지) ────────────┐
└────────────────────────────────────────────────────────────┘

(10/23 한정, 노선 무관 공통 노출)
┌─ Faculty Dinner 셔틀 안내 + 시간표 ──────┐
└──────────────────────────────────────────┘
```

Faculty Dinner 블록은 `vd-1023` 클래스만 가지고 `vr-a`/`vr-b` 어느 쪽에도 속하지 않음 → 날짜만 10/23이면 노선 선택과 무관하게 노출(이 부분은 원안과 동일, 변경 없음).

## 4. 노선도·시간표 마크업 (2026-07-14 3차 개정 — route-map 재사용 노선도 + 시간표 통합)

### 4.1 노선도 — 기존 `.route-map` 컴포넌트 재사용, 방향별 2개(행사장행/호텔행), 노선당 1쌍(날짜 무관) — 2026-07-14 4차 개정

`aphrs-2026-transport/airport-transfer.html`이 이미 쓰고 있는 `.route-map`/`.rm-track`/`.rm-line`(`grid-template-columns`로 정류장 수만큼 칸 분할)/`.rm-stop`/`.rm-dot`/`.rm-label`(-58deg 회전 라벨)을 **그대로** 재사용한다. 정류장 3개는 이미 검증된 범위(기존 사용처는 13~15개) 안이라 그대로 3칸 그리드로 렌더된다 — U자형 곡선(1차 개정 폐기)은 여전히 불필요. BEXCO 표시도 `airport-transfer.html`의 기존 선례(`<span class="rm-label" style="color:var(--red)">BEXCO</span>`, 별도 확대 점 없이 빨간 라벨만)를 그대로 따른다 — `.rm-airport`(공항/역 전용 확대 점 + 점선 연결) 클래스는 재사용하지 않는다.

**4차 개정 — 3·1·3차 렌더 확인 후 사용자가 지적한 3가지 결함을 반영**:
1. **게슈탈트 그룹핑**: `.rm-head`(헤더)를 `.route-map` 카드 **밖의 형제**가 아니라 **카드 내부 첫 자식**으로 이동 — 카드 테두리·배경(공통 영역)이 헤더와 다이어그램을 하나의 시각 단위로 묶는다.
2. **중복 정보 제거**: 이미 선택된 "A 노선"/"B 노선" 탭과 중복되는 `.rt-tag`("A"/"B") 배지를 삭제. 바로 아래 다이어그램이 이미 보여주는 정류장 나열 텍스트("시그니엘 → 파라다이스 → BEXCO")도 삭제. "가는 편"/"오는 편"이라는 방향 라벨 대신 목적지 기준 라벨 **"행사장행"/"호텔행"**(en: "To Venue"/"To Hotel")으로 교체 — 노선 A든 B든 공통으로 쓰는 일반 라벨이라 노선별 텍스트 분기가 필요 없다.
3. **여백 축소**: `.rm-track`의 상단 패딩 185px는 `airport-transfer.html`의 13~15개 정류장·긴 라벨 기준값이라 3개 정류장·짧은 라벨(전부 6자 이하 한글/영문 단어)뿐인 이 페이지엔 과도하게 크다. 이 페이지 전용으로 축소 오버라이드.

```html
<div class="uroute vr-a">
  <div class="uroute-arm">
    <div class="route-map">
      <div class="rm-head">
        <span class="ko-only">행사장행</span>
        <span class="en-only">To Venue</span>
        <a href="#" onclick="return false" class="rm-live">
          <span class="live-dot" aria-hidden="true"></span>
          <span class="ko-only">실시간 위치 확인 (준비중)</span>
          <span class="en-only">Live location (coming soon)</span>
        </a>
      </div>
      <div class="rm-track">
        <ol class="rm-line" style="grid-template-columns:repeat(3,1fr)">
          <li class="rm-stop"><span class="rm-label ko-only">시그니엘</span><span class="rm-label en-only">Signiel</span><span class="rm-dot"></span></li>
          <li class="rm-stop"><span class="rm-label ko-only">파라다이스</span><span class="rm-label en-only">Paradise</span><span class="rm-dot"></span></li>
          <li class="rm-stop"><span class="rm-label" style="color:var(--red)">BEXCO</span><span class="rm-dot"></span></li>
        </ol>
      </div>
    </div>
  </div>
  <div class="uroute-arm">
    <div class="route-map">
      <div class="rm-head">
        <span class="ko-only">호텔행</span>
        <span class="en-only">To Hotel</span>
        <a href="#" onclick="return false" class="rm-live">
          <span class="live-dot" aria-hidden="true"></span>
          <span class="ko-only">실시간 위치 확인 (준비중)</span>
          <span class="en-only">Live location (coming soon)</span>
        </a>
      </div>
      <div class="rm-track">
        <ol class="rm-line" style="grid-template-columns:repeat(3,1fr)">
          <li class="rm-stop"><span class="rm-label" style="color:var(--red)">BEXCO</span><span class="rm-dot"></span></li>
          <li class="rm-stop"><span class="rm-label ko-only">파라다이스</span><span class="rm-label en-only">Paradise</span><span class="rm-dot"></span></li>
          <li class="rm-stop"><span class="rm-label ko-only">시그니엘</span><span class="rm-label en-only">Signiel</span><span class="rm-dot"></span></li>
        </ol>
      </div>
    </div>
  </div>
</div>
<!-- vr-b는 웨스틴조선/파크하얏트/BEXCO, 라벨은 노선 무관 공통으로 동일하게 "행사장행"/"호텔행" -->
```

- `vd-*` 클래스 없음 — 노선당(A/B) 딱 1쌍(행사장행+호텔행)씩, 총 4개 노선도만 DOM에 존재. 날짜 탭 클릭은 이 블록에 영향 없음(1차 개정과 동일).
- **신규 JS 없음** — `.route-map`은 순수 CSS Grid라 렌더 로직이 필요 없다.
- **CSS**: `.rm-head{display:flex;align-items:center;gap:10px;flex-wrap:wrap;margin-bottom:14px}`(카드 내부 첫 자식이라 자체 좌우 padding 불필요, `.route-map`의 padding을 그대로 물려받음). `.uroute{display:flex;flex-direction:column;gap:18px;margin-top:18px}`(변경 없음). `.uroute-arm`은 이제 자식이 `.route-map` 하나뿐이라 별도 CSS 규칙 불필요(플레인 wrapper). **신규**: `.route-map .rm-track{padding:70px 10px 14px}` — 이 페이지 전용 스코프 오버라이드로 상단 패딩만 축소(공유 `transport.css`의 `.rm-track{padding:185px 10px 14px}` 자체는 불변, `airport-transfer.html`엔 영향 없음). 정확한 px 값은 구현 후 스크린샷으로 라벨 겹침·잘림이 없는 선에서 조정 가능.
- **rt-tag/배지 삭제**: "A"/"B" 배지(`.rt-tag`)는 완전히 제거 — 노선 구분은 이미 상단 탭이 전담한다.
- **Live 버튼**: 기존 `.rm-live`(`.live-dot` 펄스 애니메이션 포함) 그대로 사용, 링크는 데모 placeholder(`href="#" onclick="return false"`) — 실제 관제 연동 없음(§7 범위 밖 유지). 페이지 하단 안내문과의 모순 해소는 §6 참조.
- 위(행사장행)·아래(호텔행) 카드 사이 간격은 `.uroute{gap:18px}`로 처리(구분선 없이 카드 간 여백만) — 이제 각 `.route-map`이 자체 테두리를 가진 독립 카드이므로 18px 여백만으로 두 카드가 명확히 분리돼 보인다.
- **좌측 보더 악센트(`.route-map::before`, 4px 컬러 스트라이프)는 이번 개정에서 건드리지 않는다** — 사용자가 "AI 슬롭 패턴"으로 지적했으나, 이 리포 전체에 걸친 기존 패턴(`.rt-card`등도 동일)이라 범위를 넘어서므로 별도의 "카드 좌측 보더 악센트 전체 스윕"(세션 기록에 이미 있는 항목)에서 한꺼번에 처리하기로 사용자와 합의.
- **시각 검증 포인트**(구현 후 스크린샷으로 확인): `.rm-head`가 `.route-map` 카드 테두리 안에 자연스럽게 포함되어 헤더+다이어그램이 한 덩어리로 보이는지, "행사장행"/"호텔행" 텍스트가 어색하지 않은지, 축소된 `.rm-track` 패딩에서도 라벨 회전(-58deg)이 겹치거나 잘리지 않는지, 좁은 화면(390px)에서 `.rm-head`(라벨+Live버튼) 줄바꿈이 어색하지 않은지, 두 카드(행사장행/호텔행) 사이 여백이 명확히 분리돼 보이는지.

### 4.2 시간표 — 가로형(열=회차, 행=정류장) + 집중/일반 서브테이블 통합, 방향 분리는 유지

방향별 `.sched-dir`(가는 편/오는 편) 분리 구조는 1차 개정과 동일하게 **그대로 유지**한다. 2차 개정에서 바뀌는 것은 각 `.sched-dir` *안에서* "집중 운행"/"일반 운행"/"리셉션 운행" 라벨로 나뉘어 있던 `.sched-phase` 서브테이블들을 **하나의 연속된 표로 병합**하는 것뿐이다 — 회차 번호는 기존에도 서브테이블 경계를 넘어 연속이었으므로(예: 집중 1~9, 일반 10~16), 단순히 두 `<table>`을 컬럼 이어붙이듯 하나로 합치고 `.sched-phase`/`.sched-h`(소제목) 래퍼를 제거하면 된다.

```html
<div class="sched-dir vr-a vd-1021">
  <h3 class="sched-dir-h" style="color:var(--red)">시그니엘 → BEXCO</h3>
  <div class="sched-hbus"><table>
    <thead><tr><th>회차</th><th>1</th><th>2</th>…<th>16</th></tr></thead>
    <tbody>
      <tr><th>시그니엘</th><td>7:00</td><td>7:20</td>…</tr>
      <tr><th>파라다이스</th><td>7:07</td><td>7:27</td>…</tr>
      <tr><th>BEXCO</th><td>7:25</td><td>7:45</td>…</tr>
    </tbody>
  </table></div>
</div>
<div class="sched-dir vr-a vd-1021" style="margin-bottom:0">
  <h3 class="sched-dir-h" style="color:var(--navy)">BEXCO → 시그니엘</h3>
  …
</div>
```

- 병합 후 최대 컬럼 수는 15~16개(가장 붐비는 블록 기준) — 기존 `.sched-hbus{overflow-x:auto}` 가로 스크롤이 그대로 흡수하므로 페이지 전체 스크롤은 발생하지 않는다.
- **접이식(`<details>`/`<summary>`) 채택하지 않음** — ITS `buildTimetable()`은 첫차·막차·균일 배차간격 하나로 표를 자동 생성하는데, APHRS 실데이터는 구간별 배차간격이 다르므로(20분→1시간→20분 등) 이 방식이 안 맞는다. 기존처럼 실데이터를 그대로 하드코딩한 표를 유지하되, 항상 펼쳐진 상태로 둔다.
- 적용 범위: 노선(A/B) × 날짜(4) × 방향(2) = **16개 방향-블록 전부**에서 동일하게 서브테이블 병합.
- 10/23 노선 B(웨스틴조선·파크하얏트)의 오는 편 "시그니엘(연장)" 4번째 행, 10/22·10/23의 리셉션 운행 등 기존 실데이터·특수 케이스는 값 그대로 병합된 표 안에 이어붙인다(데이터 변경 없음, 표 구조만 변경).
- 기존 세로형(`.sched-grid`/`.sched-col`) Faculty Dinner 블록은 이번 변경 대상이 아니다(1차 개정과 동일하게 유지).

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
- `shuttle-venue.html` 자체 인라인 `<style>`에 `.uroute`/`.uroute-arm`/`.ar-lbl`/`.uroute-path`(직선 노선도)와 `.sched-h`/`.sched-phase`/`.sched-hbus`/`.sched-dir`/`.sched-dir-h`(가로형 시간표, `airport-transfer.html`의 `.sched-hbus` 복제) 신규 규칙 추가. 날짜·노선 탭 버튼(`.vtabs`/`.vtab`)은 `airport-transfer.html`의 `.limo-tab`/`.limo-tabs`와 동일한 CSS 동작을 이 페이지 전용 클래스명으로 복제(페이지별 인라인 스타일 원칙 유지, 신규 동작 없음).

### 2차/3차 개정 추가 변경사항

- **삭제**: `.uroute-path`/`.ar`/`.ar-lbl`/`.uroute-back .ar-lbl`(텍스트 화살표 표현) CSS·마크업 전부 — route-map 재사용으로 완전 대체(개념 승계 없음, `.rt-tag`/인라인 색상으로 대체).
- **신규 CSS** (`shuttle-venue.html` 인라인 `<style>`, 딱 1줄): `.rm-head{display:flex;align-items:center;gap:10px;flex-wrap:wrap;padding:0 4px 10px}`. 그 외에는 전부 기존 클래스(`.route-map`/`.rm-track`/`.rm-line`/`.rm-stop`/`.rm-dot`/`.rm-label`/`.rt-tag`/`.rm-live`) 재사용 — `transport.css` 수정 없음.
- **`.uroute`/`.uroute-arm` 단순화**: 기존 카드 스타일(배경·보더·그림자·padding) 제거, `.uroute{display:flex;flex-direction:column;gap:18px}` / `.uroute-arm{display:flex;flex-direction:column;gap:8px}`로 교체(이중 카드 방지, §4.1 참조).
- **신규 JS 없음** — route-map은 순수 CSS라 렌더 함수·초기화 훅이 필요 없다(2차안의 `buildSnake` 포팅 계획은 3차 개정으로 폐기).
- **삭제(16개 방향-블록 전체 반복)**: `.sched-phase` div, `.sched-h`(집중 운행/일반 운행/리셉션 운행 소제목) — 각 `.sched-dir` 안의 표를 시간순 컬럼 병합 1개로 교체.
- **텍스트 수정**: `shuttle-venue.html` 하단 안내 목록의 "실시간 추적은 제공되지 않습니다"(ko) / "Real-time tracking is not available."(en) → "실시간 위치 확인은 추후 제공 예정입니다"(ko) / "Live location tracking coming soon."(en)로 변경 — 신규 Live 버튼과의 모순 해소.
- **버전 갱신**: `<meta name="version">`, `transport.css?v=`, `app.js?v=` 3곳 + `bump-version.sh` 사용 — 다음 패치 번호로 동기화(내용물은 안 바뀌어도 캐시 무효화를 위해 필요).

## 7. 범위 밖 (YAGNI)

- 실시간 배차 위치, 만석 알림 등 동적 기능 없음(기존과 동일, 정적 데모). **2차 개정**: "실시간 위치 확인" 버튼(`.rm-live`)은 시각 요소로만 추가되며 `href="#" onclick="return false"` 데모 placeholder다 — 실제 관제(TMS) 연동·URL 확정은 여전히 범위 밖.
- 접이식(`<details>`) 시간표 채택하지 않음(§4.2 사유 참조) — 표는 항상 펼쳐진 상태.
- 모바일 전용 별도 레이아웃은 두지 않음 — `.route-map`은 `airport-transfer.html`에서 이미 검증된 자체 모바일 브레이크포인트(`@media(max-width:620px)`에서 회전 라벨 → 세로 타임라인 전환)를 그대로 상속하므로 신규 반응형 작업이 불필요.
- 언어 토글(ko/en)은 기존 `ko-only`/`en-only` 패턴 그대로 유지, 신규 로직 없음.
- **(3차 개정)** ITS `.rroute`/`buildSnake()` SVG 이식은 채택하지 않는다 — 이 프로젝트에 이미 있는 `.route-map`으로 대체(§4.1). `its-2026-gangneung` 자체는 이 변경의 영향을 받지 않는다(참고만 하고 코드 이식 없음).

## 8. 검증 기준

- 노선 탭 A/B 전환 시 노선도 + 시간표가 즉시 함께 바뀌는지 (스크린샷 확인).
- 날짜 탭 4개 각각에서 표시되는 시간이 정리 문서의 실제 수치와 1:1 일치하는지.
- 10/23 탭에서 노선 A/B 어느 쪽을 선택해도 Faculty Dinner 블록이 항상 보이는지.
- 데스크톱(1280) 렌더 확인 우선, 이후 모바일(390)에서 탭 줄바꿈 및 `.route-map` 세로 타임라인 전환이 정상인지 확인.
- 버전 문자열(`?v=`, `SITE_VERSION`) 갱신 후 캐시 무효화 확인.
- **(2차 개정 추가)** 가는 편·오는 편 노선도가 각각 올바른 순서(가는 편: 호텔→…→BEXCO, 오는 편: BEXCO→…→호텔)로 렌더되는지, 두 노선도가 하나로 합쳐지거나 캡션으로 축약되지 않았는지.
- **(2차 개정 추가)** 병합된 시간표에서 회차 번호가 끊김 없이 연속인지(예: 1~16), "집중 운행"/"일반 운행" 라벨이 완전히 제거됐는지, 16개 방향-블록(노선2×날짜4×방향2) 전부 동일하게 적용됐는지.
- **(2차 개정 추가)** Live 버튼 클릭 시 아무 동작도 하지 않는지(placeholder 확인), 하단 안내문이 새 버튼과 모순되지 않는 문구로 바뀌었는지.
- **(3차 개정 추가)** `.uroute` 카드 스타일 단순화 후 두 방향(`.route-map`) 카드가 이중 테두리 없이 자연스럽게 보이는지, `.rm-head`의 배지+텍스트+Live 버튼 한 줄이 좁은 화면에서 깨지지 않는지, BEXCO 라벨이 기존 `airport-transfer.html`과 동일하게 빨간 텍스트로만 표시되고 확대 점이 없는지(=`.rm-airport` 오적용 아님을 확인).
