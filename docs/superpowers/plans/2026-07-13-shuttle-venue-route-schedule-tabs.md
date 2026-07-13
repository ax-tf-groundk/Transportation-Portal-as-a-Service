# 행사장 셔틀 노선×날짜 탭 + U자형 노선도 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** `shuttle-venue.html`의 "운행 노선"·"운행 시간표"·"Faculty Dinner 셔틀" 3개 정적 섹션을, 노선(A/B)×날짜(10/21~24) 탭으로 U자형 노선도와 실제 시간표가 함께 전환되는 통합 섹션으로 교체한다.

**Architecture:** 빌드 없는 정적 사이트 — 2노선×4날짜 = 8개 콘텐츠 블록을 전부 정적 HTML로 미리 렌더링하고, `<html data-vr="a|b" data-vd="1021|1022|1023|1024">` 두 속성 + CSS `display:none` 토글로 보이기/숨기기 (빌드 시스템·JS 데이터 객체 없음, `airport-transfer.html`의 `data-mode` 관용구와 동일).

**Tech Stack:** 순수 HTML + CSS + 바닐라 JS. 테스트 프레임워크 없음(이 프로젝트는 `python -m http.server`로 띄운 뒤 브라우저 스크린샷 육안 검수가 "테스트"에 해당 — 아래 각 태스크의 "검증" 단계가 이를 대신한다).

## Global Constraints

- 빌드·테스트·린트 명령 없음 — 파일을 직접 저장하면 그게 배포물이다 (`aphrs-2026-transport/CLAUDE.md`).
- 버전 문자열은 `YYYY.MM.DD.N` 형식으로 `<meta name="version">`, `?v=` 쿼리스트링, `SITE_VERSION`(`assets/app.js` line 9) 4곳을 항상 동시에 올린다. 오늘 마지막 확정 버전은 `2026.07.13.3` — 이 작업이 끝나면 `2026.07.13.4`로 일괄 치환한다(`bump-version.sh 2026.07.13.4` 스크립트가 이 환경에서 대화식 프롬프트 때문에 실패했었음 — `for` 루프로 직접 `sed -i 's/2026\.07\.13\.3/2026.07.13.4/g'` 치환할 것).
- **한쪽 면 컬러 보더 악센트 금지** — 카드 좌측 스트라이프 패턴(`design-principles.md §3`) 절대 넣지 않는다. `airport-transfer.html`이 이미 `.rt-card::before,.route-map::before{content:none}`로 이 패턴을 제거했었다 — 새 `.uroute` 컴포넌트도 처음부터 이 패턴 없이 설계한다.
- **노선 2(파라다이스·시그니엘) 정류장 순서 정정** — 현재 라이브 사이트는 "파라다이스 → 시그니엘 → BEXCO" 순이지만, 공식 PPTX(`APHRS2026_행사장셔틀_노선및시간표_정리.md` §1-2)는 "시그니엘 → 파라다이스 → BEXCO" 순이다. 이번 작업에서 실제 순서로 정정한다(호텔 자체나 소요시간 수치는 변경 없음, 순서만 수정).
- 실제 시간표 데이터 정본: `D:\Works\Active\APHRS2026\APHRS2026_행사장셔틀_노선및시간표_정리.md` §4. 아래 각 태스크의 HTML은 이 문서의 표를 그대로 옮긴 것 — 반올림·추정 금지.

---

### Task 1: CSS 기반 — 탭 컴포넌트 + U자형 노선도 + 8블록 토글 규칙

**Files:**
- Modify: `aphrs-2026-transport/shuttle-venue.html` (`<head>`의 인라인 `<style>` 블록, 현재 12~62번째 줄)

**Interfaces:**
- Produces: `.vtabs`/`.vtab`(노선·날짜 공용 탭 버튼 — `airport-transfer.html`의 `.limo-tabs`/`.limo-tab`를 그대로 복제해 이름 유지하되 이 페이지 전용으로 둠), `.uroute`/`.uroute-arm`/`.uroute-out`/`.uroute-back`/`.ar-lbl`/`.uroute-curve`(U자형 다이어그램), `vr-a`/`vr-b`/`vd-1021`/`vd-1022`/`vd-1023`/`vd-1024`(콘텐츠 블록 토글용 클래스)

- [ ] **Step 1: 기존 스타일 블록 끝(`</style>` 직전)에 아래 CSS를 추가한다**

```css
/* ===== Venue Shuttle — 노선×날짜 탭 + U자형 노선도 (2026-07-13) ===== */
.vtabs{display:flex;border-radius:var(--radius-sm);overflow:hidden;border:1px solid var(--line);margin-top:16px}
.vtab{flex:1;padding:13px 16px;background:#fff;border:none;font:inherit;font-size:14.5px;font-weight:700;color:var(--muted);cursor:pointer;transition:background .15s,color .15s}
.vtab:not(:last-child){border-right:1px solid var(--line)}
.vtab[aria-selected="true"]{color:var(--red);background:var(--red-050)}
.vtab:hover:not([aria-selected="true"]){color:var(--ink)}
.vtabs.vtabs-date{margin-top:10px}
.vtabs.vtabs-date .vtab{font-size:13px;padding:10px 12px}

/* U자형 노선도 — 위=가는 편, 아래=오는 편, 오른쪽을 border-radius 곡선으로 연결 */
.uroute{position:relative;background:var(--card);border:1px solid var(--line);border-radius:var(--radius);box-shadow:var(--shadow);padding:22px 64px 22px 24px;margin-top:18px}
.uroute-arm{display:flex;align-items:center;gap:14px;flex-wrap:wrap}
.uroute-arm:not(:last-child){margin-bottom:16px}
.uroute-arm .ar-lbl{flex:0 0 auto;font-size:12px;font-weight:800;color:#fff;background:var(--navy);border-radius:8px;padding:7px 12px;letter-spacing:.3px}
.uroute-back .ar-lbl{background:var(--red)}
.uroute-path{font-size:15px;font-weight:700;color:var(--ink)}
.uroute-path .ar{color:var(--red);font-weight:700;margin:0 5px}
.uroute-curve{content:"";position:absolute;top:22px;bottom:22px;right:24px;width:26px;border:3px solid var(--red);border-left:none;border-radius:0 22px 22px 0}
@media(max-width:620px){
  .uroute{padding:18px 40px 18px 18px}
  .uroute-curve{right:14px;width:16px;border-width:2.5px}
  .uroute-path{font-size:13.5px}
}

/* 노선(vr)×날짜(vd) 토글 — 두 조건 AND 결합, 둘 다 맞을 때만 표시 */
html:not([data-vr="a"]) .vr-a{display:none}
html:not([data-vr="b"]) .vr-b{display:none}
html:not([data-vd="1021"]) .vd-1021{display:none}
html:not([data-vd="1022"]) .vd-1022{display:none}
html:not([data-vd="1023"]) .vd-1023{display:none}
html:not([data-vd="1024"]) .vd-1024{display:none}
```

- [ ] **Step 2: 저장 후 육안 검증 — 아직 이 클래스를 쓰는 HTML이 없으므로 브라우저에서 확인할 대상 없음. 다음 Task에서 마크업을 추가한 뒤 함께 검증한다. 이 Step은 문법 오류 여부만 확인.**

Run: `python -m http.server 8241`(리포 루트가 아니라 `aphrs-2026-transport/` 폴더 안에서 실행) 후 `http://localhost:8241/shuttle-venue.html`을 열어 콘솔에 CSS 파싱 에러가 없는지 DevTools Console로 확인.
Expected: 에러 없음, 페이지가 기존과 동일하게 보임(아직 새 마크업을 안 넣었으므로 시각적 변화 없어야 정상).

---

### Task 2: `<html>` 상태 속성 + 탭 UI 마크업 + JS 전환 로직

**Files:**
- Modify: `aphrs-2026-transport/shuttle-venue.html`
  - `<html lang="ko">` 태그 (2번째 줄)
  - "ROUTES" 섹션(현재 142~191번째 줄, `<section class="section" aria-labelledby="rt-h">` 전체) 중 헤딩 아래 탭 UI를 새로 삽입
  - 페이지 하단 `<script>` 블록(파일 끝, 모바일 nav 토글 스크립트 근처)

**Interfaces:**
- Consumes: Task 1에서 정의한 `.vtabs`/`.vtab`/`vr-a`/`vr-b`/`vd-1021~1024` 클래스
- Produces: 클릭 시 `document.documentElement`의 `data-vr`/`data-vd` 속성을 변경하는 JS(이후 Task에서 만드는 8개 콘텐츠 블록이 이 속성값을 구독)

- [ ] **Step 1: `<html>` 태그에 기본 상태 속성 추가**

`aphrs-2026-transport/shuttle-venue.html` 2번째 줄을 다음으로 교체:

```html
<html lang="ko" data-vr="a" data-vd="1021">
```

- [ ] **Step 2: "ROUTES" 섹션의 `sec-head` 바로 아래에 탭 UI 삽입**

현재 143~152번째 줄(`<section class="section" aria-labelledby="rt-h">` ~ `</div>`의 `sec-head` 부분)의 `</div>` 바로 뒤에 아래 마크업을 추가한다:

```html
    <div class="vtabs" role="tablist" aria-label="노선 선택">
      <button class="vtab" type="button" role="tab" data-vr-btn="a" aria-selected="true">
        <span class="ko-only">A 노선 (시그니엘 · 파라다이스)</span><span class="en-only">Route A (Signiel · Paradise)</span>
      </button>
      <button class="vtab" type="button" role="tab" data-vr-btn="b" aria-selected="false" tabindex="-1">
        <span class="ko-only">B 노선 (웨스틴조선 · 파크하얏트)</span><span class="en-only">Route B (Westin Josun · Park Hyatt)</span>
      </button>
    </div>
    <div class="vtabs vtabs-date" role="tablist" aria-label="날짜 선택">
      <button class="vtab" type="button" role="tab" data-vd-btn="1021" aria-selected="true">10/21 (수)</button>
      <button class="vtab" type="button" role="tab" data-vd-btn="1022" aria-selected="false" tabindex="-1">10/22 (목)</button>
      <button class="vtab" type="button" role="tab" data-vd-btn="1023" aria-selected="false" tabindex="-1">10/23 (금)</button>
      <button class="vtab" type="button" role="tab" data-vd-btn="1024" aria-selected="false" tabindex="-1">10/24 (토)</button>
    </div>
```

- [ ] **Step 3: 파일 끝(`</body>` 직전, 모바일 nav 토글 `<script>` 다음)에 탭 전환 스크립트 추가**

```html
<script>
/* Venue Shuttle — 노선(vr) × 날짜(vd) 상태 관리 */
(function(){
  var root = document.documentElement;
  var vrBtns = Array.prototype.slice.call(document.querySelectorAll('[data-vr-btn]'));
  var vdBtns = Array.prototype.slice.call(document.querySelectorAll('[data-vd-btn]'));

  function applyGroup(btns, attr){
    var current = root.getAttribute(attr);
    btns.forEach(function(b){
      var key = b.getAttribute('data-vr-btn') || b.getAttribute('data-vd-btn');
      var on = key === current;
      b.setAttribute('aria-selected', String(on));
      b.setAttribute('tabindex', on ? '0' : '-1');
    });
  }

  vrBtns.forEach(function(b, i){
    b.addEventListener('click', function(){
      root.setAttribute('data-vr', b.getAttribute('data-vr-btn'));
      applyGroup(vrBtns, 'data-vr');
    });
    b.addEventListener('keydown', function(e){
      var d = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
      if (!d) return;
      var n = vrBtns[(i + d + vrBtns.length) % vrBtns.length];
      n.focus(); n.click();
    });
  });

  vdBtns.forEach(function(b, i){
    b.addEventListener('click', function(){
      root.setAttribute('data-vd', b.getAttribute('data-vd-btn'));
      applyGroup(vdBtns, 'data-vd');
    });
    b.addEventListener('keydown', function(e){
      var d = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
      if (!d) return;
      var n = vdBtns[(i + d + vdBtns.length) % vdBtns.length];
      n.focus(); n.click();
    });
  });

  applyGroup(vrBtns, 'data-vr');
  applyGroup(vdBtns, 'data-vd');
})();
</script>
```

- [ ] **Step 4: 검증 — 탭 클릭 시 `<html>` 속성이 바뀌는지 DevTools로 확인**

Run: 브라우저에서 `shuttle-venue.html` 열고 DevTools Console에서:
```js
document.querySelector('[data-vr-btn="b"]').click();
document.documentElement.getAttribute('data-vr')
```
Expected: `"b"` 출력. `aria-selected`가 B 탭에는 `"true"`, A 탭에는 `"false"`로 바뀌어 있어야 함(Elements 패널로 확인).

---

### Task 3: 노선 A(시그니엘·파라다이스) 4개 날짜 블록 — U자형 노선도 + 실제 시간표

**Files:**
- Modify: `aphrs-2026-transport/shuttle-venue.html` — 기존 "ROUTES" 섹션의 `.route-rows`(153~180번째 줄)와 "SCHEDULE" 섹션의 `.sched-grid`(205~299번째 줄)를 **전부 삭제**하고, Task 2에서 넣은 탭 UI 바로 아래에 이 Task와 Task 4에서 만드는 8개 블록을 넣는다.

**Interfaces:**
- Consumes: Task 1의 `.uroute` 계열 클래스, `vr-a`/`vd-1021~1024`
- Produces: 노선 A 4개 블록(`.uroute.vr-a.vd-1021` 등) — Task 5의 Faculty Dinner 블록이 `vd-1023`을 공유하므로 마크업 순서상 이 블록들 바로 뒤에 온다.

- [ ] **Step 1: 기존 `.route-rows`(153~180번째 줄)와 그 뒤 경고박스(181~189번째 줄)를 삭제하고, Task 2 탭 UI 바로 아래에 노선 A 4블록을 추가**

`아래는 삭제`: `<div class="route-rows"> ... </div>` 전체 (A노선/B노선/귀환 카드 3개) — `warn-box`(그랜드조선 안내)는 유지하되 탭 블록들 전부 뒤, `</section>` 직전으로 이동.

`아래를 탭 UI 다음에 추가` (10/21):

```html
    <div class="uroute vr-a vd-1021">
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
      <div class="uroute-curve" aria-hidden="true"></div>
    </div>
    <p class="sched-note reveal ko-block" style="margin-top:14px">10/21(수) 운영시간: 프로그램 08:00-17:15 · 집중 운행 07:00-10:00(20분 간격) · 일반 운행 08:30-17:00(1시간 간격) · 집중 운행 17:30-18:20(20분 간격)</p>
    <p class="sched-note reveal en-block" style="margin-top:14px">Oct 21 (Wed) hours: Program 08:00-17:15 · Peak 07:00-10:00 (every 20 min) · Regular 08:30-17:00 (hourly) · Peak 17:30-18:20 (every 20 min)</p>
    <div class="sched-grid reveal" style="grid-template-columns:1fr 1fr">
      <div class="sched-col">
        <h3 style="font-size:1rem;font-weight:700;margin:0 0 10px;color:var(--red)"><span class="ko-only">시그니엘 → BEXCO</span><span class="en-only">Signiel → BEXCO</span></h3>
        <div class="sched-table"><table>
          <thead><tr><th>#</th><th><span class="ko-only">시그니엘</span><span class="en-only">Signiel</span></th><th><span class="ko-only">파라다이스</span><span class="en-only">Paradise</span></th><th>BEXCO</th></tr></thead>
          <tbody>
            <tr><td colspan="4" style="text-align:left;font-weight:700;color:var(--muted);background:var(--bg,#f7f8fb)"><span class="ko-only">집중 운행</span><span class="en-only">Peak</span></td></tr>
            <tr><td>1</td><td>7:00</td><td>7:07</td><td>7:25</td></tr>
            <tr><td>2</td><td>7:20</td><td>7:27</td><td>7:45</td></tr>
            <tr><td>3</td><td>7:40</td><td>7:47</td><td>8:05</td></tr>
            <tr><td>4</td><td>8:00</td><td>8:07</td><td>8:25</td></tr>
            <tr><td>5</td><td>8:20</td><td>8:27</td><td>8:45</td></tr>
            <tr><td>6</td><td>8:40</td><td>8:47</td><td>9:05</td></tr>
            <tr><td>7</td><td>9:00</td><td>9:07</td><td>9:25</td></tr>
            <tr><td>8</td><td>9:20</td><td>9:27</td><td>9:45</td></tr>
            <tr><td>9</td><td>9:40</td><td>9:47</td><td>10:05</td></tr>
            <tr><td colspan="4" style="text-align:left;font-weight:700;color:var(--muted);background:var(--bg,#f7f8fb)"><span class="ko-only">일반 운행</span><span class="en-only">Regular</span></td></tr>
            <tr><td>10</td><td>10:00</td><td>10:07</td><td>10:25</td></tr>
            <tr><td>11</td><td>11:00</td><td>11:07</td><td>11:25</td></tr>
            <tr><td>12</td><td>12:00</td><td>12:07</td><td>12:25</td></tr>
            <tr><td>13</td><td>13:00</td><td>13:07</td><td>13:25</td></tr>
            <tr><td>14</td><td>14:00</td><td>14:07</td><td>14:25</td></tr>
            <tr><td>15</td><td>15:00</td><td>15:07</td><td>15:25</td></tr>
            <tr><td>16</td><td>16:00</td><td>16:07</td><td>16:25</td></tr>
          </tbody>
        </table></div>
      </div>
      <div class="sched-col">
        <h3 style="font-size:1rem;font-weight:700;margin:0 0 10px;color:var(--navy)"><span class="ko-only">BEXCO → 시그니엘</span><span class="en-only">BEXCO → Signiel</span></h3>
        <div class="sched-table"><table>
          <thead><tr><th>#</th><th>BEXCO</th><th><span class="ko-only">파라다이스</span><span class="en-only">Paradise</span></th><th><span class="ko-only">시그니엘</span><span class="en-only">Signiel</span></th></tr></thead>
          <tbody>
            <tr><td colspan="4" style="text-align:left;font-weight:700;color:var(--muted);background:var(--bg,#f7f8fb)"><span class="ko-only">일반 운행</span><span class="en-only">Regular</span></td></tr>
            <tr><td>1</td><td>10:30</td><td>10:48</td><td>10:53</td></tr>
            <tr><td>2</td><td>11:30</td><td>11:48</td><td>11:53</td></tr>
            <tr><td>3</td><td>12:30</td><td>12:48</td><td>12:53</td></tr>
            <tr><td>4</td><td>13:30</td><td>13:48</td><td>13:53</td></tr>
            <tr><td>5</td><td>14:30</td><td>14:48</td><td>14:53</td></tr>
            <tr><td>6</td><td>15:30</td><td>15:48</td><td>15:53</td></tr>
            <tr><td>7</td><td>16:30</td><td>16:48</td><td>16:53</td></tr>
            <tr><td colspan="4" style="text-align:left;font-weight:700;color:var(--muted);background:var(--bg,#f7f8fb)"><span class="ko-only">집중 운행</span><span class="en-only">Peak</span></td></tr>
            <tr><td>8</td><td>17:30</td><td>17:48</td><td>17:53</td></tr>
            <tr><td>9</td><td>17:50</td><td>18:08</td><td>18:13</td></tr>
            <tr><td>10</td><td>18:10</td><td>18:28</td><td>18:33</td></tr>
            <tr><td>11</td><td>18:30</td><td>18:48</td><td>18:53</td></tr>
          </tbody>
        </table></div>
      </div>
    </div>
```

- [ ] **Step 2: 같은 방식으로 10/22 블록 추가 (`vd-1022`, 리셉션 운행 포함)**

```html
    <div class="uroute vr-a vd-1022">
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
      <div class="uroute-curve" aria-hidden="true"></div>
    </div>
    <p class="sched-note reveal ko-block" style="margin-top:14px">10/22(목) 운영시간: 프로그램 08:30-18:00(1그룹 종료 16:30) · 집중 운행 07:20-08:00(10분 간격) · 일반 운행 09:00-17:00(1시간 간격) · 집중 운행 17:00-18:30, 19:40-19:50(10분 간격)</p>
    <p class="sched-note reveal en-block" style="margin-top:14px">Oct 22 (Thu) hours: Program 08:30-18:00 (Group 1 ends 16:30) · Peak 07:20-08:00 (every 10 min) · Regular 09:00-17:00 (hourly) · Peak 17:00-18:30, 19:40-19:50 (every 10 min)</p>
    <div class="sched-grid reveal" style="grid-template-columns:1fr 1fr">
      <div class="sched-col">
        <h3 style="font-size:1rem;font-weight:700;margin:0 0 10px;color:var(--red)"><span class="ko-only">시그니엘 → BEXCO</span><span class="en-only">Signiel → BEXCO</span></h3>
        <div class="sched-table"><table>
          <thead><tr><th>#</th><th><span class="ko-only">시그니엘</span><span class="en-only">Signiel</span></th><th><span class="ko-only">파라다이스</span><span class="en-only">Paradise</span></th><th>BEXCO</th></tr></thead>
          <tbody>
            <tr><td colspan="4" style="text-align:left;font-weight:700;color:var(--muted);background:var(--bg,#f7f8fb)"><span class="ko-only">집중 운행</span><span class="en-only">Peak</span></td></tr>
            <tr><td>1</td><td>7:20</td><td>7:27</td><td>7:45</td></tr>
            <tr><td>2</td><td>7:30</td><td>7:37</td><td>7:55</td></tr>
            <tr><td>3</td><td>7:40</td><td>7:47</td><td>8:05</td></tr>
            <tr><td>4</td><td>7:50</td><td>7:57</td><td>8:15</td></tr>
            <tr><td>5</td><td>8:00</td><td>8:07</td><td>8:25</td></tr>
            <tr><td colspan="4" style="text-align:left;font-weight:700;color:var(--muted);background:var(--bg,#f7f8fb)"><span class="ko-only">일반 운행</span><span class="en-only">Regular</span></td></tr>
            <tr><td>6</td><td>9:00</td><td>9:07</td><td>9:25</td></tr>
            <tr><td>7</td><td>10:00</td><td>10:07</td><td>10:25</td></tr>
            <tr><td>8</td><td>11:00</td><td>11:07</td><td>11:25</td></tr>
            <tr><td>9</td><td>12:00</td><td>12:07</td><td>12:25</td></tr>
            <tr><td>10</td><td>13:00</td><td>13:07</td><td>13:25</td></tr>
            <tr><td>11</td><td>14:00</td><td>14:07</td><td>14:25</td></tr>
            <tr><td>12</td><td>15:00</td><td>15:07</td><td>15:25</td></tr>
            <tr><td>13</td><td>16:00</td><td>16:07</td><td>16:25</td></tr>
          </tbody>
        </table></div>
      </div>
      <div class="sched-col">
        <h3 style="font-size:1rem;font-weight:700;margin:0 0 10px;color:var(--navy)"><span class="ko-only">BEXCO → 시그니엘</span><span class="en-only">BEXCO → Signiel</span></h3>
        <div class="sched-table"><table>
          <thead><tr><th>#</th><th>BEXCO</th><th><span class="ko-only">파라다이스</span><span class="en-only">Paradise</span></th><th><span class="ko-only">시그니엘</span><span class="en-only">Signiel</span></th></tr></thead>
          <tbody>
            <tr><td colspan="4" style="text-align:left;font-weight:700;color:var(--muted);background:var(--bg,#f7f8fb)"><span class="ko-only">일반 운행</span><span class="en-only">Regular</span></td></tr>
            <tr><td>1</td><td>10:30</td><td>10:48</td><td>10:53</td></tr>
            <tr><td>2</td><td>11:30</td><td>11:48</td><td>11:53</td></tr>
            <tr><td>3</td><td>12:30</td><td>12:48</td><td>12:53</td></tr>
            <tr><td>4</td><td>13:30</td><td>13:48</td><td>13:53</td></tr>
            <tr><td>5</td><td>14:30</td><td>14:48</td><td>14:53</td></tr>
            <tr><td>6</td><td>15:30</td><td>15:48</td><td>15:53</td></tr>
            <tr><td>7</td><td>16:30</td><td>16:48</td><td>16:53</td></tr>
            <tr><td colspan="4" style="text-align:left;font-weight:700;color:var(--muted);background:var(--bg,#f7f8fb)"><span class="ko-only">집중 운행</span><span class="en-only">Peak</span></td></tr>
            <tr><td>8</td><td>17:00</td><td>17:18</td><td>17:23</td></tr>
            <tr><td>9</td><td>17:30</td><td>17:48</td><td>17:53</td></tr>
            <tr><td>10</td><td>18:00</td><td>18:18</td><td>18:23</td></tr>
            <tr><td>11</td><td>18:10</td><td>18:28</td><td>18:33</td></tr>
            <tr><td>12</td><td>18:20</td><td>18:38</td><td>18:43</td></tr>
            <tr><td>13</td><td>18:30</td><td>18:48</td><td>18:53</td></tr>
            <tr><td colspan="4" style="text-align:left;font-weight:700;color:var(--muted);background:var(--bg,#f7f8fb)"><span class="ko-only">리셉션 운행</span><span class="en-only">Reception</span></td></tr>
            <tr><td>14</td><td>19:40</td><td>19:58</td><td>20:03</td></tr>
            <tr><td>15</td><td>19:50</td><td>20:08</td><td>20:13</td></tr>
          </tbody>
        </table></div>
      </div>
    </div>
```

- [ ] **Step 3: 10/23 블록 추가 (`vd-1023`, "17시 이후 시그니엘 연장" 안내 포함 — 단, 노선 A 자체가 시그니엘 도착이 이미 종점이므로 이 안내문은 노선 B에만 해당함에 유의)**

```html
    <div class="uroute vr-a vd-1023">
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
      <div class="uroute-curve" aria-hidden="true"></div>
    </div>
    <p class="sched-note reveal ko-block" style="margin-top:14px">10/23(금) 운영시간: 프로그램 08:30-16:50 · 집중 운행 07:20-08:00(10분 간격) · 일반 운행 09:00-17:00(1시간 간격) · 집중 운행 17:00-17:30(10분 간격) / 18:00 디너 만찬(시그니엘)</p>
    <p class="sched-note reveal en-block" style="margin-top:14px">Oct 23 (Fri) hours: Program 08:30-16:50 · Peak 07:20-08:00 (every 10 min) · Regular 09:00-17:00 (hourly) · Peak 17:00-17:30 (every 10 min) / 18:00 Faculty Dinner (Signiel)</p>
    <div class="sched-grid reveal" style="grid-template-columns:1fr 1fr">
      <div class="sched-col">
        <h3 style="font-size:1rem;font-weight:700;margin:0 0 10px;color:var(--red)"><span class="ko-only">시그니엘 → BEXCO</span><span class="en-only">Signiel → BEXCO</span></h3>
        <div class="sched-table"><table>
          <thead><tr><th>#</th><th><span class="ko-only">시그니엘</span><span class="en-only">Signiel</span></th><th><span class="ko-only">파라다이스</span><span class="en-only">Paradise</span></th><th>BEXCO</th></tr></thead>
          <tbody>
            <tr><td colspan="4" style="text-align:left;font-weight:700;color:var(--muted);background:var(--bg,#f7f8fb)"><span class="ko-only">집중 운행</span><span class="en-only">Peak</span></td></tr>
            <tr><td>1</td><td>7:20</td><td>7:27</td><td>7:45</td></tr>
            <tr><td>2</td><td>7:30</td><td>7:37</td><td>7:55</td></tr>
            <tr><td>3</td><td>7:40</td><td>7:47</td><td>8:05</td></tr>
            <tr><td>4</td><td>7:50</td><td>7:57</td><td>8:15</td></tr>
            <tr><td>5</td><td>8:00</td><td>8:07</td><td>8:25</td></tr>
            <tr><td colspan="4" style="text-align:left;font-weight:700;color:var(--muted);background:var(--bg,#f7f8fb)"><span class="ko-only">일반 운행</span><span class="en-only">Regular</span></td></tr>
            <tr><td>6</td><td>9:00</td><td>9:07</td><td>9:25</td></tr>
            <tr><td>7</td><td>10:00</td><td>10:07</td><td>10:25</td></tr>
            <tr><td>8</td><td>11:00</td><td>11:07</td><td>11:25</td></tr>
            <tr><td>9</td><td>12:00</td><td>12:07</td><td>12:25</td></tr>
            <tr><td>10</td><td>13:00</td><td>13:07</td><td>13:25</td></tr>
            <tr><td>11</td><td>14:00</td><td>14:07</td><td>14:25</td></tr>
            <tr><td>12</td><td>15:00</td><td>15:07</td><td>15:25</td></tr>
            <tr><td>13</td><td>16:00</td><td>16:07</td><td>16:25</td></tr>
          </tbody>
        </table></div>
      </div>
      <div class="sched-col">
        <h3 style="font-size:1rem;font-weight:700;margin:0 0 10px;color:var(--navy)"><span class="ko-only">BEXCO → 시그니엘</span><span class="en-only">BEXCO → Signiel</span></h3>
        <div class="sched-table"><table>
          <thead><tr><th>#</th><th>BEXCO</th><th><span class="ko-only">파라다이스</span><span class="en-only">Paradise</span></th><th><span class="ko-only">시그니엘</span><span class="en-only">Signiel</span></th></tr></thead>
          <tbody>
            <tr><td colspan="4" style="text-align:left;font-weight:700;color:var(--muted);background:var(--bg,#f7f8fb)"><span class="ko-only">일반 운행</span><span class="en-only">Regular</span></td></tr>
            <tr><td>1</td><td>10:30</td><td>10:48</td><td>10:53</td></tr>
            <tr><td>2</td><td>11:30</td><td>11:48</td><td>11:53</td></tr>
            <tr><td>3</td><td>12:30</td><td>12:48</td><td>12:53</td></tr>
            <tr><td>4</td><td>13:30</td><td>13:48</td><td>13:53</td></tr>
            <tr><td>5</td><td>14:30</td><td>14:48</td><td>14:53</td></tr>
            <tr><td>6</td><td>15:30</td><td>15:48</td><td>15:53</td></tr>
            <tr><td>7</td><td>16:30</td><td>16:48</td><td>16:53</td></tr>
            <tr><td colspan="4" style="text-align:left;font-weight:700;color:var(--muted);background:var(--bg,#f7f8fb)"><span class="ko-only">집중 운행</span><span class="en-only">Peak</span></td></tr>
            <tr><td>8</td><td>17:00</td><td>17:18</td><td>17:23</td></tr>
            <tr><td>9</td><td>17:10</td><td>17:28</td><td>17:33</td></tr>
            <tr><td>10</td><td>17:20</td><td>17:38</td><td>17:43</td></tr>
            <tr><td>11</td><td>17:30</td><td>17:48</td><td>17:53</td></tr>
          </tbody>
        </table></div>
      </div>
    </div>
```

- [ ] **Step 4: 10/24 블록 추가 (`vd-1024`, 폐회일 단축 운영)**

```html
    <div class="uroute vr-a vd-1024">
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
      <div class="uroute-curve" aria-hidden="true"></div>
    </div>
    <p class="sched-note reveal ko-block" style="margin-top:14px">10/24(토) 운영시간(폐회일): 프로그램 08:30-16:00(15:15 세션 종료) · 집중 운행 07:20-08:00(10분 간격) · 일반 운행 09:00-14:30(1시간 간격) · 집중 운행 15:20-16:00(10분 간격)</p>
    <p class="sched-note reveal en-block" style="margin-top:14px">Oct 24 (Sat, closing day) hours: Program 08:30-16:00 (sessions end 15:15) · Peak 07:20-08:00 (every 10 min) · Regular 09:00-14:30 (hourly) · Peak 15:20-16:00 (every 10 min)</p>
    <div class="sched-grid reveal" style="grid-template-columns:1fr 1fr">
      <div class="sched-col">
        <h3 style="font-size:1rem;font-weight:700;margin:0 0 10px;color:var(--red)"><span class="ko-only">시그니엘 → BEXCO</span><span class="en-only">Signiel → BEXCO</span></h3>
        <div class="sched-table"><table>
          <thead><tr><th>#</th><th><span class="ko-only">시그니엘</span><span class="en-only">Signiel</span></th><th><span class="ko-only">파라다이스</span><span class="en-only">Paradise</span></th><th>BEXCO</th></tr></thead>
          <tbody>
            <tr><td colspan="4" style="text-align:left;font-weight:700;color:var(--muted);background:var(--bg,#f7f8fb)"><span class="ko-only">집중 운행</span><span class="en-only">Peak</span></td></tr>
            <tr><td>1</td><td>7:20</td><td>7:27</td><td>7:45</td></tr>
            <tr><td>2</td><td>7:30</td><td>7:37</td><td>7:55</td></tr>
            <tr><td>3</td><td>7:40</td><td>7:47</td><td>8:05</td></tr>
            <tr><td>4</td><td>7:50</td><td>7:57</td><td>8:15</td></tr>
            <tr><td>5</td><td>8:00</td><td>8:07</td><td>8:25</td></tr>
            <tr><td colspan="4" style="text-align:left;font-weight:700;color:var(--muted);background:var(--bg,#f7f8fb)"><span class="ko-only">일반 운행</span><span class="en-only">Regular</span></td></tr>
            <tr><td>6</td><td>9:00</td><td>9:07</td><td>9:25</td></tr>
            <tr><td>7</td><td>10:00</td><td>10:07</td><td>10:25</td></tr>
            <tr><td>8</td><td>11:00</td><td>11:07</td><td>11:25</td></tr>
            <tr><td>9</td><td>12:00</td><td>12:07</td><td>12:25</td></tr>
            <tr><td>10</td><td>13:00</td><td>13:07</td><td>13:25</td></tr>
            <tr><td>11</td><td>14:00</td><td>14:07</td><td>14:25</td></tr>
          </tbody>
        </table></div>
      </div>
      <div class="sched-col">
        <h3 style="font-size:1rem;font-weight:700;margin:0 0 10px;color:var(--navy)"><span class="ko-only">BEXCO → 시그니엘</span><span class="en-only">BEXCO → Signiel</span></h3>
        <div class="sched-table"><table>
          <thead><tr><th>#</th><th>BEXCO</th><th><span class="ko-only">파라다이스</span><span class="en-only">Paradise</span></th><th><span class="ko-only">시그니엘</span><span class="en-only">Signiel</span></th></tr></thead>
          <tbody>
            <tr><td colspan="4" style="text-align:left;font-weight:700;color:var(--muted);background:var(--bg,#f7f8fb)"><span class="ko-only">일반 운행</span><span class="en-only">Regular</span></td></tr>
            <tr><td>1</td><td>10:30</td><td>10:48</td><td>10:53</td></tr>
            <tr><td>2</td><td>11:30</td><td>11:48</td><td>11:53</td></tr>
            <tr><td>3</td><td>12:30</td><td>12:48</td><td>12:53</td></tr>
            <tr><td>4</td><td>13:30</td><td>13:48</td><td>13:53</td></tr>
            <tr><td>5</td><td>14:30</td><td>14:48</td><td>14:53</td></tr>
            <tr><td colspan="4" style="text-align:left;font-weight:700;color:var(--muted);background:var(--bg,#f7f8fb)"><span class="ko-only">집중 운행</span><span class="en-only">Peak</span></td></tr>
            <tr><td>6</td><td>15:20</td><td>15:38</td><td>15:43</td></tr>
            <tr><td>7</td><td>15:30</td><td>15:48</td><td>15:53</td></tr>
            <tr><td>8</td><td>15:40</td><td>15:58</td><td>16:03</td></tr>
            <tr><td>9</td><td>15:50</td><td>16:08</td><td>16:13</td></tr>
            <tr><td>10</td><td>16:00</td><td>16:18</td><td>16:23</td></tr>
          </tbody>
        </table></div>
      </div>
    </div>
```

- [ ] **Step 5: 검증 — 노선 A 4개 날짜 블록이 데이터 하나만 남기고 나머지는 숨겨지는지 확인**

Run: 브라우저에서 `shuttle-venue.html` 새로고침(`Ctrl+Shift+R`) 후 A 탭이 선택된 상태로 10/21~24 날짜 탭을 하나씩 클릭.
Expected: 매번 U자형 다이어그램은 동일(시그니엘→파라다이스→BEXCO)하고, 아래 시간표 숫자만 날짜별로 바뀐다. 다른 3개 날짜의 시간표는 화면에 없어야 함(DevTools Elements에서 `display:none` 확인 가능).

---

### Task 4: 노선 B(웨스틴조선·파크하얏트) 4개 날짜 블록

**Files:**
- Modify: `aphrs-2026-transport/shuttle-venue.html` (Task 3에서 만든 노선 A 4블록 바로 뒤에 이어서 추가)

**Interfaces:**
- Consumes: Task 1의 `.uroute` 계열 클래스, `vr-b`/`vd-1021~1024`
- Produces: 노선 B 4개 블록(`.uroute.vr-b.vd-1021` 등)

- [ ] **Step 1: 10/21 블록**

```html
    <div class="uroute vr-b vd-1021">
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
      <div class="uroute-curve" aria-hidden="true"></div>
    </div>
    <p class="sched-note reveal ko-block" style="margin-top:14px">10/21(수) 운영시간: 프로그램 08:00-17:15 · 집중 운행 07:00-10:00(20분 간격) · 일반 운행 08:30-17:00(1시간 간격) · 집중 운행 17:30-18:20(20분 간격)</p>
    <p class="sched-note reveal en-block" style="margin-top:14px">Oct 21 (Wed) hours: Program 08:00-17:15 · Peak 07:00-10:00 (every 20 min) · Regular 08:30-17:00 (hourly) · Peak 17:30-18:20 (every 20 min)</p>
    <div class="sched-grid reveal" style="grid-template-columns:1fr 1fr">
      <div class="sched-col">
        <h3 style="font-size:1rem;font-weight:700;margin:0 0 10px;color:var(--red)"><span class="ko-only">웨스틴조선 → BEXCO</span><span class="en-only">Westin Josun → BEXCO</span></h3>
        <div class="sched-table"><table>
          <thead><tr><th>#</th><th><span class="ko-only">웨스틴조선</span><span class="en-only">Westin Josun</span></th><th><span class="ko-only">파크하얏트</span><span class="en-only">Park Hyatt</span></th><th>BEXCO</th></tr></thead>
          <tbody>
            <tr><td colspan="4" style="text-align:left;font-weight:700;color:var(--muted);background:var(--bg,#f7f8fb)"><span class="ko-only">집중 운행</span><span class="en-only">Peak</span></td></tr>
            <tr><td>1</td><td>7:00</td><td>7:10</td><td>7:20</td></tr>
            <tr><td>2</td><td>7:20</td><td>7:30</td><td>7:40</td></tr>
            <tr><td>3</td><td>7:40</td><td>7:50</td><td>8:00</td></tr>
            <tr><td>4</td><td>8:00</td><td>8:10</td><td>8:20</td></tr>
            <tr><td>5</td><td>8:20</td><td>8:30</td><td>8:40</td></tr>
            <tr><td>6</td><td>8:40</td><td>8:50</td><td>9:00</td></tr>
            <tr><td>7</td><td>9:00</td><td>9:10</td><td>9:20</td></tr>
            <tr><td>8</td><td>9:20</td><td>9:30</td><td>9:40</td></tr>
            <tr><td>9</td><td>9:40</td><td>9:50</td><td>10:00</td></tr>
            <tr><td colspan="4" style="text-align:left;font-weight:700;color:var(--muted);background:var(--bg,#f7f8fb)"><span class="ko-only">일반 운행</span><span class="en-only">Regular</span></td></tr>
            <tr><td>10</td><td>10:00</td><td>10:10</td><td>10:20</td></tr>
            <tr><td>11</td><td>11:00</td><td>11:10</td><td>11:20</td></tr>
            <tr><td>12</td><td>12:00</td><td>12:10</td><td>12:20</td></tr>
            <tr><td>13</td><td>13:00</td><td>13:10</td><td>13:20</td></tr>
            <tr><td>14</td><td>14:00</td><td>14:10</td><td>14:20</td></tr>
            <tr><td>15</td><td>15:00</td><td>15:10</td><td>15:20</td></tr>
            <tr><td>16</td><td>16:00</td><td>16:10</td><td>16:20</td></tr>
          </tbody>
        </table></div>
      </div>
      <div class="sched-col">
        <h3 style="font-size:1rem;font-weight:700;margin:0 0 10px;color:var(--navy)"><span class="ko-only">BEXCO → 웨스틴조선</span><span class="en-only">BEXCO → Westin Josun</span></h3>
        <div class="sched-table"><table>
          <thead><tr><th>#</th><th>BEXCO</th><th><span class="ko-only">파크하얏트</span><span class="en-only">Park Hyatt</span></th><th><span class="ko-only">웨스틴조선</span><span class="en-only">Westin Josun</span></th></tr></thead>
          <tbody>
            <tr><td colspan="4" style="text-align:left;font-weight:700;color:var(--muted);background:var(--bg,#f7f8fb)"><span class="ko-only">일반 운행</span><span class="en-only">Regular</span></td></tr>
            <tr><td>1</td><td>10:30</td><td>10:42</td><td>10:50</td></tr>
            <tr><td>2</td><td>11:30</td><td>11:42</td><td>11:50</td></tr>
            <tr><td>3</td><td>12:30</td><td>12:42</td><td>12:50</td></tr>
            <tr><td>4</td><td>13:30</td><td>13:42</td><td>13:50</td></tr>
            <tr><td>5</td><td>14:30</td><td>14:42</td><td>14:50</td></tr>
            <tr><td>6</td><td>15:30</td><td>15:42</td><td>15:50</td></tr>
            <tr><td>7</td><td>16:30</td><td>16:42</td><td>16:50</td></tr>
            <tr><td colspan="4" style="text-align:left;font-weight:700;color:var(--muted);background:var(--bg,#f7f8fb)"><span class="ko-only">집중 운행</span><span class="en-only">Peak</span></td></tr>
            <tr><td>8</td><td>17:30</td><td>17:42</td><td>17:50</td></tr>
            <tr><td>9</td><td>17:50</td><td>18:02</td><td>18:10</td></tr>
            <tr><td>10</td><td>18:10</td><td>18:22</td><td>18:30</td></tr>
            <tr><td>11</td><td>18:30</td><td>18:42</td><td>18:50</td></tr>
          </tbody>
        </table></div>
      </div>
    </div>
```

- [ ] **Step 2: 10/22 블록 (리셉션 운행 포함)**

```html
    <div class="uroute vr-b vd-1022">
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
      <div class="uroute-curve" aria-hidden="true"></div>
    </div>
    <p class="sched-note reveal ko-block" style="margin-top:14px">10/22(목) 운영시간: 프로그램 08:30-18:00(1그룹 종료 16:30) · 집중 운행 07:20-08:00(10분 간격) · 일반 운행 09:00-17:00(1시간 간격) · 집중 운행 17:00-18:30, 19:40-19:50(10분 간격)</p>
    <p class="sched-note reveal en-block" style="margin-top:14px">Oct 22 (Thu) hours: Program 08:30-18:00 (Group 1 ends 16:30) · Peak 07:20-08:00 (every 10 min) · Regular 09:00-17:00 (hourly) · Peak 17:00-18:30, 19:40-19:50 (every 10 min)</p>
    <div class="sched-grid reveal" style="grid-template-columns:1fr 1fr">
      <div class="sched-col">
        <h3 style="font-size:1rem;font-weight:700;margin:0 0 10px;color:var(--red)"><span class="ko-only">웨스틴조선 → BEXCO</span><span class="en-only">Westin Josun → BEXCO</span></h3>
        <div class="sched-table"><table>
          <thead><tr><th>#</th><th><span class="ko-only">웨스틴조선</span><span class="en-only">Westin Josun</span></th><th><span class="ko-only">파크하얏트</span><span class="en-only">Park Hyatt</span></th><th>BEXCO</th></tr></thead>
          <tbody>
            <tr><td colspan="4" style="text-align:left;font-weight:700;color:var(--muted);background:var(--bg,#f7f8fb)"><span class="ko-only">집중 운행</span><span class="en-only">Peak</span></td></tr>
            <tr><td>1</td><td>7:20</td><td>7:30</td><td>7:40</td></tr>
            <tr><td>2</td><td>7:30</td><td>7:40</td><td>7:50</td></tr>
            <tr><td>3</td><td>7:40</td><td>7:50</td><td>8:00</td></tr>
            <tr><td>4</td><td>7:50</td><td>8:00</td><td>8:10</td></tr>
            <tr><td>5</td><td>8:00</td><td>8:10</td><td>8:20</td></tr>
            <tr><td colspan="4" style="text-align:left;font-weight:700;color:var(--muted);background:var(--bg,#f7f8fb)"><span class="ko-only">일반 운행</span><span class="en-only">Regular</span></td></tr>
            <tr><td>6</td><td>9:00</td><td>9:10</td><td>9:20</td></tr>
            <tr><td>7</td><td>10:00</td><td>10:10</td><td>10:20</td></tr>
            <tr><td>8</td><td>11:00</td><td>11:10</td><td>11:20</td></tr>
            <tr><td>9</td><td>12:00</td><td>12:10</td><td>12:20</td></tr>
            <tr><td>10</td><td>13:00</td><td>13:10</td><td>13:20</td></tr>
            <tr><td>11</td><td>14:00</td><td>14:10</td><td>14:20</td></tr>
            <tr><td>12</td><td>15:00</td><td>15:10</td><td>15:20</td></tr>
            <tr><td>13</td><td>16:00</td><td>16:10</td><td>16:20</td></tr>
          </tbody>
        </table></div>
      </div>
      <div class="sched-col">
        <h3 style="font-size:1rem;font-weight:700;margin:0 0 10px;color:var(--navy)"><span class="ko-only">BEXCO → 웨스틴조선</span><span class="en-only">BEXCO → Westin Josun</span></h3>
        <div class="sched-table"><table>
          <thead><tr><th>#</th><th>BEXCO</th><th><span class="ko-only">파크하얏트</span><span class="en-only">Park Hyatt</span></th><th><span class="ko-only">웨스틴조선</span><span class="en-only">Westin Josun</span></th></tr></thead>
          <tbody>
            <tr><td colspan="4" style="text-align:left;font-weight:700;color:var(--muted);background:var(--bg,#f7f8fb)"><span class="ko-only">일반 운행</span><span class="en-only">Regular</span></td></tr>
            <tr><td>1</td><td>10:30</td><td>10:42</td><td>10:50</td></tr>
            <tr><td>2</td><td>11:30</td><td>11:42</td><td>11:50</td></tr>
            <tr><td>3</td><td>12:30</td><td>12:42</td><td>12:50</td></tr>
            <tr><td>4</td><td>13:30</td><td>13:42</td><td>13:50</td></tr>
            <tr><td>5</td><td>14:30</td><td>14:42</td><td>14:50</td></tr>
            <tr><td>6</td><td>15:30</td><td>15:42</td><td>15:50</td></tr>
            <tr><td>7</td><td>16:30</td><td>16:42</td><td>16:50</td></tr>
            <tr><td colspan="4" style="text-align:left;font-weight:700;color:var(--muted);background:var(--bg,#f7f8fb)"><span class="ko-only">집중 운행</span><span class="en-only">Peak</span></td></tr>
            <tr><td>8</td><td>17:00</td><td>17:12</td><td>17:20</td></tr>
            <tr><td>9</td><td>17:30</td><td>17:42</td><td>17:50</td></tr>
            <tr><td>10</td><td>18:00</td><td>18:12</td><td>18:20</td></tr>
            <tr><td>11</td><td>18:10</td><td>18:22</td><td>18:30</td></tr>
            <tr><td>12</td><td>18:20</td><td>18:32</td><td>18:40</td></tr>
            <tr><td>13</td><td>18:30</td><td>18:42</td><td>18:50</td></tr>
            <tr><td colspan="4" style="text-align:left;font-weight:700;color:var(--muted);background:var(--bg,#f7f8fb)"><span class="ko-only">리셉션 운행</span><span class="en-only">Reception</span></td></tr>
            <tr><td>14</td><td>19:40</td><td>19:52</td><td>20:00</td></tr>
            <tr><td>15</td><td>19:50</td><td>20:02</td><td>20:10</td></tr>
          </tbody>
        </table></div>
      </div>
    </div>
```

- [ ] **Step 3: 10/23 블록 (17시 이후 시그니엘까지 연장 — 노선 B는 실제로 이 안내가 해당됨)**

```html
    <div class="uroute vr-b vd-1023">
      <div class="uroute-arm uroute-out">
        <span class="ar-lbl ko-only">가는 편</span><span class="ar-lbl en-only">Outbound</span>
        <span class="uroute-path ko-only">웨스틴조선 <span class="ar">→</span> 파크하얏트 <span class="ar">→</span> BEXCO</span>
        <span class="uroute-path en-only">Westin Josun <span class="ar">→</span> Park Hyatt <span class="ar">→</span> BEXCO</span>
      </div>
      <div class="uroute-arm uroute-back">
        <span class="ar-lbl ko-only">오는 편 (17시 이후 시그니엘까지 연장)</span><span class="ar-lbl en-only">Return (extends to Signiel after 17:00)</span>
        <span class="uroute-path ko-only">BEXCO <span class="ar">→</span> 파크하얏트 <span class="ar">→</span> 웨스틴조선</span>
        <span class="uroute-path en-only">BEXCO <span class="ar">→</span> Park Hyatt <span class="ar">→</span> Westin Josun</span>
      </div>
      <div class="uroute-curve" aria-hidden="true"></div>
    </div>
    <p class="sched-note reveal ko-block" style="margin-top:14px">10/23(금) 운영시간: 프로그램 08:30-16:50 · 집중 운행 07:20-08:00(10분 간격) · 일반 운행 09:00-17:00(1시간 간격) · 집중 운행 17:00-17:30(10분 간격) / 18:00 디너 만찬(시그니엘) — 17시 이후 오는 편은 시그니엘(만찬장)까지 연장 운행합니다.</p>
    <p class="sched-note reveal en-block" style="margin-top:14px">Oct 23 (Fri) hours: Program 08:30-16:50 · Peak 07:20-08:00 (every 10 min) · Regular 09:00-17:00 (hourly) · Peak 17:00-17:30 (every 10 min) / 18:00 Faculty Dinner (Signiel) — after 17:00, return trips extend to Signiel (dinner venue).</p>
    <div class="sched-grid reveal" style="grid-template-columns:1fr 1fr">
      <div class="sched-col">
        <h3 style="font-size:1rem;font-weight:700;margin:0 0 10px;color:var(--red)"><span class="ko-only">웨스틴조선 → BEXCO</span><span class="en-only">Westin Josun → BEXCO</span></h3>
        <div class="sched-table"><table>
          <thead><tr><th>#</th><th><span class="ko-only">웨스틴조선</span><span class="en-only">Westin Josun</span></th><th><span class="ko-only">파크하얏트</span><span class="en-only">Park Hyatt</span></th><th>BEXCO</th></tr></thead>
          <tbody>
            <tr><td colspan="4" style="text-align:left;font-weight:700;color:var(--muted);background:var(--bg,#f7f8fb)"><span class="ko-only">집중 운행</span><span class="en-only">Peak</span></td></tr>
            <tr><td>1</td><td>7:20</td><td>7:30</td><td>7:40</td></tr>
            <tr><td>2</td><td>7:30</td><td>7:40</td><td>7:50</td></tr>
            <tr><td>3</td><td>7:40</td><td>7:50</td><td>8:00</td></tr>
            <tr><td>4</td><td>7:50</td><td>8:00</td><td>8:10</td></tr>
            <tr><td>5</td><td>8:00</td><td>8:10</td><td>8:20</td></tr>
            <tr><td colspan="4" style="text-align:left;font-weight:700;color:var(--muted);background:var(--bg,#f7f8fb)"><span class="ko-only">일반 운행</span><span class="en-only">Regular</span></td></tr>
            <tr><td>6</td><td>9:00</td><td>9:10</td><td>9:20</td></tr>
            <tr><td>7</td><td>10:00</td><td>10:10</td><td>10:20</td></tr>
            <tr><td>8</td><td>11:00</td><td>11:10</td><td>11:20</td></tr>
            <tr><td>9</td><td>12:00</td><td>12:10</td><td>12:20</td></tr>
            <tr><td>10</td><td>13:00</td><td>13:10</td><td>13:20</td></tr>
            <tr><td>11</td><td>14:00</td><td>14:10</td><td>14:20</td></tr>
            <tr><td>12</td><td>15:00</td><td>15:10</td><td>15:20</td></tr>
            <tr><td>13</td><td>16:00</td><td>16:10</td><td>16:20</td></tr>
          </tbody>
        </table></div>
      </div>
      <div class="sched-col">
        <h3 style="font-size:1rem;font-weight:700;margin:0 0 10px;color:var(--navy)"><span class="ko-only">BEXCO → 웨스틴조선</span><span class="en-only">BEXCO → Westin Josun</span></h3>
        <div class="sched-table"><table>
          <thead><tr><th>#</th><th>BEXCO</th><th><span class="ko-only">파크하얏트</span><span class="en-only">Park Hyatt</span></th><th><span class="ko-only">웨스틴조선</span><span class="en-only">Westin Josun</span></th><th><span class="ko-only">시그니엘(연장)</span><span class="en-only">Signiel (ext.)</span></th></tr></thead>
          <tbody>
            <tr><td colspan="5" style="text-align:left;font-weight:700;color:var(--muted);background:var(--bg,#f7f8fb)"><span class="ko-only">일반 운행</span><span class="en-only">Regular</span></td></tr>
            <tr><td>1</td><td>10:30</td><td>10:42</td><td>10:50</td><td>—</td></tr>
            <tr><td>2</td><td>11:30</td><td>11:42</td><td>11:50</td><td>—</td></tr>
            <tr><td>3</td><td>12:30</td><td>12:42</td><td>12:50</td><td>—</td></tr>
            <tr><td>4</td><td>13:30</td><td>13:42</td><td>13:50</td><td>—</td></tr>
            <tr><td>5</td><td>14:30</td><td>14:42</td><td>14:50</td><td>—</td></tr>
            <tr><td>6</td><td>15:30</td><td>15:42</td><td>15:50</td><td>—</td></tr>
            <tr><td>7</td><td>16:30</td><td>16:42</td><td>16:50</td><td>—</td></tr>
            <tr><td colspan="5" style="text-align:left;font-weight:700;color:var(--muted);background:var(--bg,#f7f8fb)"><span class="ko-only">집중 운행 (시그니엘 연장)</span><span class="en-only">Peak (extends to Signiel)</span></td></tr>
            <tr><td>8</td><td>17:00</td><td>17:12</td><td>17:20</td><td>17:30</td></tr>
            <tr><td>9</td><td>17:10</td><td>17:22</td><td>17:30</td><td>17:40</td></tr>
            <tr><td>10</td><td>17:20</td><td>17:32</td><td>17:40</td><td>17:50</td></tr>
            <tr><td>11</td><td>17:30</td><td>17:42</td><td>17:50</td><td>18:00</td></tr>
          </tbody>
        </table></div>
      </div>
    </div>
```

- [ ] **Step 4: 10/24 블록 (폐회일 단축 운영)**

```html
    <div class="uroute vr-b vd-1024">
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
      <div class="uroute-curve" aria-hidden="true"></div>
    </div>
    <p class="sched-note reveal ko-block" style="margin-top:14px">10/24(토) 운영시간(폐회일): 프로그램 08:30-16:00(15:15 세션 종료) · 집중 운행 07:20-08:00(10분 간격) · 일반 운행 09:00-14:30(1시간 간격) · 집중 운행 15:20-16:00(10분 간격)</p>
    <p class="sched-note reveal en-block" style="margin-top:14px">Oct 24 (Sat, closing day) hours: Program 08:30-16:00 (sessions end 15:15) · Peak 07:20-08:00 (every 10 min) · Regular 09:00-14:30 (hourly) · Peak 15:20-16:00 (every 10 min)</p>
    <div class="sched-grid reveal" style="grid-template-columns:1fr 1fr">
      <div class="sched-col">
        <h3 style="font-size:1rem;font-weight:700;margin:0 0 10px;color:var(--red)"><span class="ko-only">웨스틴조선 → BEXCO</span><span class="en-only">Westin Josun → BEXCO</span></h3>
        <div class="sched-table"><table>
          <thead><tr><th>#</th><th><span class="ko-only">웨스틴조선</span><span class="en-only">Westin Josun</span></th><th><span class="ko-only">파크하얏트</span><span class="en-only">Park Hyatt</span></th><th>BEXCO</th></tr></thead>
          <tbody>
            <tr><td colspan="4" style="text-align:left;font-weight:700;color:var(--muted);background:var(--bg,#f7f8fb)"><span class="ko-only">집중 운행</span><span class="en-only">Peak</span></td></tr>
            <tr><td>1</td><td>7:20</td><td>7:30</td><td>7:40</td></tr>
            <tr><td>2</td><td>7:30</td><td>7:40</td><td>7:50</td></tr>
            <tr><td>3</td><td>7:40</td><td>7:50</td><td>8:00</td></tr>
            <tr><td>4</td><td>7:50</td><td>8:00</td><td>8:10</td></tr>
            <tr><td>5</td><td>8:00</td><td>8:10</td><td>8:20</td></tr>
            <tr><td colspan="4" style="text-align:left;font-weight:700;color:var(--muted);background:var(--bg,#f7f8fb)"><span class="ko-only">일반 운행</span><span class="en-only">Regular</span></td></tr>
            <tr><td>6</td><td>9:00</td><td>9:10</td><td>9:20</td></tr>
            <tr><td>7</td><td>10:00</td><td>10:10</td><td>10:20</td></tr>
            <tr><td>8</td><td>11:00</td><td>11:10</td><td>11:20</td></tr>
            <tr><td>9</td><td>12:00</td><td>12:10</td><td>12:20</td></tr>
            <tr><td>10</td><td>13:00</td><td>13:10</td><td>13:20</td></tr>
            <tr><td>11</td><td>14:00</td><td>14:10</td><td>14:20</td></tr>
          </tbody>
        </table></div>
      </div>
      <div class="sched-col">
        <h3 style="font-size:1rem;font-weight:700;margin:0 0 10px;color:var(--navy)"><span class="ko-only">BEXCO → 웨스틴조선</span><span class="en-only">BEXCO → Westin Josun</span></h3>
        <div class="sched-table"><table>
          <thead><tr><th>#</th><th>BEXCO</th><th><span class="ko-only">파크하얏트</span><span class="en-only">Park Hyatt</span></th><th><span class="ko-only">웨스틴조선</span><span class="en-only">Westin Josun</span></th></tr></thead>
          <tbody>
            <tr><td colspan="4" style="text-align:left;font-weight:700;color:var(--muted);background:var(--bg,#f7f8fb)"><span class="ko-only">일반 운행</span><span class="en-only">Regular</span></td></tr>
            <tr><td>1</td><td>10:30</td><td>10:42</td><td>10:50</td></tr>
            <tr><td>2</td><td>11:30</td><td>11:42</td><td>11:50</td></tr>
            <tr><td>3</td><td>12:30</td><td>12:42</td><td>12:50</td></tr>
            <tr><td>4</td><td>13:30</td><td>13:42</td><td>13:50</td></tr>
            <tr><td>5</td><td>14:30</td><td>14:42</td><td>14:50</td></tr>
            <tr><td colspan="4" style="text-align:left;font-weight:700;color:var(--muted);background:var(--bg,#f7f8fb)"><span class="ko-only">집중 운행</span><span class="en-only">Peak</span></td></tr>
            <tr><td>6</td><td>15:20</td><td>15:32</td><td>15:40</td></tr>
            <tr><td>7</td><td>15:30</td><td>15:42</td><td>15:50</td></tr>
            <tr><td>8</td><td>15:40</td><td>15:52</td><td>16:00</td></tr>
            <tr><td>9</td><td>15:50</td><td>16:02</td><td>16:10</td></tr>
            <tr><td>10</td><td>16:00</td><td>16:12</td><td>16:20</td></tr>
          </tbody>
        </table></div>
      </div>
    </div>
```

- [ ] **Step 5: 검증 — 노선 B 4블록도 노선 A와 동일하게 날짜별 전환되는지 확인, 그리고 A↔B 노선 탭 전환도 함께 확인**

Run: 브라우저에서 B 탭 클릭 후 10/21~24 날짜 탭 순회. 그다음 A 탭으로 돌아가 날짜가 유지되는지(예: 10/23을 보다가 A→B 전환해도 10/23 유지) 확인.
Expected: 노선 전환 시 날짜 선택 상태는 유지된 채 노선 데이터만 바뀐다(두 상태 축이 서로 독립적).

---

### Task 5: Faculty Dinner 셔틀 블록 (10/23 전용, 노선 무관 공통 노출) + 그랜드조선 안내 재배치

**Files:**
- Modify: `aphrs-2026-transport/shuttle-venue.html`
  - Task 4 마지막 블록 바로 뒤에 Faculty Dinner 블록 추가
  - 기존 "FACULTY DINNER SHUTTLE" 독립 섹션(현재 309~344번째 줄) **전체 삭제**
  - 그랜드조선 해운대 안내 `warn-box`를 8블록+FD블록 전부 다음, `</section>` 직전으로 재배치

**Interfaces:**
- Consumes: `vd-1023` 클래스(노선 클래스 없음 — 노선 선택과 무관하게 노출)

- [ ] **Step 1: Faculty Dinner 블록 추가 (Task 4 Step 4 다음)**

```html
    <div class="warn-box reveal vd-1023" style="margin-top:24px">
      <div class="wb-icon"><svg class="ico ico-lg" viewBox="0 0 24 24" aria-hidden="true"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg></div>
      <div class="wb-body">
        <h4 class="ko-block">Faculty Dinner 셔틀 <span style="font-weight:700;opacity:.75">— 10/23(금) 저녁, 노선 선택과 무관하게 운영</span></h4>
        <h4 class="en-block">Faculty Dinner Shuttle <span style="font-weight:700;opacity:.75">— Oct 23 (Fri) evening, runs independently of route selection</span></h4>
        <p class="ko-block"><b>Faculty Dinner 초청자 전용</b>이며 일반 등록 참가자는 이용하실 수 없습니다. 만찬장행 <b>17:00~17:30(10분 간격)</b>은 위 베뉴 셔틀을 그대로 이용해 시그니엘로 이동합니다. 귀가행은 만찬 종료 후 <b>20:00부터 2분 간격으로 10대가 순차 출발</b>하며, 벡스코 인근 호텔 투숙객은 벡스코까지 연장 운행합니다.</p>
        <p class="en-block">For <b>invited Faculty Dinner guests only</b> — not available to general registered attendees. To the dinner (<b>17:00–17:30, every 10 min</b>), use the venue shuttle above to Signiel. After the dinner, <b>10 buses depart every 2 minutes from 20:00</b>; guests staying near BEXCO can ride to BEXCO on the extended run.</p>
      </div>
    </div>
    <div class="sched-grid reveal vd-1023" style="grid-template-columns:1fr;margin-top:14px">
      <div class="sched-col">
        <h3 style="font-size:1rem;font-weight:700;margin:0 0 10px;color:var(--red)"><span class="ko-only">귀가행 — 시그니엘 → 웨스틴조선 → 파크하얏트 → (BEXCO)</span><span class="en-only">Return — Signiel → Westin Josun → Park Hyatt → (BEXCO)</span></h3>
        <div class="sched-table"><table>
          <thead><tr><th><span class="ko-only">호차</span><span class="en-only">Bus #</span></th><th><span class="ko-only">시그니엘</span><span class="en-only">Signiel</span></th><th><span class="ko-only">웨스틴조선</span><span class="en-only">Westin Josun</span></th><th><span class="ko-only">파크하얏트</span><span class="en-only">Park Hyatt</span></th><th><span class="ko-only">BEXCO(연장)</span><span class="en-only">BEXCO (ext.)</span></th></tr></thead>
          <tbody>
            <tr><td>1</td><td>20:00</td><td>20:12</td><td>20:22</td><td>(20:32)</td></tr>
            <tr><td>2</td><td>20:02</td><td>20:14</td><td>20:24</td><td>(20:34)</td></tr>
            <tr><td>3</td><td>20:04</td><td>20:16</td><td>20:26</td><td>(20:36)</td></tr>
            <tr><td>4</td><td>20:06</td><td>20:18</td><td>20:28</td><td>(20:38)</td></tr>
            <tr><td>5</td><td>20:08</td><td>20:20</td><td>20:30</td><td>(20:40)</td></tr>
            <tr><td>6</td><td>20:10</td><td>20:22</td><td>20:32</td><td>(20:42)</td></tr>
            <tr><td>7</td><td>20:12</td><td>20:24</td><td>20:34</td><td>(20:44)</td></tr>
            <tr><td>8</td><td>20:14</td><td>20:26</td><td>20:36</td><td>(20:46)</td></tr>
            <tr><td>9</td><td>20:16</td><td>20:28</td><td>20:38</td><td>(20:48)</td></tr>
            <tr><td>10</td><td>20:18</td><td>20:30</td><td>20:40</td><td>(20:50)</td></tr>
          </tbody>
        </table></div>
      </div>
    </div>
```

- [ ] **Step 2: 그랜드조선 해운대 안내(`warn-box`, 파라다이스 정류장 이용 안내)를 Faculty Dinner 블록 바로 다음, `</div></section>` 직전에 추가 — 노선·날짜 무관 상시 노출(클래스 없음)**

```html
    <div class="warn-box reveal" style="margin-top:24px">
      <div class="wb-icon"><svg class="ico ico-lg" viewBox="0 0 24 24" aria-hidden="true"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg></div>
      <div class="wb-body">
        <h4 class="ko-block">그랜드조선 해운대 투숙객 안내</h4>
        <h4 class="en-block">For guests at Grand Josun Haeundae</h4>
        <p class="ko-block">그랜드조선 해운대 투숙객께서는 행사장 셔틀 이용 시 <b>파라다이스 호텔 정거장</b>을 이용해 주세요. 그랜드조선 ↔ 파라다이스 호텔은 <b>도보 약 5분</b> 거리입니다.</p>
        <p class="en-block">Guests at Grand Josun Haeundae: please board the event shuttle at the <b>Paradise Hotel</b> stop (~5 min walk from Grand Josun).</p>
      </div>
    </div>
```

- [ ] **Step 3: 기존 "FACULTY DINNER SHUTTLE" 독립 섹션 전체 삭제**

`<!-- ===== FACULTY DINNER SHUTTLE (10/23 only) ===== -->`부터 그 섹션의 `</section>`까지(현재 파일 기준 309~344번째 줄) 전부 삭제한다. 삭제 전 정확한 줄 번호는 Task 1~4 편집 후 달라지므로, 편집 시점에 `그 <!-- ===== FACULTY DINNER SHUTTLE` 주석부터 다음에 오는 첫 `</section>`까지`를 통째로 지운다.

- [ ] **Step 4: "SCHEDULE" 섹션 헤딩(`#sc-h`, "운행 시간표 (10/21~24)")도 이제 무의미하므로 정리 — 이 섹션 전체를 삭제한다 (내용은 이미 Task 3·4에서 ROUTES 섹션 안으로 흡수됨)**

`<!-- ===== SCHEDULE ===== -->`부터 그 섹션의 `</section>`까지 통째로 삭제(원본 193~307번째 줄 범위, Task 1~4 편집으로 줄 번호는 이동해 있을 것).

- [ ] **Step 5: 검증 — 전체 페이지 구조 확인**

Run: `python -m http.server 8241`(aphrs-2026-transport 폴더 안) → `http://localhost:8241/shuttle-venue.html` 새로고침.
Expected:
1. "운행 노선" 섹션 하나만 남고(구 "운행 시간표"/"Faculty Dinner 셔틀" 별도 섹션 없음) 그 안에 탭 UI + U자형 다이어그램 + 시간표 + (10/23일 때만) Faculty Dinner + 그랜드조선 안내가 순서대로 보인다.
2. A/B 노선 아무거나 선택한 채 10/23 날짜를 클릭하면 Faculty Dinner 블록이 나타나고, 10/21·22·24로 바꾸면 사라진다.
3. 브라우저 콘솔에 JS 에러 없음.

---

### Task 6: 버전 범프 + 반응형(모바일) 검증 + 커밋

**Files:**
- Modify: 아래 7개 파일의 `?v=`, `<meta name="version">`, `SITE_VERSION` 전부
  - `aphrs-2026-transport/airport-transfer.html`
  - `aphrs-2026-transport/assets/app.js`
  - `aphrs-2026-transport/booking.html`
  - `aphrs-2026-transport/index.html`
  - `aphrs-2026-transport/shuttle-chauffeur.html`
  - `aphrs-2026-transport/shuttle-venue.html`
  - `aphrs-2026-transport/travel.html`

- [ ] **Step 1: 버전 문자열 일괄 치환**

Run (aphrs-2026-transport 폴더 안에서):
```bash
for f in ./airport-transfer.html ./assets/app.js ./booking.html ./index.html ./shuttle-chauffeur.html ./shuttle-venue.html ./travel.html; do
  sed -i 's/2026\.07\.13\.3/2026.07.13.4/g' "$f"
done
grep -c "2026.07.13.4" assets/app.js
```
Expected: `1` 출력(SITE_VERSION 라인에서 매치).

- [ ] **Step 2: 데스크톱(1280px) 렌더 검증**

Run: 브라우저 뷰포트 1280×900으로 `shuttle-venue.html` 열어 A/B 노선 × 10/21~24 날짜 8개 조합 전부 스크린샷.
Expected: 모든 조합에서 U자형 다이어그램의 `.uroute-curve`가 위/아래 두 줄 오른쪽을 자연스럽게 잇고, 시간표 숫자가 표에 정리한 값과 정확히 일치. 가로 스크롤 없음.

- [ ] **Step 3: 모바일(390px) 렌더 검증**

Run: 뷰포트 390×844로 전환 후 동일하게 확인.
Expected: `.uroute` 패딩이 좁아지고(`@media(max-width:620px)` 규칙) 텍스트가 줄바꿈되더라도 `.uroute-curve`가 카드 밖으로 넘치지 않음. 탭 버튼(노선 2개+날짜 4개)이 가로로 눌리지 않고 읽을 수 있는 크기 유지.

- [ ] **Step 4: 커밋**

```bash
git add aphrs-2026-transport/ docs/superpowers/
git commit -m "$(cat <<'EOF'
feat: 행사장 셔틀 페이지 노선×날짜 탭 + U자형 노선도로 재구성 v2026.07.13.4

가짜 placeholder 시간표를 공식 PPTX 기반 실제 운행시간표(날짜별 집중/일반/리셉션 운행)로 전량 교체.
왕복 노선을 U자형 다이어그램(위=가는편·아래=오는편, 오른쪽 border-radius 곡선 연결)으로 표현하고
노선(A/B)×날짜(10/21~24) 탭으로 8개 조합을 전환. Faculty Dinner 셔틀은 10/23 탭 안에 노선 무관
공통 노출로 통합, TBD였던 출발시각을 확정 시각으로 교체. 노선 A 정류장 순서(시그니엘→파라다이스)를
공식 자료 기준으로 정정.

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
EOF
)"
```

---

## Self-Review 체크리스트 (실행 전 참고용)

- **스펙 커버리지**: §3 상태관리(Task 2) · §4 U자형 마크업(Task 1,3,4) · §5 실제 데이터(Task 3,4,5) · §6 삭제/재배치 대상(Task 5) · §8 검증 기준(Task 6) 전부 태스크로 매핑됨.
- **정류장 순서 정정**: Global Constraints에 명시, Task 3의 모든 블록이 "시그니엘 → 파라다이스 → BEXCO" 순으로 작성됨(현재 라이브 사이트의 "파라다이스 → 시그니엘"과 다름에 주의).
- **타입/이름 일관성**: `data-vr`(a/b) · `data-vd`(1021/1022/1023/1024) · 클래스명 `vr-a`/`vr-b`/`vd-1021~1024`가 Task 1(CSS 정의)부터 Task 5(마지막 사용)까지 동일하게 사용됨.
