# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 프로젝트 성격

GroundK의 **Transportation Portal as a Service (TPaaS)** — 이벤트별 여행·지상교통 포털의 **콘셉트 데모**. 빌드 시스템·프레임워크·`package.json`이 전혀 없는 순수 정적 사이트(HTML + 인라인/공유 CSS + 바닐라 JS)다. 예약 흐름은 시연용 목업이며 실제 예약 시스템과 연동되지 않는다.

배포 대상은 GitHub Pages (`https://ax-tf-groundk.github.io/Transportation-Portal-as-a-Service/`, remote `origin` = `github.com/ax-tf-groundk/...`).

## 실행 / 미리보기 / 배포

- **빌드·테스트·린트 명령 없음.** 파일을 직접 열거나 정적 서버로 띄운다.
  - 빠른 확인: `index.html` 을 브라우저로 직접 열기 (모든 경로가 상대 경로라 `file://` 에서도 대부분 동작)
  - 권장: 리포 루트에서 `python -m http.server 8000` → `http://localhost:8000/`
- **배포**: `main` 에 push 하면 GitHub Pages 가 그대로 서빙. 빌드 단계가 없으므로 소스 = 배포물.
- ⚠️ 이 폴더는 `D:\Works` 하위(`d:\Works\CLAUDE.md` = 로컬 전용 원칙)지만 실제로는 GitHub Pages 로 배포되는 리포다. **`git push`·PR 은 사용자가 명시적으로 요청할 때만** 수행한다.

## 구조: 2단계 데모 모델

이 리포의 핵심은 두 겹의 중첩 구조다.

### 1. TPaaS 포털 (리포 루트)

- `index.html` — 프로젝트 목록 랜딩. **GroundK 브랜드 인디고 `#2E3192`**, 인라인 `<style>`. 각 이벤트 카드가 해당 프로젝트 폴더로 진입.
- `assets/groundk-logo.png` — 루트 전용 브랜드 로고.
- 새 이벤트는 **자기완결적 폴더 하나**로 추가한다(자체 `assets/` + 페이지). 프로젝트끼리 디자인·자산을 공유하지 않으므로 독립적으로 진화 가능.

### 2. 이벤트 프로젝트 (`aphrs-2026-busan/`) — 그 안에서 다시 2층

- `index.html` — `meta refresh` + `location.replace` 로 `simulation/index.html` 로 리다이렉트하는 얇은 진입점.
- `simulation/index.html` — **실제 APHRS 2026 학회 공식 사이트를 재현한 복제 화면**. 톤이 다르다: navy `#0e2d64` / red `#e92b44`, GNB 드롭다운 내비, 히어로 슬라이더, D-day 카운트다운. **인라인 `<style>` 전용** — `hub.css`·`book-widget.js` 를 쓰지 않는 유일한 페이지. 학회 메뉴 대부분은 죽은 링크이고, **유일한 라이브 경로는 `About Travel` 메뉴(`.demo-path`)** 로 GroundK 여행 허브를 새 탭으로 연다.
- 나머지 `simulation/*.html` — **GroundK 여행 허브** 페이지군. 전부 `../assets/hub.css` 디자인 시스템(red `#e8344e` / navy `#15294d`)을 공유하고 `../assets/book-widget.js` 를 로드한다.
  - 정보: `hub.html`(Travel Home) · `transportation-guide.html` · `plan-your-visit.html` · `busan.html` · `korea.html` · `kfood.html` · `visa.html`
  - 검색/예약 흐름: `search-results.html`, `transportation-reservation.html`, 그리고 `gt-*.html` = **ground transportation 예약 목업**(`gt-private-car` / `gt-shuttle` / `gt-korail`(Train) / `gt-luggage` / `gt-esim`)

즉 사용자 동선은 **학회 복제 사이트 → About Travel → GroundK 허브 → 예약 목업** 이다. 복제 사이트는 "실제처럼 보이는 액자", 허브가 실제 제안하는 서비스다.

## 공유 컴포넌트 (허브 페이지 한정)

- **`aphrs-2026-busan/assets/hub.css`** — 허브 전체의 단일 디자인 시스템. `:root` CSS 변수로 색·radius·shadow·`--maxw` 정의, `.btn`/`.btn-red`/`.btn-navy`/`.btn-outline` 변형, `.site-head` 스티키 내비, `.panel`·`.book.cols-3` 예약 레이아웃 등. 허브 페이지를 수정할 땐 페이지에 새 CSS 를 인라인하지 말고 여기 토큰·클래스를 재사용한다.
- **`aphrs-2026-busan/assets/book-widget.js`** — 모든 허브 페이지에 주입되는 전역 플로팅 "Book" FAB. JS 가 DOM 을 통째로 생성(우하단 FAB → 슬라이드인 패널, Private Car/Shuttle/Train 탭 폼)하고 `sessionStorage['gkBookSeenSite']` 로 **사이트당 1회만 자동 오픈**한다. 탭별 "Continue" 링크는 `gt-private-car.html` / `gt-shuttle.html` / `gt-korail.html` 로 하드코딩. 한 번 닫으면 모든 페이지에서 닫힌 상태 유지가 의도된 동작이다.

## 코드 컨벤션

- **죽은 링크 표기**: 시연되지 않는 학회 메뉴는 `href="#" onclick="return false"`. 실제 이동하는 "demo path" 링크만 진짜 `href` 를 가진다 — 둘을 섞지 말 것.
- **이미지 폴백**: 로컬 자산을 먼저 쓰고 `onerror` 로 실제 APHRS 원격 이미지(`https://aphrs2026.com/...`)로 폴백하는 패턴(`top_logo.png`, 히어로 슬라이드 등). 로컬 자산을 갈아끼울 땐 이 `onerror` 폴백도 함께 점검.
- **폰트**: Poppins + Noto Sans KR (Google Fonts). 라틴은 Poppins, 한글은 Noto Sans KR 로 폴백.
- **상대 경로 고정**: 허브 페이지는 `../assets/...`, 프로젝트 진입점은 `./simulation/...`. 로컬·GitHub Pages 양쪽에서 동작하도록 절대 경로를 쓰지 않는다.
- **데모 표식**: 상단 `.demo-banner`(한국어 안내)와 하단 `.mockup-flag`("컨셉 목업 · 실제 예약 연동 예정")는 의도된 데모 고지다 — 임의로 제거하지 말 것.
- **`.gitignore` 정책**: 내부 작업 문서(`.claude/`, 콘텐츠 마크다운, `구조명세_v1.md`)와 클라이언트 원본 자산(`*.ai`/`*.pdf`/`*.psd`, 디자인톤 PNG)은 배포에서 제외된다. 비공개 소스를 리포에 커밋하지 않는다.
