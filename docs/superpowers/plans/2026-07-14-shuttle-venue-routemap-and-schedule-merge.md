# 행사장 셔틀 노선도 route-map 전환 + 시간표 통합 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** `aphrs-2026-transport/shuttle-venue.html`의 텍스트 화살표 노선도를 이 프로젝트의 기존 `.route-map` 컴포넌트로 교체하고, 방향별 시간표 안에서 "집중 운행"/"일반 운행"/"리셉션 운행"으로 나뉜 서브테이블을 시간순 표 1개로 통합한다.

**Architecture:** 신규 JS 없음. 신규 CSS는 `.rm-head` 한 줄뿐(그 외 전부 `airport-transfer.html`이 이미 쓰는 `.route-map`/`.rm-track`/`.rm-line`/`.rm-stop`/`.rm-dot`/`.rm-label`/`.rt-tag`/`.rm-live` 재사용). 노선(A/B)×방향(가는 편/오는 편) = 4개 route-map 카드는 `vr-a`/`vr-b`만 갖고 날짜와 무관하게 고정. 시간표는 `vr-*`+`vd-*` 16개 방향-블록 각각에서 기존 여러 `.sched-phase` 서브테이블을 `<table>` 1개로 병합(회차 번호·데이터는 그대로, 컬럼만 이어붙임).

**Tech Stack:** 정적 HTML + 인라인 CSS. 빌드 없음. 버전 문자열은 `bump-version.sh`(대화형 확인 프롬프트 있음 — 비대화형 실행 시 `echo y |`로 우회).

## Global Constraints

- 대상 파일은 `aphrs-2026-transport/shuttle-venue.html` 하나뿐(그 안의 인라인 `<style>`과 body 마크업만 수정) — `transport.css`, `app.js`는 건드리지 않는다.
- 가는 편/오는 편의 **방향별 분리는 반드시 유지** — 노선도도 시간표도 절대 하나로 합치지 않는다(사용자가 과거 반복된 실수로 명시 지적한 지점).
- 접이식(`<details>`/`<summary>`) 시간표는 채택하지 않는다 — 표는 항상 펼쳐진 상태.
- "실시간 위치 확인" 버튼은 `href="#" onclick="return false"` 데모 placeholder여야 한다 — 실제 URL 연결 금지.
- `.rm-airport` 클래스는 재사용하지 않는다(BEXCO 연결선이 점선으로 바뀌는 부수효과 때문 — BEXCO는 기존 `airport-transfer.html` 선례대로 `style="color:var(--red)"` 빨간 라벨 텍스트로만 표시).
- 기존 `ko-only`/`en-only` 언어 토글 패턴을 그대로 따른다 — 신규 언어 로직 없음.
- 데이터(시각·간격)는 절대 반올림·추정하지 않는다 — 기존 코드에 있는 값을 그대로 재배치만 한다.
- 정본 스펙: `docs/superpowers/specs/2026-07-13-shuttle-venue-route-schedule-tabs-design.md`(3차 개정, §4가 최종 마크업 기준).

## File Structure

- Modify: `aphrs-2026-transport/shuttle-venue.html`
  - `<head>`의 인라인 `<style>` — 노선도 관련 CSS 블록 교체(Task 1)
  - `<body>`의 "ROUTES" 섹션 안 `.uroute.vr-a` 블록 — 마크업 교체(Task 2)
  - `<body>`의 "ROUTES" 섹션 안 `.uroute.vr-b` 블록 — 마크업 교체(Task 3)
  - `<body>`의 노선 A 8개 `.sched-dir` 블록(4일×2방향) — 서브테이블 병합(Task 4)
  - `<body>`의 노선 B 8개 `.sched-dir` 블록(4일×2방향) — 서브테이블 병합(Task 5)
  - `<body>`의 "RULES" 섹션 안내 목록 2줄 + `<head>`/`<script>` 버전 문자열 3곳 — 텍스트·버전 수정(Task 6)

---

### Task 1: CSS 기반 — route-map 재사용 준비

**Files:**
- Modify: `aphrs-2026-transport/shuttle-venue.html` (인라인 `<style>`, 현재 64~84번째 줄 부근 — Task 2/3에서 마크업이 바뀌기 전에 먼저 CSS를 갈아끼워야 브라우저에서 깨진 상태로 안 보인다)

**Interfaces:**
- Produces: `.rm-head`(신규 flex 레이아웃 클래스), 단순화된 `.uroute`/`.uroute-arm`(카드 chrome 제거, 순수 flex 컨테이너) — Task 2/3의 마크업이 이 클래스들을 소비한다.
- Consumes: 없음(기존 `transport.css`의 `.route-map`/`.rm-track`/`.rm-line`/`.rm-stop`/`.rm-dot`/`.rm-label`/`.rt-tag`/`.rm-live`를 그대로 참조하되 새로 정의하지 않는다 — 이미 `assets/transport.css`에 존재).

- [ ] **Step 1: 현재 CSS 블록 확인**

`aphrs-2026-transport/shuttle-venue.html`에서 아래 블록을 정확히 찾는다(주석 "Venue Shuttle" 로 시작):

```css
  /* ===== Venue Shuttle — 노선×날짜 탭 + 직선 노선도 (2026-07-14 개정: U자형→직선, 날짜 무관 고정) ===== */
  .vtabs{display:flex;border-radius:var(--radius-sm);overflow:hidden;border:1px solid var(--line);margin-top:16px}
  .vtab{flex:1;padding:13px 16px;background:#fff;border:none;font:inherit;font-size:14.5px;font-weight:700;color:var(--muted);cursor:pointer;transition:background .15s,color .15s}
  .vtab:not(:last-child){border-right:1px solid var(--line)}
  .vtab[aria-selected="true"]{color:var(--red);background:var(--red-050)}
  .vtab:hover:not([aria-selected="true"]){color:var(--ink)}
  .vtabs.vtabs-date{margin-top:18px}
  .vtabs.vtabs-date .vtab{font-size:13px;padding:10px 12px}

  /* 직선 노선도 — 위=가는 편, 아래=오는 편. 날짜와 무관하게 노선(vr) 선택에만 반응(고정 콘텐츠) */
  .uroute{background:var(--card);border:1px solid var(--line);border-radius:var(--radius);box-shadow:var(--shadow);padding:20px 24px;margin-top:18px}
  .uroute-arm{display:flex;align-items:center;gap:14px;flex-wrap:wrap}
  .uroute-arm:not(:last-child){margin-bottom:16px;padding-bottom:16px;border-bottom:1px solid var(--line)}
  .uroute-arm .ar-lbl{flex:0 0 auto;font-size:12px;font-weight:800;color:#fff;background:var(--navy);border-radius:8px;padding:7px 12px;letter-spacing:.3px}
  .uroute-back .ar-lbl{background:var(--red)}
  .uroute-path{font-size:15px;font-weight:700;color:var(--ink)}
  .uroute-path .ar{color:var(--red);font-weight:700;margin:0 5px}
  @media(max-width:620px){
    .uroute{padding:16px 18px}
    .uroute-path{font-size:13.5px}
  }
```

- [ ] **Step 2: 교체**

위 블록 전체를 아래로 교체한다:

```css
  /* ===== Venue Shuttle — 노선×날짜 탭 + route-map 노선도 (2026-07-14 3차 개정: route-map 재사용, U자형/텍스트 화살표 폐기) ===== */
  .vtabs{display:flex;border-radius:var(--radius-sm);overflow:hidden;border:1px solid var(--line);margin-top:16px}
  .vtab{flex:1;padding:13px 16px;background:#fff;border:none;font:inherit;font-size:14.5px;font-weight:700;color:var(--muted);cursor:pointer;transition:background .15s,color .15s}
  .vtab:not(:last-child){border-right:1px solid var(--line)}
  .vtab[aria-selected="true"]{color:var(--red);background:var(--red-050)}
  .vtab:hover:not([aria-selected="true"]){color:var(--ink)}
  .vtabs.vtabs-date{margin-top:18px}
  .vtabs.vtabs-date .vtab{font-size:13px;padding:10px 12px}

  /* 노선도 — route-map(airport-transfer.html) 재사용. 위=가는 편, 아래=오는 편, 각각 독립 카드. 날짜와 무관하게 노선(vr) 선택에만 반응(고정 콘텐츠) */
  .uroute{display:flex;flex-direction:column;gap:18px;margin-top:18px}
  .uroute-arm{display:flex;flex-direction:column;gap:8px}
  .rm-head{display:flex;align-items:center;gap:10px;flex-wrap:wrap;padding:0 4px 10px}
```

- [ ] **Step 3: 로컬 서버로 렌더 확인**

리포 루트에서 `python -m http.server 8000` 실행 후 `http://localhost:8000/aphrs-2026-transport/shuttle-venue.html`을 브라우저(또는 chrome-devtools MCP `navigate_page`+`take_screenshot`)로 연다. 이 시점엔 Task 2/3이 아직 실행 전이라 "운행 노선" 섹션이 스타일만 바뀌고 마크업은 구버전(`.ar-lbl`/`.uroute-path`)이라 살짝 어색하게(라벨 배지 없이 텍스트만 세로로 붙어) 보일 수 있음 — **정상**, Task 2/3에서 마크업을 교체하면 해결된다. 페이지가 깨지거나 콘솔에 CSS 파싱 에러가 없는지만 확인한다.

- [ ] **Step 4: 커밋**

```bash
cd aphrs-2026-transport
git add shuttle-venue.html
git commit -m "refactor: shuttle-venue 노선도 CSS를 route-map 재사용 기반으로 교체"
```

---

### Task 2: 노선 A 노선도 마크업 — route-map 카드 2개로 교체

**Files:**
- Modify: `aphrs-2026-transport/shuttle-venue.html` (`<div class="uroute vr-a">` 블록, Task 1 완료 후 기준 약 216~227번째 줄)

**Interfaces:**
- Consumes: Task 1에서 만든 `.rm-head`, 기존 `.route-map`/`.rm-track`/`.rm-line`/`.rm-stop`/`.rm-dot`/`.rm-label`/`.rt-tag`/`.rm-live`.
- Produces: 없음(다른 태스크가 이 마크업을 참조하지 않음 — 시각적으로 완결된 단위).

- [ ] **Step 1: 현재 마크업 확인**

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

- [ ] **Step 2: 교체**

```html
    <div class="uroute vr-a">
      <div class="uroute-arm">
        <div class="rm-head">
          <span class="rt-tag">A</span>
          <span class="ko-only">가는 편 · 시그니엘 → 파라다이스 → BEXCO</span>
          <span class="en-only">Outbound · Signiel → Paradise → BEXCO</span>
          <a href="#" onclick="return false" class="rm-live">
            <span class="live-dot" aria-hidden="true"></span>
            <span class="ko-only">실시간 위치 확인 (준비중)</span>
            <span class="en-only">Live location (coming soon)</span>
          </a>
        </div>
        <div class="route-map">
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
        <div class="rm-head">
          <span class="rt-tag" style="background:var(--red)">A</span>
          <span class="ko-only">오는 편 · BEXCO → 파라다이스 → 시그니엘</span>
          <span class="en-only">Return · BEXCO → Paradise → Signiel</span>
          <a href="#" onclick="return false" class="rm-live">
            <span class="live-dot" aria-hidden="true"></span>
            <span class="ko-only">실시간 위치 확인 (준비중)</span>
            <span class="en-only">Live location (coming soon)</span>
          </a>
        </div>
        <div class="route-map">
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
```

- [ ] **Step 3: 렌더 확인**

로컬 서버(이미 떠 있으면 재사용) → `shuttle-venue.html` → "A 노선" 탭이 기본 선택된 상태에서 스크린샷. 확인 항목:
1. 가는 편 카드: 시그니엘 → 파라다이스 → BEXCO 순서로 점 3개가 왼쪽에서 오른쪽으로, BEXCO 라벨만 빨간색.
2. 오는 편 카드: BEXCO → 파라다이스 → 시그니엘 순서(반대 방향)로 점 3개, BEXCO 라벨이 이번엔 맨 왼쪽.
3. 각 카드 상단에 배지("A", 오는 편은 빨간 배경)+텍스트+"실시간 위치 확인 (준비중)" 버튼이 한 줄에 배치.
4. "B 노선" 탭 클릭 시 이 두 카드가 사라지는지(아직 Task 3 전이라 B 노선 자리엔 구버전 마크업이 남아있음 — 정상).

- [ ] **Step 4: 커밋**

```bash
cd aphrs-2026-transport
git add shuttle-venue.html
git commit -m "feat: shuttle-venue 노선 A 노선도를 route-map 카드 2개로 교체"
```

---

### Task 3: 노선 B 노선도 마크업 — route-map 카드 2개로 교체

**Files:**
- Modify: `aphrs-2026-transport/shuttle-venue.html` (`<div class="uroute vr-b">` 블록)

**Interfaces:**
- Consumes: Task 1의 `.rm-head`, 기존 `.route-map`/`.rt-tag`/`.rm-live` 등(Task 2와 동일).
- Produces: 없음.

- [ ] **Step 1: 현재 마크업 확인**

```html
    <div class="uroute vr-b">
      <div class="uroute-arm uroute-out">
        <span class="ar-lbl ko-only">가는 편</span><span class="ar-lbl en-only">Outbound</span>
        <span class="uroute-path ko-only">웨스틴조선 <span class="ar">→</span> 파크하얏트 <span class="ar">→</span> BEXCO</span>
        <span class="uroute-path en-only">Westin Josun <span class="ar">→</span> Park Hyatt <span class="ar">→</span> BEXCO</span>
      </div>
      <div class="uroute-arm uroute-back">
        <span class="ar-lbl ko-only">오는 편</span><span class="ar-lbl en-only">Return</span>
        <span class="uroute-path ko-only">BEXCO <span class="ar">→</span> 파크하얏트 <span class="ar">→</span> 웨스틴조선</span>
        <span class="uroute-path en-only">BEXCO <span class="ar">→</span> Park Hyatt <span class="ar">→</span> Westin Josun</span>
      </div>
    </div>
```

- [ ] **Step 2: 교체**

```html
    <div class="uroute vr-b">
      <div class="uroute-arm">
        <div class="rm-head">
          <span class="rt-tag">B</span>
          <span class="ko-only">가는 편 · 웨스틴조선 → 파크하얏트 → BEXCO</span>
          <span class="en-only">Outbound · Westin Josun → Park Hyatt → BEXCO</span>
          <a href="#" onclick="return false" class="rm-live">
            <span class="live-dot" aria-hidden="true"></span>
            <span class="ko-only">실시간 위치 확인 (준비중)</span>
            <span class="en-only">Live location (coming soon)</span>
          </a>
        </div>
        <div class="route-map">
          <div class="rm-track">
            <ol class="rm-line" style="grid-template-columns:repeat(3,1fr)">
              <li class="rm-stop"><span class="rm-label ko-only">웨스틴조선</span><span class="rm-label en-only">Westin Josun</span><span class="rm-dot"></span></li>
              <li class="rm-stop"><span class="rm-label ko-only">파크하얏트</span><span class="rm-label en-only">Park Hyatt</span><span class="rm-dot"></span></li>
              <li class="rm-stop"><span class="rm-label" style="color:var(--red)">BEXCO</span><span class="rm-dot"></span></li>
            </ol>
          </div>
        </div>
      </div>
      <div class="uroute-arm">
        <div class="rm-head">
          <span class="rt-tag" style="background:var(--red)">B</span>
          <span class="ko-only">오는 편 · BEXCO → 파크하얏트 → 웨스틴조선</span>
          <span class="en-only">Return · BEXCO → Park Hyatt → Westin Josun</span>
          <a href="#" onclick="return false" class="rm-live">
            <span class="live-dot" aria-hidden="true"></span>
            <span class="ko-only">실시간 위치 확인 (준비중)</span>
            <span class="en-only">Live location (coming soon)</span>
          </a>
        </div>
        <div class="route-map">
          <div class="rm-track">
            <ol class="rm-line" style="grid-template-columns:repeat(3,1fr)">
              <li class="rm-stop"><span class="rm-label" style="color:var(--red)">BEXCO</span><span class="rm-dot"></span></li>
              <li class="rm-stop"><span class="rm-label ko-only">파크하얏트</span><span class="rm-label en-only">Park Hyatt</span><span class="rm-dot"></span></li>
              <li class="rm-stop"><span class="rm-label ko-only">웨스틴조선</span><span class="rm-label en-only">Westin Josun</span><span class="rm-dot"></span></li>
            </ol>
          </div>
        </div>
      </div>
    </div>
```

- [ ] **Step 3: 렌더 확인**

"B 노선" 탭 클릭 후 스크린샷. Task 2의 확인 항목 1~3을 웨스틴조선/파크하얏트 기준으로 동일하게 확인. 추가로 "A 노선"↔"B 노선" 탭을 3회 왕복 클릭해 두 노선 카드가 서로 겹치거나 잔상 없이 깨끗하게 전환되는지 확인(순수 CSS라 문제가 없어야 정상 — 만약 겹침이 보이면 `vr-a`/`vr-b` 클래스 누락 의심).

- [ ] **Step 4: 커밋**

```bash
cd aphrs-2026-transport
git add shuttle-venue.html
git commit -m "feat: shuttle-venue 노선 B 노선도를 route-map 카드 2개로 교체"
```

---

### Task 4: 노선 A 시간표 8개 방향-블록 — 집중/일반/리셉션 서브테이블 통합

**Files:**
- Modify: `aphrs-2026-transport/shuttle-venue.html` (노선 A, 10/21~10/24 × 가는 편/오는 편 = 8개 `.sched-dir` 블록)

**Interfaces:**
- Consumes: 없음(기존 `.sched-hbus`/`.sched-dir`/`.sched-dir-h` CSS는 이미 파일에 있음, 수정 안 함).
- Produces: 없음.

각 블록은 "여러 `.sched-phase` → `<table>` 1개"로 바뀐다. 회차 번호·시각 데이터는 절대 바꾸지 않고 컬럼만 이어붙인다. 아래 8개 전부 실제 파일의 현재 내용과 정확히 대응한다.

- [ ] **Step 1: 10/21 가는 편(시그니엘 → BEXCO) 병합**

BEFORE:
```html
    <div class="sched-dir reveal vr-a vd-1021">
      <h3 class="sched-dir-h" style="color:var(--red)"><span class="ko-only">시그니엘 → BEXCO</span><span class="en-only">Signiel → BEXCO</span></h3>
      <div class="sched-phase">
        <div class="sched-h"><span class="ko-only">집중 운행</span><span class="en-only">Peak</span></div>
        <div class="sched-hbus"><table>
          <thead><tr><th><span class="ko-only">회차</span><span class="en-only">Trip</span></th><th>1</th><th>2</th><th>3</th><th>4</th><th>5</th><th>6</th><th>7</th><th>8</th><th>9</th></tr></thead>
          <tbody>
            <tr><th><span class="ko-only">시그니엘</span><span class="en-only">Signiel</span></th><td>7:00</td><td>7:20</td><td>7:40</td><td>8:00</td><td>8:20</td><td>8:40</td><td>9:00</td><td>9:20</td><td>9:40</td></tr>
            <tr><th><span class="ko-only">파라다이스</span><span class="en-only">Paradise</span></th><td>7:07</td><td>7:27</td><td>7:47</td><td>8:07</td><td>8:27</td><td>8:47</td><td>9:07</td><td>9:27</td><td>9:47</td></tr>
            <tr><th>BEXCO</th><td>7:25</td><td>7:45</td><td>8:05</td><td>8:25</td><td>8:45</td><td>9:05</td><td>9:25</td><td>9:45</td><td>10:05</td></tr>
          </tbody>
        </table></div>
      </div>
      <div class="sched-phase">
        <div class="sched-h"><span class="ko-only">일반 운행</span><span class="en-only">Regular</span></div>
        <div class="sched-hbus"><table>
          <thead><tr><th><span class="ko-only">회차</span><span class="en-only">Trip</span></th><th>10</th><th>11</th><th>12</th><th>13</th><th>14</th><th>15</th><th>16</th></tr></thead>
          <tbody>
            <tr><th><span class="ko-only">시그니엘</span><span class="en-only">Signiel</span></th><td>10:00</td><td>11:00</td><td>12:00</td><td>13:00</td><td>14:00</td><td>15:00</td><td>16:00</td></tr>
            <tr><th><span class="ko-only">파라다이스</span><span class="en-only">Paradise</span></th><td>10:07</td><td>11:07</td><td>12:07</td><td>13:07</td><td>14:07</td><td>15:07</td><td>16:07</td></tr>
            <tr><th>BEXCO</th><td>10:25</td><td>11:25</td><td>12:25</td><td>13:25</td><td>14:25</td><td>15:25</td><td>16:25</td></tr>
          </tbody>
        </table></div>
      </div>
    </div>
```

AFTER:
```html
    <div class="sched-dir reveal vr-a vd-1021">
      <h3 class="sched-dir-h" style="color:var(--red)"><span class="ko-only">시그니엘 → BEXCO</span><span class="en-only">Signiel → BEXCO</span></h3>
      <div class="sched-hbus"><table>
        <thead><tr><th><span class="ko-only">회차</span><span class="en-only">Trip</span></th><th>1</th><th>2</th><th>3</th><th>4</th><th>5</th><th>6</th><th>7</th><th>8</th><th>9</th><th>10</th><th>11</th><th>12</th><th>13</th><th>14</th><th>15</th><th>16</th></tr></thead>
        <tbody>
          <tr><th><span class="ko-only">시그니엘</span><span class="en-only">Signiel</span></th><td>7:00</td><td>7:20</td><td>7:40</td><td>8:00</td><td>8:20</td><td>8:40</td><td>9:00</td><td>9:20</td><td>9:40</td><td>10:00</td><td>11:00</td><td>12:00</td><td>13:00</td><td>14:00</td><td>15:00</td><td>16:00</td></tr>
          <tr><th><span class="ko-only">파라다이스</span><span class="en-only">Paradise</span></th><td>7:07</td><td>7:27</td><td>7:47</td><td>8:07</td><td>8:27</td><td>8:47</td><td>9:07</td><td>9:27</td><td>9:47</td><td>10:07</td><td>11:07</td><td>12:07</td><td>13:07</td><td>14:07</td><td>15:07</td><td>16:07</td></tr>
          <tr><th>BEXCO</th><td>7:25</td><td>7:45</td><td>8:05</td><td>8:25</td><td>8:45</td><td>9:05</td><td>9:25</td><td>9:45</td><td>10:05</td><td>10:25</td><td>11:25</td><td>12:25</td><td>13:25</td><td>14:25</td><td>15:25</td><td>16:25</td></tr>
        </tbody>
      </table></div>
    </div>
```

- [ ] **Step 2: 10/21 오는 편(BEXCO → 시그니엘) 병합**

BEFORE:
```html
    <div class="sched-dir reveal vr-a vd-1021" style="margin-bottom:0">
      <h3 class="sched-dir-h" style="color:var(--navy)"><span class="ko-only">BEXCO → 시그니엘</span><span class="en-only">BEXCO → Signiel</span></h3>
      <div class="sched-phase">
        <div class="sched-h"><span class="ko-only">일반 운행</span><span class="en-only">Regular</span></div>
        <div class="sched-hbus"><table>
          <thead><tr><th><span class="ko-only">회차</span><span class="en-only">Trip</span></th><th>1</th><th>2</th><th>3</th><th>4</th><th>5</th><th>6</th><th>7</th></tr></thead>
          <tbody>
            <tr><th>BEXCO</th><td>10:30</td><td>11:30</td><td>12:30</td><td>13:30</td><td>14:30</td><td>15:30</td><td>16:30</td></tr>
            <tr><th><span class="ko-only">파라다이스</span><span class="en-only">Paradise</span></th><td>10:48</td><td>11:48</td><td>12:48</td><td>13:48</td><td>14:48</td><td>15:48</td><td>16:48</td></tr>
            <tr><th><span class="ko-only">시그니엘</span><span class="en-only">Signiel</span></th><td>10:53</td><td>11:53</td><td>12:53</td><td>13:53</td><td>14:53</td><td>15:53</td><td>16:53</td></tr>
          </tbody>
        </table></div>
      </div>
      <div class="sched-phase">
        <div class="sched-h"><span class="ko-only">집중 운행</span><span class="en-only">Peak</span></div>
        <div class="sched-hbus"><table>
          <thead><tr><th><span class="ko-only">회차</span><span class="en-only">Trip</span></th><th>8</th><th>9</th><th>10</th><th>11</th></tr></thead>
          <tbody>
            <tr><th>BEXCO</th><td>17:30</td><td>17:50</td><td>18:10</td><td>18:30</td></tr>
            <tr><th><span class="ko-only">파라다이스</span><span class="en-only">Paradise</span></th><td>17:48</td><td>18:08</td><td>18:28</td><td>18:48</td></tr>
            <tr><th><span class="ko-only">시그니엘</span><span class="en-only">Signiel</span></th><td>17:53</td><td>18:13</td><td>18:33</td><td>18:53</td></tr>
          </tbody>
        </table></div>
      </div>
    </div>
```

AFTER:
```html
    <div class="sched-dir reveal vr-a vd-1021" style="margin-bottom:0">
      <h3 class="sched-dir-h" style="color:var(--navy)"><span class="ko-only">BEXCO → 시그니엘</span><span class="en-only">BEXCO → Signiel</span></h3>
      <div class="sched-hbus"><table>
        <thead><tr><th><span class="ko-only">회차</span><span class="en-only">Trip</span></th><th>1</th><th>2</th><th>3</th><th>4</th><th>5</th><th>6</th><th>7</th><th>8</th><th>9</th><th>10</th><th>11</th></tr></thead>
        <tbody>
          <tr><th>BEXCO</th><td>10:30</td><td>11:30</td><td>12:30</td><td>13:30</td><td>14:30</td><td>15:30</td><td>16:30</td><td>17:30</td><td>17:50</td><td>18:10</td><td>18:30</td></tr>
          <tr><th><span class="ko-only">파라다이스</span><span class="en-only">Paradise</span></th><td>10:48</td><td>11:48</td><td>12:48</td><td>13:48</td><td>14:48</td><td>15:48</td><td>16:48</td><td>17:48</td><td>18:08</td><td>18:28</td><td>18:48</td></tr>
          <tr><th><span class="ko-only">시그니엘</span><span class="en-only">Signiel</span></th><td>10:53</td><td>11:53</td><td>12:53</td><td>13:53</td><td>14:53</td><td>15:53</td><td>16:53</td><td>17:53</td><td>18:13</td><td>18:33</td><td>18:53</td></tr>
        </tbody>
      </table></div>
    </div>
```

- [ ] **Step 3: 10/22 가는 편(시그니엘 → BEXCO) 병합**

BEFORE: 집중(회차 1~5: 시그니엘 7:20/7:30/7:40/7:50/8:00, 파라다이스 7:27/7:37/7:47/7:57/8:07, BEXCO 7:45/7:55/8:05/8:15/8:25) + 일반(회차 6~13: 시그니엘 9:00/10:00/11:00/12:00/13:00/14:00/15:00/16:00, 파라다이스 9:07/10:07/11:07/12:07/13:07/14:07/15:07/16:07, BEXCO 9:25/10:25/11:25/12:25/13:25/14:25/15:25/16:25) — 2개 `.sched-phase`로 분리된 기존 마크업(파일에서 `vr-a vd-1022`이고 헤딩이 "시그니엘 → BEXCO"인 블록).

AFTER:
```html
    <div class="sched-dir reveal vr-a vd-1022">
      <h3 class="sched-dir-h" style="color:var(--red)"><span class="ko-only">시그니엘 → BEXCO</span><span class="en-only">Signiel → BEXCO</span></h3>
      <div class="sched-hbus"><table>
        <thead><tr><th><span class="ko-only">회차</span><span class="en-only">Trip</span></th><th>1</th><th>2</th><th>3</th><th>4</th><th>5</th><th>6</th><th>7</th><th>8</th><th>9</th><th>10</th><th>11</th><th>12</th><th>13</th></tr></thead>
        <tbody>
          <tr><th><span class="ko-only">시그니엘</span><span class="en-only">Signiel</span></th><td>7:20</td><td>7:30</td><td>7:40</td><td>7:50</td><td>8:00</td><td>9:00</td><td>10:00</td><td>11:00</td><td>12:00</td><td>13:00</td><td>14:00</td><td>15:00</td><td>16:00</td></tr>
          <tr><th><span class="ko-only">파라다이스</span><span class="en-only">Paradise</span></th><td>7:27</td><td>7:37</td><td>7:47</td><td>7:57</td><td>8:07</td><td>9:07</td><td>10:07</td><td>11:07</td><td>12:07</td><td>13:07</td><td>14:07</td><td>15:07</td><td>16:07</td></tr>
          <tr><th>BEXCO</th><td>7:45</td><td>7:55</td><td>8:05</td><td>8:15</td><td>8:25</td><td>9:25</td><td>10:25</td><td>11:25</td><td>12:25</td><td>13:25</td><td>14:25</td><td>15:25</td><td>16:25</td></tr>
        </tbody>
      </table></div>
    </div>
```

- [ ] **Step 4: 10/22 오는 편(BEXCO → 시그니엘) 병합 — 3개 서브테이블(일반+집중+리셉션)**

BEFORE: 일반(1~7) + 집중(8~13) + 리셉션(14~15), 3개 `.sched-phase`로 분리.

AFTER:
```html
    <div class="sched-dir reveal vr-a vd-1022" style="margin-bottom:0">
      <h3 class="sched-dir-h" style="color:var(--navy)"><span class="ko-only">BEXCO → 시그니엘</span><span class="en-only">BEXCO → Signiel</span></h3>
      <div class="sched-hbus"><table>
        <thead><tr><th><span class="ko-only">회차</span><span class="en-only">Trip</span></th><th>1</th><th>2</th><th>3</th><th>4</th><th>5</th><th>6</th><th>7</th><th>8</th><th>9</th><th>10</th><th>11</th><th>12</th><th>13</th><th>14</th><th>15</th></tr></thead>
        <tbody>
          <tr><th>BEXCO</th><td>10:30</td><td>11:30</td><td>12:30</td><td>13:30</td><td>14:30</td><td>15:30</td><td>16:30</td><td>17:00</td><td>17:30</td><td>18:00</td><td>18:10</td><td>18:20</td><td>18:30</td><td>19:40</td><td>19:50</td></tr>
          <tr><th><span class="ko-only">파라다이스</span><span class="en-only">Paradise</span></th><td>10:48</td><td>11:48</td><td>12:48</td><td>13:48</td><td>14:48</td><td>15:48</td><td>16:48</td><td>17:18</td><td>17:48</td><td>18:18</td><td>18:28</td><td>18:38</td><td>18:48</td><td>19:58</td><td>20:08</td></tr>
          <tr><th><span class="ko-only">시그니엘</span><span class="en-only">Signiel</span></th><td>10:53</td><td>11:53</td><td>12:53</td><td>13:53</td><td>14:53</td><td>15:53</td><td>16:53</td><td>17:23</td><td>17:53</td><td>18:23</td><td>18:33</td><td>18:43</td><td>18:53</td><td>20:03</td><td>20:13</td></tr>
        </tbody>
      </table></div>
    </div>
```

- [ ] **Step 5: 10/23 가는 편(시그니엘 → BEXCO) 병합**

BEFORE: 집중(1~5) + 일반(6~13) — 10/22 가는 편과 시각이 동일하다(파일에서 실제로 같은 숫자임, 원본 PPTX 기준 두 날짜 운영시간이 같아서다).

AFTER:
```html
    <div class="sched-dir reveal vr-a vd-1023">
      <h3 class="sched-dir-h" style="color:var(--red)"><span class="ko-only">시그니엘 → BEXCO</span><span class="en-only">Signiel → BEXCO</span></h3>
      <div class="sched-hbus"><table>
        <thead><tr><th><span class="ko-only">회차</span><span class="en-only">Trip</span></th><th>1</th><th>2</th><th>3</th><th>4</th><th>5</th><th>6</th><th>7</th><th>8</th><th>9</th><th>10</th><th>11</th><th>12</th><th>13</th></tr></thead>
        <tbody>
          <tr><th><span class="ko-only">시그니엘</span><span class="en-only">Signiel</span></th><td>7:20</td><td>7:30</td><td>7:40</td><td>7:50</td><td>8:00</td><td>9:00</td><td>10:00</td><td>11:00</td><td>12:00</td><td>13:00</td><td>14:00</td><td>15:00</td><td>16:00</td></tr>
          <tr><th><span class="ko-only">파라다이스</span><span class="en-only">Paradise</span></th><td>7:27</td><td>7:37</td><td>7:47</td><td>7:57</td><td>8:07</td><td>9:07</td><td>10:07</td><td>11:07</td><td>12:07</td><td>13:07</td><td>14:07</td><td>15:07</td><td>16:07</td></tr>
          <tr><th>BEXCO</th><td>7:45</td><td>7:55</td><td>8:05</td><td>8:15</td><td>8:25</td><td>9:25</td><td>10:25</td><td>11:25</td><td>12:25</td><td>13:25</td><td>14:25</td><td>15:25</td><td>16:25</td></tr>
        </tbody>
      </table></div>
    </div>
```

- [ ] **Step 6: 10/23 오는 편(BEXCO → 시그니엘) 병합**

BEFORE: 일반(1~7) + 집중(8~11).

AFTER:
```html
    <div class="sched-dir reveal vr-a vd-1023" style="margin-bottom:0">
      <h3 class="sched-dir-h" style="color:var(--navy)"><span class="ko-only">BEXCO → 시그니엘</span><span class="en-only">BEXCO → Signiel</span></h3>
      <div class="sched-hbus"><table>
        <thead><tr><th><span class="ko-only">회차</span><span class="en-only">Trip</span></th><th>1</th><th>2</th><th>3</th><th>4</th><th>5</th><th>6</th><th>7</th><th>8</th><th>9</th><th>10</th><th>11</th></tr></thead>
        <tbody>
          <tr><th>BEXCO</th><td>10:30</td><td>11:30</td><td>12:30</td><td>13:30</td><td>14:30</td><td>15:30</td><td>16:30</td><td>17:00</td><td>17:10</td><td>17:20</td><td>17:30</td></tr>
          <tr><th><span class="ko-only">파라다이스</span><span class="en-only">Paradise</span></th><td>10:48</td><td>11:48</td><td>12:48</td><td>13:48</td><td>14:48</td><td>15:48</td><td>16:48</td><td>17:18</td><td>17:28</td><td>17:38</td><td>17:48</td></tr>
          <tr><th><span class="ko-only">시그니엘</span><span class="en-only">Signiel</span></th><td>10:53</td><td>11:53</td><td>12:53</td><td>13:53</td><td>14:53</td><td>15:53</td><td>16:53</td><td>17:23</td><td>17:33</td><td>17:43</td><td>17:53</td></tr>
        </tbody>
      </table></div>
    </div>
```

- [ ] **Step 7: 10/24 가는 편(시그니엘 → BEXCO) 병합**

BEFORE: 집중(1~5) + 일반(6~11).

AFTER:
```html
    <div class="sched-dir reveal vr-a vd-1024">
      <h3 class="sched-dir-h" style="color:var(--red)"><span class="ko-only">시그니엘 → BEXCO</span><span class="en-only">Signiel → BEXCO</span></h3>
      <div class="sched-hbus"><table>
        <thead><tr><th><span class="ko-only">회차</span><span class="en-only">Trip</span></th><th>1</th><th>2</th><th>3</th><th>4</th><th>5</th><th>6</th><th>7</th><th>8</th><th>9</th><th>10</th><th>11</th></tr></thead>
        <tbody>
          <tr><th><span class="ko-only">시그니엘</span><span class="en-only">Signiel</span></th><td>7:20</td><td>7:30</td><td>7:40</td><td>7:50</td><td>8:00</td><td>9:00</td><td>10:00</td><td>11:00</td><td>12:00</td><td>13:00</td><td>14:00</td></tr>
          <tr><th><span class="ko-only">파라다이스</span><span class="en-only">Paradise</span></th><td>7:27</td><td>7:37</td><td>7:47</td><td>7:57</td><td>8:07</td><td>9:07</td><td>10:07</td><td>11:07</td><td>12:07</td><td>13:07</td><td>14:07</td></tr>
          <tr><th>BEXCO</th><td>7:45</td><td>7:55</td><td>8:05</td><td>8:15</td><td>8:25</td><td>9:25</td><td>10:25</td><td>11:25</td><td>12:25</td><td>13:25</td><td>14:25</td></tr>
        </tbody>
      </table></div>
    </div>
```

- [ ] **Step 8: 10/24 오는 편(BEXCO → 시그니엘) 병합**

BEFORE: 일반(1~5) + 집중(6~10).

AFTER:
```html
    <div class="sched-dir reveal vr-a vd-1024" style="margin-bottom:0">
      <h3 class="sched-dir-h" style="color:var(--navy)"><span class="ko-only">BEXCO → 시그니엘</span><span class="en-only">BEXCO → Signiel</span></h3>
      <div class="sched-hbus"><table>
        <thead><tr><th><span class="ko-only">회차</span><span class="en-only">Trip</span></th><th>1</th><th>2</th><th>3</th><th>4</th><th>5</th><th>6</th><th>7</th><th>8</th><th>9</th><th>10</th></tr></thead>
        <tbody>
          <tr><th>BEXCO</th><td>10:30</td><td>11:30</td><td>12:30</td><td>13:30</td><td>14:30</td><td>15:20</td><td>15:30</td><td>15:40</td><td>15:50</td><td>16:00</td></tr>
          <tr><th><span class="ko-only">파라다이스</span><span class="en-only">Paradise</span></th><td>10:48</td><td>11:48</td><td>12:48</td><td>13:48</td><td>14:48</td><td>15:38</td><td>15:48</td><td>15:58</td><td>16:08</td><td>16:18</td></tr>
          <tr><th><span class="ko-only">시그니엘</span><span class="en-only">Signiel</span></th><td>10:53</td><td>11:53</td><td>12:53</td><td>13:53</td><td>14:53</td><td>15:43</td><td>15:53</td><td>16:03</td><td>16:13</td><td>16:23</td></tr>
        </tbody>
      </table></div>
    </div>
```

- [ ] **Step 9: 렌더 확인**

로컬 서버에서 "A 노선" 탭 선택 후 날짜 탭 4개(10/21~10/24)를 순서대로 클릭하며 각 표의 회차 수·마지막 컬럼 값이 위 AFTER 코드와 일치하는지, "집중 운행"/"일반 운행" 소제목이 완전히 사라졌는지 스크린샷으로 확인.

- [ ] **Step 10: 커밋**

```bash
cd aphrs-2026-transport
git add shuttle-venue.html
git commit -m "refactor: shuttle-venue 노선 A 시간표 8개 방향-블록 집중/일반 서브테이블 통합"
```

---

### Task 5: 노선 B 시간표 8개 방향-블록 — 집중/일반/리셉션 서브테이블 통합

**Files:**
- Modify: `aphrs-2026-transport/shuttle-venue.html` (노선 B, 10/21~10/24 × 가는 편/오는 편 = 8개 `.sched-dir` 블록)

**Interfaces:**
- Consumes: 없음.
- Produces: 없음.

- [ ] **Step 1: 10/21 가는 편(웨스틴조선 → BEXCO) 병합**

BEFORE: 집중(1~9) + 일반(10~16).

AFTER:
```html
    <div class="sched-dir reveal vr-b vd-1021">
      <h3 class="sched-dir-h" style="color:var(--red)"><span class="ko-only">웨스틴조선 → BEXCO</span><span class="en-only">Westin Josun → BEXCO</span></h3>
      <div class="sched-hbus"><table>
        <thead><tr><th><span class="ko-only">회차</span><span class="en-only">Trip</span></th><th>1</th><th>2</th><th>3</th><th>4</th><th>5</th><th>6</th><th>7</th><th>8</th><th>9</th><th>10</th><th>11</th><th>12</th><th>13</th><th>14</th><th>15</th><th>16</th></tr></thead>
        <tbody>
          <tr><th><span class="ko-only">웨스틴조선</span><span class="en-only">Westin Josun</span></th><td>7:00</td><td>7:20</td><td>7:40</td><td>8:00</td><td>8:20</td><td>8:40</td><td>9:00</td><td>9:20</td><td>9:40</td><td>10:00</td><td>11:00</td><td>12:00</td><td>13:00</td><td>14:00</td><td>15:00</td><td>16:00</td></tr>
          <tr><th><span class="ko-only">파크하얏트</span><span class="en-only">Park Hyatt</span></th><td>7:10</td><td>7:30</td><td>7:50</td><td>8:10</td><td>8:30</td><td>8:50</td><td>9:10</td><td>9:30</td><td>9:50</td><td>10:10</td><td>11:10</td><td>12:10</td><td>13:10</td><td>14:10</td><td>15:10</td><td>16:10</td></tr>
          <tr><th>BEXCO</th><td>7:20</td><td>7:40</td><td>8:00</td><td>8:20</td><td>8:40</td><td>9:00</td><td>9:20</td><td>9:40</td><td>10:00</td><td>10:20</td><td>11:20</td><td>12:20</td><td>13:20</td><td>14:20</td><td>15:20</td><td>16:20</td></tr>
        </tbody>
      </table></div>
    </div>
```

- [ ] **Step 2: 10/21 오는 편(BEXCO → 웨스틴조선) 병합**

BEFORE: 일반(1~7) + 집중(8~11).

AFTER:
```html
    <div class="sched-dir reveal vr-b vd-1021" style="margin-bottom:0">
      <h3 class="sched-dir-h" style="color:var(--navy)"><span class="ko-only">BEXCO → 웨스틴조선</span><span class="en-only">BEXCO → Westin Josun</span></h3>
      <div class="sched-hbus"><table>
        <thead><tr><th><span class="ko-only">회차</span><span class="en-only">Trip</span></th><th>1</th><th>2</th><th>3</th><th>4</th><th>5</th><th>6</th><th>7</th><th>8</th><th>9</th><th>10</th><th>11</th></tr></thead>
        <tbody>
          <tr><th>BEXCO</th><td>10:30</td><td>11:30</td><td>12:30</td><td>13:30</td><td>14:30</td><td>15:30</td><td>16:30</td><td>17:30</td><td>17:50</td><td>18:10</td><td>18:30</td></tr>
          <tr><th><span class="ko-only">파크하얏트</span><span class="en-only">Park Hyatt</span></th><td>10:42</td><td>11:42</td><td>12:42</td><td>13:42</td><td>14:42</td><td>15:42</td><td>16:42</td><td>17:42</td><td>18:02</td><td>18:22</td><td>18:42</td></tr>
          <tr><th><span class="ko-only">웨스틴조선</span><span class="en-only">Westin Josun</span></th><td>10:50</td><td>11:50</td><td>12:50</td><td>13:50</td><td>14:50</td><td>15:50</td><td>16:50</td><td>17:50</td><td>18:10</td><td>18:30</td><td>18:50</td></tr>
        </tbody>
      </table></div>
    </div>
```

- [ ] **Step 3: 10/22 가는 편(웨스틴조선 → BEXCO) 병합**

BEFORE: 집중(1~5) + 일반(6~13).

AFTER:
```html
    <div class="sched-dir reveal vr-b vd-1022">
      <h3 class="sched-dir-h" style="color:var(--red)"><span class="ko-only">웨스틴조선 → BEXCO</span><span class="en-only">Westin Josun → BEXCO</span></h3>
      <div class="sched-hbus"><table>
        <thead><tr><th><span class="ko-only">회차</span><span class="en-only">Trip</span></th><th>1</th><th>2</th><th>3</th><th>4</th><th>5</th><th>6</th><th>7</th><th>8</th><th>9</th><th>10</th><th>11</th><th>12</th><th>13</th></tr></thead>
        <tbody>
          <tr><th><span class="ko-only">웨스틴조선</span><span class="en-only">Westin Josun</span></th><td>7:20</td><td>7:30</td><td>7:40</td><td>7:50</td><td>8:00</td><td>9:00</td><td>10:00</td><td>11:00</td><td>12:00</td><td>13:00</td><td>14:00</td><td>15:00</td><td>16:00</td></tr>
          <tr><th><span class="ko-only">파크하얏트</span><span class="en-only">Park Hyatt</span></th><td>7:30</td><td>7:40</td><td>7:50</td><td>8:00</td><td>8:10</td><td>9:10</td><td>10:10</td><td>11:10</td><td>12:10</td><td>13:10</td><td>14:10</td><td>15:10</td><td>16:10</td></tr>
          <tr><th>BEXCO</th><td>7:40</td><td>7:50</td><td>8:00</td><td>8:10</td><td>8:20</td><td>9:20</td><td>10:20</td><td>11:20</td><td>12:20</td><td>13:20</td><td>14:20</td><td>15:20</td><td>16:20</td></tr>
        </tbody>
      </table></div>
    </div>
```

- [ ] **Step 4: 10/22 오는 편(BEXCO → 웨스틴조선) 병합 — 3개 서브테이블(일반+집중+리셉션)**

BEFORE: 일반(1~7) + 집중(8~13) + 리셉션(14~15).

AFTER:
```html
    <div class="sched-dir reveal vr-b vd-1022" style="margin-bottom:0">
      <h3 class="sched-dir-h" style="color:var(--navy)"><span class="ko-only">BEXCO → 웨스틴조선</span><span class="en-only">BEXCO → Westin Josun</span></h3>
      <div class="sched-hbus"><table>
        <thead><tr><th><span class="ko-only">회차</span><span class="en-only">Trip</span></th><th>1</th><th>2</th><th>3</th><th>4</th><th>5</th><th>6</th><th>7</th><th>8</th><th>9</th><th>10</th><th>11</th><th>12</th><th>13</th><th>14</th><th>15</th></tr></thead>
        <tbody>
          <tr><th>BEXCO</th><td>10:30</td><td>11:30</td><td>12:30</td><td>13:30</td><td>14:30</td><td>15:30</td><td>16:30</td><td>17:00</td><td>17:30</td><td>18:00</td><td>18:10</td><td>18:20</td><td>18:30</td><td>19:40</td><td>19:50</td></tr>
          <tr><th><span class="ko-only">파크하얏트</span><span class="en-only">Park Hyatt</span></th><td>10:42</td><td>11:42</td><td>12:42</td><td>13:42</td><td>14:42</td><td>15:42</td><td>16:42</td><td>17:12</td><td>17:42</td><td>18:12</td><td>18:22</td><td>18:32</td><td>18:42</td><td>19:52</td><td>20:02</td></tr>
          <tr><th><span class="ko-only">웨스틴조선</span><span class="en-only">Westin Josun</span></th><td>10:50</td><td>11:50</td><td>12:50</td><td>13:50</td><td>14:50</td><td>15:50</td><td>16:50</td><td>17:20</td><td>17:50</td><td>18:20</td><td>18:30</td><td>18:40</td><td>18:50</td><td>20:00</td><td>20:10</td></tr>
        </tbody>
      </table></div>
    </div>
```

- [ ] **Step 5: 10/23 가는 편(웨스틴조선 → BEXCO) 병합**

BEFORE: 집중(1~5) + 일반(6~13) — 10/22 가는 편과 시각 동일(같은 이유로 원본 데이터가 같음).

AFTER:
```html
    <div class="sched-dir reveal vr-b vd-1023">
      <h3 class="sched-dir-h" style="color:var(--red)"><span class="ko-only">웨스틴조선 → BEXCO</span><span class="en-only">Westin Josun → BEXCO</span></h3>
      <div class="sched-hbus"><table>
        <thead><tr><th><span class="ko-only">회차</span><span class="en-only">Trip</span></th><th>1</th><th>2</th><th>3</th><th>4</th><th>5</th><th>6</th><th>7</th><th>8</th><th>9</th><th>10</th><th>11</th><th>12</th><th>13</th></tr></thead>
        <tbody>
          <tr><th><span class="ko-only">웨스틴조선</span><span class="en-only">Westin Josun</span></th><td>7:20</td><td>7:30</td><td>7:40</td><td>7:50</td><td>8:00</td><td>9:00</td><td>10:00</td><td>11:00</td><td>12:00</td><td>13:00</td><td>14:00</td><td>15:00</td><td>16:00</td></tr>
          <tr><th><span class="ko-only">파크하얏트</span><span class="en-only">Park Hyatt</span></th><td>7:30</td><td>7:40</td><td>7:50</td><td>8:00</td><td>8:10</td><td>9:10</td><td>10:10</td><td>11:10</td><td>12:10</td><td>13:10</td><td>14:10</td><td>15:10</td><td>16:10</td></tr>
          <tr><th>BEXCO</th><td>7:40</td><td>7:50</td><td>8:00</td><td>8:10</td><td>8:20</td><td>9:20</td><td>10:20</td><td>11:20</td><td>12:20</td><td>13:20</td><td>14:20</td><td>15:20</td><td>16:20</td></tr>
        </tbody>
      </table></div>
    </div>
```

- [ ] **Step 6: 10/23 오는 편(BEXCO → 웨스틴조선, 17시 이후 시그니엘까지 연장) 병합 — 4번째 행에 대시(—) 있음**

BEFORE: 일반(1~7, 시그니엘(연장) 행은 전부 `—`) + 집중(8~11, 시그니엘(연장) 행은 실제 시각). 헤딩 텍스트에 "(17시 이후 시그니엘까지 연장)" 부가 문구가 붙어 있음 — 그대로 유지.

AFTER:
```html
    <div class="sched-dir reveal vr-b vd-1023" style="margin-bottom:0">
      <h3 class="sched-dir-h" style="color:var(--navy)"><span class="ko-only">BEXCO → 웨스틴조선 (17시 이후 시그니엘까지 연장)</span><span class="en-only">BEXCO → Westin Josun (extends to Signiel after 17:00)</span></h3>
      <div class="sched-hbus"><table>
        <thead><tr><th><span class="ko-only">회차</span><span class="en-only">Trip</span></th><th>1</th><th>2</th><th>3</th><th>4</th><th>5</th><th>6</th><th>7</th><th>8</th><th>9</th><th>10</th><th>11</th></tr></thead>
        <tbody>
          <tr><th>BEXCO</th><td>10:30</td><td>11:30</td><td>12:30</td><td>13:30</td><td>14:30</td><td>15:30</td><td>16:30</td><td>17:00</td><td>17:10</td><td>17:20</td><td>17:30</td></tr>
          <tr><th><span class="ko-only">파크하얏트</span><span class="en-only">Park Hyatt</span></th><td>10:42</td><td>11:42</td><td>12:42</td><td>13:42</td><td>14:42</td><td>15:42</td><td>16:42</td><td>17:12</td><td>17:22</td><td>17:32</td><td>17:42</td></tr>
          <tr><th><span class="ko-only">웨스틴조선</span><span class="en-only">Westin Josun</span></th><td>10:50</td><td>11:50</td><td>12:50</td><td>13:50</td><td>14:50</td><td>15:50</td><td>16:50</td><td>17:20</td><td>17:30</td><td>17:40</td><td>17:50</td></tr>
          <tr><th><span class="ko-only">시그니엘(연장)</span><span class="en-only">Signiel (ext.)</span></th><td>—</td><td>—</td><td>—</td><td>—</td><td>—</td><td>—</td><td>—</td><td>17:30</td><td>17:40</td><td>17:50</td><td>18:00</td></tr>
        </tbody>
      </table></div>
    </div>
```

- [ ] **Step 7: 10/24 가는 편(웨스틴조선 → BEXCO) 병합**

BEFORE: 집중(1~5) + 일반(6~11).

AFTER:
```html
    <div class="sched-dir reveal vr-b vd-1024">
      <h3 class="sched-dir-h" style="color:var(--red)"><span class="ko-only">웨스틴조선 → BEXCO</span><span class="en-only">Westin Josun → BEXCO</span></h3>
      <div class="sched-hbus"><table>
        <thead><tr><th><span class="ko-only">회차</span><span class="en-only">Trip</span></th><th>1</th><th>2</th><th>3</th><th>4</th><th>5</th><th>6</th><th>7</th><th>8</th><th>9</th><th>10</th><th>11</th></tr></thead>
        <tbody>
          <tr><th><span class="ko-only">웨스틴조선</span><span class="en-only">Westin Josun</span></th><td>7:20</td><td>7:30</td><td>7:40</td><td>7:50</td><td>8:00</td><td>9:00</td><td>10:00</td><td>11:00</td><td>12:00</td><td>13:00</td><td>14:00</td></tr>
          <tr><th><span class="ko-only">파크하얏트</span><span class="en-only">Park Hyatt</span></th><td>7:30</td><td>7:40</td><td>7:50</td><td>8:00</td><td>8:10</td><td>9:10</td><td>10:10</td><td>11:10</td><td>12:10</td><td>13:10</td><td>14:10</td></tr>
          <tr><th>BEXCO</th><td>7:40</td><td>7:50</td><td>8:00</td><td>8:10</td><td>8:20</td><td>9:20</td><td>10:20</td><td>11:20</td><td>12:20</td><td>13:20</td><td>14:20</td></tr>
        </tbody>
      </table></div>
    </div>
```

- [ ] **Step 8: 10/24 오는 편(BEXCO → 웨스틴조선) 병합**

BEFORE: 일반(1~5) + 집중(6~10).

AFTER:
```html
    <div class="sched-dir reveal vr-b vd-1024" style="margin-bottom:0">
      <h3 class="sched-dir-h" style="color:var(--navy)"><span class="ko-only">BEXCO → 웨스틴조선</span><span class="en-only">BEXCO → Westin Josun</span></h3>
      <div class="sched-hbus"><table>
        <thead><tr><th><span class="ko-only">회차</span><span class="en-only">Trip</span></th><th>1</th><th>2</th><th>3</th><th>4</th><th>5</th><th>6</th><th>7</th><th>8</th><th>9</th><th>10</th></tr></thead>
        <tbody>
          <tr><th>BEXCO</th><td>10:30</td><td>11:30</td><td>12:30</td><td>13:30</td><td>14:30</td><td>15:20</td><td>15:30</td><td>15:40</td><td>15:50</td><td>16:00</td></tr>
          <tr><th><span class="ko-only">파크하얏트</span><span class="en-only">Park Hyatt</span></th><td>10:42</td><td>11:42</td><td>12:42</td><td>13:42</td><td>14:42</td><td>15:32</td><td>15:42</td><td>15:52</td><td>16:02</td><td>16:12</td></tr>
          <tr><th><span class="ko-only">웨스틴조선</span><span class="en-only">Westin Josun</span></th><td>10:50</td><td>11:50</td><td>12:50</td><td>13:50</td><td>14:50</td><td>15:40</td><td>15:50</td><td>16:00</td><td>16:10</td><td>16:20</td></tr>
        </tbody>
      </table></div>
    </div>
```

- [ ] **Step 9: 렌더 확인**

"B 노선" 탭 선택 후 날짜 탭 4개를 순서대로 클릭. 10/23 오는 편에서 "시그니엘(연장)" 행이 앞 7칸은 `—`, 뒤 4칸은 실제 시각으로 보이는지 특히 확인. 이어서 "이용 안내" 섹션까지 스크롤해 Faculty Dinner 박스(10/23 전용, 세로형 표 그대로 유지돼야 함)가 안 건드려졌는지 확인.

- [ ] **Step 10: 커밋**

```bash
cd aphrs-2026-transport
git add shuttle-venue.html
git commit -m "refactor: shuttle-venue 노선 B 시간표 8개 방향-블록 집중/일반/리셉션 서브테이블 통합"
```

---

### Task 6: 안내 문구 수정 + 버전 갱신 + 전체 페이지 최종 검증

**Files:**
- Modify: `aphrs-2026-transport/shuttle-venue.html` ("이용 안내" 섹션 2줄)
- Modify (버전 문자열, `bump-version.sh`가 리포 전체에서 이전 버전 문자열을 일괄 치환): 모든 `aphrs-2026-transport/*.html`의 `<meta name="version">`/`?v=` + `assets/app.js`의 `SITE_VERSION`

**Interfaces:**
- Consumes: Task 1~5의 모든 변경사항(이 태스크가 전체를 최종 검증).
- Produces: 없음(최종 태스크).

- [ ] **Step 1: FAQ 문구 수정**

`aphrs-2026-transport/shuttle-venue.html`의 "이용 안내"(`#rl-h`) 섹션에서 아래 두 줄을 찾는다:

```html
        <li>실시간 추적은 제공되지 않습니다. 지정 정류장에서 대기해 주세요.</li>
```
```html
        <li>Real-time tracking is not available. Please wait at your designated stop.</li>
```

각각 아래로 교체:

```html
        <li>실시간 위치 확인은 추후 제공 예정입니다. 지정 정류장에서 대기해 주세요.</li>
```
```html
        <li>Live location tracking is coming soon. Please wait at your designated stop.</li>
```

- [ ] **Step 2: 버전 갱신 (비대화형 실행)**

`aphrs-2026-transport` 폴더 안에서 대화형 확인 프롬프트를 자동 승인하며 실행한다(스크립트가 `read -rp`로 y/N을 묻으므로 `echo y |`로 파이프):

```bash
cd aphrs-2026-transport
echo y | bash bump-version.sh 2026.07.14.2
```

Expected: 콘솔에 "현재 버전: 2026.07.14.1" / "새 버전 : 2026.07.14.2" 출력 후 "완료: N개 파일 → 2026.07.14.2" 로 끝난다(N은 `<meta name="version">`/`?v=`/`SITE_VERSION`을 가진 모든 HTML·JS·CSS 파일 수).

- [ ] **Step 3: 버전 갱신 확인**

```bash
grep -c "2026.07.14.2" shuttle-venue.html
grep "SITE_VERSION" assets/app.js
```

Expected: `shuttle-venue.html`에서 3곳(`<meta name="version">`, `transport.css?v=`, `app.js?v=`) 이상 매치, `assets/app.js`의 `SITE_VERSION`도 `'2026.07.14.2'`로 갱신돼 있어야 한다.

- [ ] **Step 4: 전체 페이지 최종 시각 검증**

로컬 서버(`python -m http.server 8000`, 리포 루트에서)로 `http://localhost:8000/aphrs-2026-transport/shuttle-venue.html`을 열고 아래를 전부 확인(데스크톱 1280px 우선, 이후 모바일 390px):

1. A/B 노선 탭 전환 시 route-map 노선도(가는 편·오는 편 카드 2개)와 시간표가 함께 바뀌는지.
2. 날짜 탭 4개 전환 시 시간표만 바뀌고 노선도는 그대로인지.
3. 병합된 시간표 16개 블록 어디에도 "집중 운행"/"일반 운행"/"리셉션 운행" 소제목이 안 남아있는지(`grep -c "sched-phase\|sched-h\"" shuttle-venue.html` 결과가 0인지 커맨드로도 교차 확인).
4. "실시간 위치 확인 (준비중)" 버튼 클릭 시 페이지 이동이 없는지(placeholder 확인), 하단 "이용 안내"의 문구가 Step 1대로 바뀌었는지.
5. 10/23 탭에서 A/B 어느 노선이든 Faculty Dinner 박스가 항상 보이는지.
6. 모바일(390px)에서 `.rm-head`(배지+텍스트+Live 버튼) 줄바꿈이 어색하지 않은지, `.route-map`이 세로 타임라인으로 정상 전환되는지, 병합된 넓은 시간표가 페이지 전체를 밀지 않고 표 안에서만 가로 스크롤되는지.
7. 브라우저 콘솔에 에러가 없는지.

- [ ] **Step 5: 커밋**

```bash
cd aphrs-2026-transport
git add -A
git commit -m "$(cat <<'EOF'
build: 실시간 위치 안내 문구 수정 + 버전 2026.07.14.2 갱신

행사장 셔틀 노선도 route-map 전환 + 시간표 통합 작업 완료.
EOF
)"
```

---

## Self-Review Notes (writing-plans 자기검토 결과)

- **스펙 커버리지**: §4.1(노선도 route-map 전환) → Task 1~3. §4.2(시간표 통합) → Task 4~5. §6 텍스트 수정·버전 → Task 6. §7·§8(접이식 미채택·방향 분리 유지·placeholder 버튼)은 Global Constraints + 각 태스크 확인 스텝에 반영. 누락 없음.
- **플레이스홀더 스캔**: "TBD"/"similar to"/미완성 코드 없음 — 16개 시간표 블록 전부 실제 원본 파일 데이터 그대로 완전히 작성함.
- **타입/네이밍 일관성**: 클래스명(`route-map`/`rm-track`/`rm-line`/`rm-stop`/`rm-dot`/`rm-label`/`rt-tag`/`rm-live`/`rm-head`)이 Task 1~3 전체에서 동일하게 사용됨. `vr-a`/`vr-b`/`vd-1021~1024` 토글 클래스는 기존 파일의 인라인 `<script>`(변경 대상 아님)가 그대로 참조하므로 마크업에서 이 클래스명을 절대 바꾸지 않았음을 재확인함.
