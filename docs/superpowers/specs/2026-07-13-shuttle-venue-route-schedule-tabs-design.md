# 행사장 셔틀(shuttle-venue.html) 노선×날짜 탭 + 직선 노선도 — 설계 문서

- **작성일**: 2026-07-13 (2026-07-14 개정 — U자형 → 직선 노선도, 날짜 탭을 시간표 영역으로 이동, 시간표 형식을 공항↔호텔 페이지 형식으로 변경)
- **상태**: 승인 완료 (브레인스토밍 대화로 확정, 구현 완료 후 사용자 피드백으로 §2·§3.2·§4·§6 재개정)
- **대상 파일**: `aphrs-2026-transport/shuttle-venue.html`, `aphrs-2026-transport/assets/transport.css`
- **데이터 출처**: `D:\Works\Active\APHRS2026\APHRS 2026 행사장 셔틀 운영 계획_260713.pptx` → 정리본 `D:\Works\Active\APHRS2026\APHRS2026_행사장셔틀_노선및시간표_정리.md`

> **2026-07-14 개정 배경**: 최초 구현(U자형, 참고 사이트 busansandan.rideus.net의 곡선 연결 기법 차용)을 실제 렌더로 확인한 사용자가 "참고 사이트는 정류장이 16+8개라 곡선 다이어그램이 필요했지만, 우리 노선은 3정류장뿐이라 과했다"고 판단 — 노선도를 **날짜와 무관한 고정 직선 2줄**(가는 편/오는 편)로 단순화하고, 날짜 탭은 노선도가 아니라 **시간표 영역에만** 걸리도록 재배치. 시간표 형식도 세로형(행=회차)에서 `airport-transfer.html`의 가로형(열=회차, 행=정류장)으로 변경. 아래 §2·§3.2·§4·§6은 이 개정을 반영한 최종본이다(§1·§5·§7·§8은 원안 그대로 유효).

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

**노선도(`.uroute`)는 예외적으로 `vr-a`/`vr-b`만 가지고 `vd-*` 클래스는 갖지 않는다** — 날짜와 무관하게 고정된 콘텐츠이므로 노선당 1개(총 2개)만 존재하며, 날짜 탭 클릭은 노선도에 아무 영향을 주지 않는다. 시간표 쪽(`.sched-note`, `.sched-dir`)만 `vr-*` + `vd-*`를 함께 가져 8개 조합으로 토글된다.

### 3.2 탭 UI 레이아웃 (2026-07-14 개정)

```
[ A 노선 ]  [ B 노선 ]          ← 노선 탭 (.vtabs)

┌─ 노선도 (선택된 노선 1개만, 날짜 무관 고정) ─┐
│  가는 편   기점 → 중간 → BEXCO              │
│  ─────────────────────────────  (구분선)    │
│  오는 편   BEXCO → 중간 → 기점              │
└──────────────────────────────────────────────┘
   ※ 노선당 1개만 렌더링(총 2개, vr-a/vr-b 각 1개) — U자형 곡선 없음, 날짜 탭과 무관

[10/21] [10/22] [10/23] [10/24] ← 날짜 탭 (.vtabs.vtabs-date) — 여기부터가 시간표 영역

운영시간 안내 문구 (날짜별)
┌─ 가는 편 시간표 (열=회차, 행=정류장, airport 페이지 형식) ─┐
│  운영모드별(집중/일반/리셉션) 소단락으로 분리             │
└────────────────────────────────────────────────────────────┘
┌─ 오는 편 시간표 (동일 형식) ─────────────────────────────┐
└────────────────────────────────────────────────────────────┘

(10/23 한정, 노선 무관 공통 노출)
┌─ Faculty Dinner 셔틀 안내 + 시간표 ──────┐
└──────────────────────────────────────────┘
```

Faculty Dinner 블록은 `vd-1023` 클래스만 가지고 `vr-a`/`vr-b` 어느 쪽에도 속하지 않음 → 날짜만 10/23이면 노선 선택과 무관하게 노출(이 부분은 원안과 동일, 변경 없음).

## 4. 노선도·시간표 마크업 (2026-07-14 개정 — 직선 2줄 + 가로형 시간표)

### 4.1 노선도 — 직선 2줄, 곡선 없음, 노선당 1개(날짜 무관)

정류장이 노선당 3개(기점·중간·BEXCO)뿐이라 U자형 곡선 연결(참고: busansandan.rideus.net의 `line-forward`/`line-reverse`/`line-end` 기법, 최초안에서 검토했으나 폐기)은 과했다 — 실제로는 "가는 편"·"오는 편" 두 줄을 구분선으로만 나눈 **단순 직선 텍스트 다이어그램**으로 충분하다.

```html
<div class="uroute vr-a">
  <div class="uroute-arm uroute-out">
    <span class="ar-lbl ko-only">가는 편</span><span class="ar-lbl en-only">Outbound</span>
    <span class="uroute-path ko-only">시그니엘 <span class="ar">→</span> 파라다이스 <span class="ar">→</span> BEXCO</span>
    <span class="uroute-path en-only">Signiel <span class="ar">→</span> Paradise <span class="ar">→</span> BEXCO</span>
  </div>
  <div class="uroute-arm uroute-back">
    <span class="ar-lbl ko-only">오는 편</span><span class="ar-lbl en-only">Return</span>
    <span class="uroute-path ko-only">BEXCO <span class="ar">→</span> 파라다이스 <span class="ar">→</span> 시그니엘</span>
    <span class="uroute-path en-only">BEXCO <span class="ar">→</span> Paradise <span class="ar">→</span> Signiel</span>
  </div>
</div>
```

- `vd-*` 클래스 없음 — 노선당(A/B) 딱 1개씩, 총 2개만 DOM에 존재. 날짜 탭 클릭은 이 블록에 영향 없음.
- 위(가는 편)·아래(오는 편) 사이는 `border-bottom` 구분선(`.uroute-arm:not(:last-child)`)만으로 분리, 곡선 커넥터 없음.
- 라벨 배지 색으로 방향 구분(가는 편=navy, 오는 편=red) — 기존 `.ar-lbl`/`.uroute-back .ar-lbl` 그대로 유지.

### 4.2 시간표 — 가로형(열=회차, 행=정류장), `airport-transfer.html`의 `.sched-hbus` 형식 차용

노선×날짜 8개 조합 각각에 대해 **가는 편 `.sched-dir` + 오는 편 `.sched-dir`** 2개를 두고, 그 안에서 운영모드(집중/일반/리셉션)별로 `.sched-phase`(소제목 + `.sched-hbus` 표)를 분리한다.

```html
<div class="sched-dir vr-a vd-1021">
  <h3 class="sched-dir-h" style="color:var(--red)">시그니엘 → BEXCO</h3>
  <div class="sched-phase">
    <div class="sched-h">집중 운행</div>
    <div class="sched-hbus"><table>
      <thead><tr><th>회차</th><th>1</th><th>2</th>…</tr></thead>
      <tbody>
        <tr><th>시그니엘</th><td>7:00</td><td>7:20</td>…</tr>
        <tr><th>파라다이스</th><td>7:07</td><td>7:27</td>…</tr>
        <tr><th>BEXCO</th><td>7:25</td><td>7:45</td>…</tr>
      </tbody>
    </table></div>
  </div>
  <!-- 일반 운행 .sched-phase 반복 -->
</div>
<div class="sched-dir vr-a vd-1021" style="margin-bottom:0">
  <h3 class="sched-dir-h" style="color:var(--navy)">BEXCO → 시그니엘</h3>
  …
</div>
```

- `.sched-hbus`는 `airport-transfer.html`의 `.sched-h`/`.sched-hbus` CSS를 그대로 복제(overflow-x:auto로 좁은 화면에서 표만 개별 가로 스크롤 — 페이지 전체 스크롤은 발생하지 않음).
- 10/23 노선 B(웨스틴조선·파크하얏트)의 오는 편에는 "시그니엘(연장)" 4번째 행이 추가되고, 일반 운행 구간엔 `—`(해당 없음), 17시 이후 집중 운행 구간엔 실제 연장 시각을 채운다.
- 기존 세로형(`.sched-grid`/`.sched-col`, 행=회차) 마크업·CSS는 8개 노선×날짜 블록에서는 더 이상 쓰지 않지만, Faculty Dinner 블록(호차 10개, 단순 목록이라 세로형이 자연스러움)에는 그대로 남겨둔다 — 두 형식이 공존하는 것은 의도된 차이(성격이 다른 데이터).

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
