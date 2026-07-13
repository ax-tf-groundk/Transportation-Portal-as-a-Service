# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 프로젝트 성격

GroundK **RIDEUS Events × 2026 강릉 ITS 세계총회(World Congress)** 참가자 교통 포털 — TPaaS 세 번째 프로젝트, 콘셉트 데모. 빌드 시스템 없는 순수 정적 사이트(HTML + 공유 CSS/JS). 노선·시간표는 「2026 강릉 ITS 세계총회 수송계획(안)」 기준이며, 예약 흐름은 시연용 목업이라 실제 예약 시스템과 연동되지 않는다.

`aphrs-2026-transport/`(v2/v3)와 자매 프로젝트로 **자산·CSS를 실제로 복사해서 시작**했다 — `transport.css` 상단 주석이 아직 "APHRS 2026 Busan"으로 남아있는 등 유래를 보여주는 흔적이 있지만, 지금은 완전히 독립적인 자기완결 프로젝트다. 공식 대회 사이트는 별도(`2026itsworldcongress.org`).

## 실행 / 미리보기

- **빌드·테스트·린트 명령 없음.** 파일을 직접 열거나 정적 서버로 띄운다.
  - `file://` 직접 열기: 상대 경로라 대부분 동작
  - 권장: 리포 루트에서 `python -m http.server 8000` → `http://localhost:8000/its-2026-gangneung/`
- **배포**: `main` push → GitHub Pages 자동 서빙 (빌드 단계 없음)
- ⚠️ `git push`·PR은 사용자가 명시적으로 요청할 때만 수행한다.

## 버전 관리

버전 형식: `YYYY.MM.DD.N`. 다음 3곳이 모든 HTML에서 `2026.07.10.6`으로 동기화되어 있다:

1. `<meta name="version">`
2. `<link href="assets/transport.css?v=...">`
3. `<script src="assets/app.js?v=...">`

⚠️ **알려진 드리프트**: `assets/app.js` 내부의 `SITE_VERSION` 상수는 `2026.07.10.3`으로 뒤처져 있다(HTML은 `.6`). `aphrs-2026-transport`와 달리 이 프로젝트엔 `bump-version.sh` 같은 일괄 치환 스크립트가 없다 — 버전을 올릴 땐 위 3곳 + `app.js` `SITE_VERSION`을 수동으로 함께 맞출 것.

## 사이트 구조

```
index.html                   # 포털 홈 — 히어로(강릉올림픽파크 항공뷰), 셔틀 카드, 전용차량, 현장지원
shuttle-airport-in.html      # 공항 → 베뉴 셔틀 (인천 IG · 김포 GG, 무료·사전신청)
shuttle-airport-out.html     # 베뉴 → 공항/서울역 셔틀 (무료·희망신청)
shuttle-venue.html           # 행사장 순환 셔틀 — 숙소순환(G2~G5)·역터미널순환(G1)·내부순환(OP) 3개 서브탭
shuttle-chauffeur.html       # 전용차량 (유료·견적)
info-access.html             # 오시는 길 (KTX·버스로 강릉)
booking.html                 # 공통 예약 폼 — ?route=airport-in|airport-out|chauffeur 로 동적 렌더
assets/transport.css         # 단일 디자인 시스템 (aphrs-2026-transport에서 파생, 자기완결)
assets/app.js                # 공유 JS (lang toggle, 예약조회 모달, 노선도/시간표 렌더러)
assets/img/                  # 이미지 자산 (favicon, 로고, 히어로 사진 1장, 탑승장 안내도 1장)
```

nav는 6개 링크(홈/공항→베뉴/베뉴→공항/행사장 셔틀/전용 차량/오시는 길)로 전 페이지 동일 — 죽은 링크(`href="#"`) 없이 전부 실제 파일로 이동한다.

## 디자인 시스템 (`transport.css`)

### CSS 변수 — 이름은 유지, 값은 ITS 그린으로 교체됨

`aphrs-2026-transport`에서 복사되어 변수 **이름**(`--red`, `--orange`, `--navy`)은 그대로지만 **값**은 ITS 공식 그린 팔레트로 바뀌어 있다. 코드 읽을 때 헷갈리기 쉬우니 주의:

| 변수 | 값 | 실제 색 | 용도 |
|------|----|---------|------|
| `--red` | `#006241` | **그린** (ITS 공식 프라이머리) | 주요 CTA, 강조 — "빨강"이 아님 |
| `--orange` | `#009E95` | **틸/청록** | 세컨더리 강조 (전용차량 CTA 등) — "주황"이 아님 |
| `--navy` | `#013D28` | 딥 그린 | 헤더/푸터/그라디언트 배경 |
| `--maxw` | `1180px` | | 최대 컨텐츠 너비 |

폰트: **Montserrat**(라틴, 헤딩) + **Pretendard**(한글/본문, CDN) — 루트 포털의 Poppins+Noto Sans KR, `aphrs-2026-transport`의 Pretendard 단독과 다른 조합이니 새 페이지 만들 때 `body{font-family}` 재확인.

### 레거시 CSS 잔재

`transport.css` 중간에 "LEGACY CLASS ALIASES — info-ktx / info-baggage / info-esim" 섹션이 있는데, 이 프로젝트엔 해당 페이지가 없다(aphrs-2026-transport에서 복사되며 딸려온 죽은 CSS). 삭제해도 지장 없지만 건드릴 필요도 없다.

### ITS 전용 컴포넌트 (`transport.css` 하단 "ITS additions" 섹션, ~L870 이후)

- **`.rroute` + `app.js`의 `buildSnake()`/`buildTimetable()`** — 지하철식 노선도(SVG 연결선 + 정류장 원 + 대각선 라벨, 뱀형 굽이) 및 접이식(`<details>`) 전체 시간표를 **`data-config` JSON 속성만으로 JS가 전부 생성**한다. 이미지 자산 불필요 — 이 사이트의 시그니처 컴포넌트. `shuttle-airport-in/out.html`, `shuttle-venue.html`에서 사용. `data-config` 스키마: `{code, title, meta[], stops[], segs[], loop, first, last, headway, headwayLabel, timetable}`.
- **`.photo-card2` / `.pc-ph`** — 번호 매겨진 사진 캡션 카드. 실제 사진이 있으면 `<img>`, 없으면 `.pc-ph` 점선 플레이스홀더(🖼️ 이모지 + "촬영 예정" 캡션)를 자리에 넣는다.
- **`.scard-photo::before` / `.scard-phtag`** — `index.html` 셔틀 서비스 카드의 사진 자리도 동일하게 "🖼️ 실제 사진 예정" 플레이스홀더로 비어있다.
- **`.hero-photo`**(index.html) — 유일하게 실사진이 이미 적용된 자리. `assets/img/gangneung-olympic-park-its-hero-4k.jpg`를 딥그린 그라디언트 오버레이와 함께 CSS `background-image`로 렌더링(`<img>` 태그 아님).
- **`dhero-its`**(상세 페이지 히어로) — 의도적으로 사진 없는 단색 딥그린 그라디언트. CSS 주석에 "no photo" 명시.
- **`.photo-ph`** — 범용 플레이스홀더 클래스가 정의는 되어 있으나 현재 어떤 HTML에서도 쓰이지 않음(예비용).

## 이미지 자산 현황 (오늘 작업 관련)

현재 커밋된 실사진은 사실상 **`its-mark.png`(로고, 전 페이지) + `gangneung-olympic-park-its-hero-4k.jpg`(홈 히어로) + `incheon-boarding-map.jpg`(공항 탑승 위치 안내도 1장)** 뿐이고, 나머지 사진 자리는 전부 위 플레이스홀더 패턴(`.pc-ph`, `.scard-photo`)으로 비어있다. **이미지 교체 작업 시**:
1. `assets/img/`에 파일 추가
2. `.pc-ph` div를 `<img src="assets/img/파일명" alt="...">`로 교체 (`.pc-head`/`.pc-cap` 캡션 구조는 유지)
3. `index.html`의 `.scard-photo` 안에 `<img>`를 추가하고 `::before` 플레이스홀더 텍스트는 CSS에서 해당 카드 한정으로 무력화(또는 이미지 로드 시 `::before`가 뒤에 가려지도록 z-index만 확인 — 현재 `::before`엔 배경보다 위 레이어가 없어 이미지를 얹으면 자동으로 가려짐)

## booking.html 동작

URL 쿼리 `?route=airport-in|airport-out|chauffeur`를 읽어 인라인 스크립트 내 `ROUTES` 객체(제목·배지·요금·날짜 등)로 폼을 동적 렌더링한다. `assets/app.js`가 아닌 **페이지 자체 인라인 `<script>`**로 처리(app.js 주석에도 명시됨). 제출 시 입력 문자열 기반 결정론적 시드로 `ITS-SH-XXXXXX`(셔틀) / `ITS-PC-XXXXXX`(전용차량) 형태의 목업 예약번호를 생성 — 실제 서버 연동 없음.

## 코드 컨벤션

- **CSS 추가**: 페이지 전용 스타일은 해당 HTML `<head>`의 인라인 `<style>`. 공유 필요 시 `transport.css` 토큰 재사용.
- **상대 경로**: `assets/...` 형식 고정.
- **죽은 링크 없음**: nav 링크는 전부 실제 파일로 이동(`#`/`onclick=return false` 패턴 없음).
- **언어 토글**: `app.js`의 UI mock — 라벨만 바뀌고 실제 번역 없음. 데모 의도된 동작.
- **데모 고지 요소(제거 금지)**: `.demo-banner`(상단, 공식 사이트 `2026itsworldcongress.org` 안내) · `.mockup-flag`(하단 우측 고정)
