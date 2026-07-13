# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 프로젝트 성격

GroundK **RIDEUS Events × APHRS 2026 Busan** 참가자 교통 포털 — TPaaS **v2** 콘셉트 데모. 빌드 시스템 없는 순수 정적 사이트(HTML + 공유 CSS/JS). 예약 흐름은 시연용 목업이며 실제 예약 시스템과 연동되지 않는다.

상위 리포(`aphrs-2026-busan/`)의 v1(`hub.css` + `book-widget.js` 기반)과 **별개의 독립 프로젝트**다. 이 리포는 `transport.css` 하나로 자기완결하며 floating FAB이 없다.

## 실행 / 미리보기

- **빌드·테스트·린트 명령 없음.** 파일을 직접 열거나 정적 서버로 띄운다.
  - `file://` 직접 열기: 상대 경로라 대부분 동작
  - 권장: 리포 루트에서 `python -m http.server 8000` → `http://localhost:8000/`
- **배포**: `main` push → GitHub Pages 자동 서빙 (빌드 단계 없음)
- ⚠️ `git push`·PR은 사용자가 명시적으로 요청할 때만 수행한다.

## 버전 관리

버전 형식: `YYYY.MM.DD.N` (날짜 + 당일 패치 번호). 다음 4곳을 **동시에** 올려야 캐시 버스팅이 유지된다:

1. `<meta name="version">` — 모든 HTML
2. `<link href="assets/transport.css?v=...">` — 모든 HTML
3. `<script src="assets/app.js?v=...">` — 모든 HTML
4. `SITE_VERSION` 상수 — `assets/app.js` line 9

버전 일괄 변경은 `bump-version.sh` 사용: `bash bump-version.sh 2026.07.05.1`

## 사이트 구조

```
index.html                   # 포털 홈 (서비스 랜딩)
shuttle-airport-hotel.html   # 공항 → 호텔 셔틀 (유료)
shuttle-hotel-airport.html   # 호텔 → 공항 셔틀 (유료)
shuttle-venue.html           # 행사장 셔틀 호텔 ↔ BEXCO (무료)
shuttle-chauffeur.html       # 전용차량 (프리미엄)
booking.html                 # 공통 예약 폼 페이지 (서비스 타입별 동적 렌더)
assets/transport.css         # 단일 디자인 시스템 (v2, 자기완결)
assets/app.js                # 공유 JS (reveal, lang toggle, 예약조회 모달)
assets/img/                  # 이미지 자산
bump-version.sh              # 버전 일괄 치환 스크립트
_logo_backup_html/           # 로고 변경 전 HTML 백업 (참고용)
```

## 디자인 시스템 (`transport.css`)

### CSS 변수 (`:root`)

| 토큰 | 값 | 용도 |
|------|----|------|
| `--red` | `#E8003D` | APHRS 공식 레드, 주요 CTA |
| `--navy` | `#1B2850` | 딥 네이비, 헤더/푸터 배경 |
| `--maxw` | `1180px` | 최대 컨텐츠 너비 |
| `--radius` | `6px` | 카드·버튼 기본 radius |

폰트: **Pretendard** (CDN: `jsdelivr.net/gh/orioncactus/pretendard`). 한글·라틴 모두 Pretendard 단일 패밀리.

### 버튼 클래스
`.btn-red` · `.btn-navy` · `.btn-outline` · `.btn-ghost` · `.btn-white` · `.btn-block` · `.btn-sm`

### 레이아웃
`.wrap` — `max-width: var(--maxw)`, `margin: 0 auto`, `padding: 0 24px`

### 데모 고지 요소 (제거 금지)
- `.demo-banner` — 상단 고지 바 (모든 페이지)
- `.mockup-flag` — 하단 우측 고정 배너

## 페이지 공통 패턴

모든 페이지가 따르는 구조 (shuttle/info 페이지 기준):

```html
<div class="demo-banner">…</div>
<header class="site-head">
  <!-- APHRS 로고: assets/img/brand/color/abbr_horz_1.png -->
  <nav class="nav">…4개 셔틀 링크…</nav>
  <!-- 언어 토글(UI only) + 예약조회 버튼 + 공식사이트 링크 -->
</header>
<nav class="mobile-nav" id="mobileNav">…</nav>
<main id="main">…</main>
<footer class="footer">…</footer>
<div class="mockup-flag">…</div>
<!-- 예약조회 모달 #lookupModal -->
<script src="assets/app.js?v=…"></script>
<!-- 모바일 nav 토글 inline script -->
```

페이지별 스타일 오버라이드는 `<head>`의 인라인 `<style>`에 추가 (transport.css에 범용 아닌 것은 넣지 않음).

## 이미지 폴백 패턴

로컬 자산 우선 → `onerror` 외부 이미지 폴백:

```html
<img src="assets/img/local.jpg"
     onerror="this.onerror=null;this.src='https://external.cdn/fallback.jpg'">
```

로컬 자산 교체 시 `onerror` 폴백도 함께 점검한다.

## booking.html 동작

`booking.html`은 URL 쿼리(`?svc=shuttle-airport`, `?svc=chauffeur` 등)를 읽어 서비스 타입별로 폼 내용을 동적 렌더링한다. 폼 제출은 목업(콘솔 로그만). 스타일은 페이지 내부 인라인 `<style>` 독립 유지.

## 코드 컨벤션

- **CSS 추가**: 페이지 전용 스타일은 해당 HTML `<head>`의 인라인 `<style>`. 공유가 필요하면 `transport.css` 토큰 재사용.
- **상대 경로**: `assets/...` 형식 고정 (절대 경로 사용 금지).
- **죽은 링크 없음**: 이 리포의 모든 nav 링크는 실제 파일로 이동한다 (`#`/`onclick=return false` 패턴 없음).
- **언어 토글**: `app.js`의 UI mock — 라벨만 바뀌고 실제 번역 없음. 데모 의도된 동작.
