# APHRS 2026 교통 포털 (TPaaS v2) — 설계 문서

- **작성일**: 2026-06-26
- **상태**: 승인 대기 (브레인스토밍 산출 스펙)
- **레포**: `Transportation-Portal-as-a-Service`
- **신규 폴더**: `aphrs-2026-transport/`

---

## 1. 목적 / 한 줄 정의

APHRS 2026(제19차 아시아태평양 부정맥학회 · 부산 BEXCO · 2026.10.21~24) 참가자가 **입국→행사→숙소→출국 전 구간 교통을 한 곳에서 예약**하는 단일 이벤트 교통 포털. RIDEUS Events 표준 패턴의 콘셉트 데모(목업).

v1(`aphrs-2026-busan`)이 "학회 사이트 복제 액자 + 여행/관광 허브"였던 것과 달리, v2는 **액자를 걷어내고 교통 정보에만 집중**한다.

## 2. 출처 3층 모델

세 참고 자료가 각각 v2의 다른 층을 담당한다.

| 층 | 출처 | 가져오는 것 |
|---|---|---|
| **껍데기 (디자인 시스템)** | `aphrs-2026-busan/assets/hub.css` (v1) | red `#e8344e` / navy `#15294d`, Poppins + Noto Sans KR, `.btn`·`.site-head`·`.panel` 컴포넌트 |
| **뼈대 (형식 · IA)** | `ifaa2024.rideus.net` | 교통 서비스 카드 중심 단일 흐름, 무료/유료 구분, 예약조회·언어토글·고객지원·법인 푸터 |
| **알맹이 (정보)** | `C:\tmp` 교통 자료 (`rideus_events_demo`, `rideus_events_portal_plan.md`, `gk_2026_events_research.md`, `transport-design-analysis.md`) | 교통 6종, APHRS 정량 데이터, 오시는길/베뉴접근/노선·스케줄, 디자인 폴리시 |

## 3. 폴더 구조 (자기완결 · 상대경로)

```
Transportation-Portal-as-a-Service/
├─ aphrs-2026-busan/        ← v1 (그대로 보존, 손대지 않음)
└─ aphrs-2026-transport/    ← v2 (신규)
   ├─ index.html            ← 교통 랜딩 (원페이지 스크롤)
   ├─ booking.html          ← 예약 (?svc= 파라미터)
   └─ assets/
       ├─ transport.css     ← hub.css 베이스 + 교통 폴리시
       ├─ app.js            ← reveal 스크롤 · 언어토글(UI) · 예약폼/바우처
       └─ img/              ← rideus_events_demo webp 재사용 (ev-aphrs 등)
```

내부 링크는 전부 상대경로. 배포 위치를 옮겨도 깨지지 않음 → §9 링크 보류와 무관하게 폴더 단독 빌드.

## 4. 랜딩(index.html) 정보구조 — ifaa2024 형식 골격

순서 고정:

1. **헤더** — RIDEUS Events 브랜드 / 언어 토글(EN·KO, UI) / "예약조회"(UI) / "공식 사이트 aphrs2026.com"
2. **히어로** — APHRS 2026 · 부산 BEXCO · 2026.10.21~24 · 핵심 수치(외국인 약 3,000명 등) + "교통 예약하기" CTA. APHRS 시그니처 ECG 펄스 모티프 선택 차용.
3. **교통 서비스 6종 카드** ← **핵심 섹션**. 수단별 카드 + 무료/유료 배지 + 카드마다 예약 CTA(`booking.html?svc=`)
4. **오시는 길 (Arrival)** — 해외→부산 입국 경로 (김해 직항 / 인천 경유 / 김포)
5. **베뉴 접근 (Venue Access)** — 김해공항·부산역(KTX) → BEXCO 소요/요금 테이블
6. **행사장 셔틀 노선 & 스케줄** — 노선 3종 + 운행 시간표(예시), "실시간 트래킹 미제공" 고지
7. **행사 정보** — APHRS 개요 + aphrs2026.com 링크
8. **고객지원 + 법인 푸터** — ops@groundk.com / 전화 / GroundK Co., Ltd 법인 정보 / Privacy·Terms

## 5. 교통 6종 서비스 정의 (plan.md 기준)

| # | 서비스 | 키 | 유무료 | 기본 구간 (from → to) |
|---|---|---|---|---|
| 1 | 공항 픽업 | `airport` | 유료 | 김해/인천공항 → BEXCO·해운대 호텔 |
| 2 | 전용차량 | `private` | 유료 | 서울/김해공항 → BEXCO·호텔 (의전 세단·밴) |
| 3 | KTX (KORAIL) | `ktx` | — | 서울역 → 부산역 (일반/특실/단체) |
| 4 | 행사 셔틀 | `shuttle` | 유료·스케줄 | 공항↔공식호텔 / 공식호텔↔BEXCO |
| 5 | 짐 배송 | `luggage` | — | 김해공항 ↔ 부산 공식호텔 |
| 6 | 유심 / eSIM | `esim` | — | 김해공항 수령 / eSIM 즉시 발급 |

`OFFERED = [airport, private, ktx, shuttle, luggage, esim]` (APHRS 6종 전부 제공).

## 6. 예약(booking.html)

- URL: `booking.html?svc=airport|private|ktx|shuttle|luggage|esim`
- 흐름: 서비스별 폼(성함·인원·출발지·도착지·일시·차량/옵션·항공편) → 제출 → **QR 바우처 미리보기**
- 유료 서비스: "요금 책정 예정(TBD)" 콜아웃. 스케줄 서비스: "노선·시간표 기준, 실시간 위치 없음" 힌트.
- 미지정/미제공 `svc` → 안내 패널 + 랜딩 복귀.
- **결제·실제 예약 없음** (목업). 제출 시 예약번호 `RE-APHRS-XXX-####` 생성.

## 7. 디자인 시스템

- **베이스**: v1 `hub.css` 토큰·컴포넌트. `transport.css`에서 재정의/확장하되 v1 hub.css 파일은 건드리지 않음(복사·발전).
- **폴리시 보강** (`transport-design-analysis.md` 테이크어웨이): 카드 hover 복합 변화(opacity+transform+shadow 동시), 카드 1px 브랜드 보더, 그라디언트 오버레이, **무료/유료 가격 태그 색 분리**, 순수 `#000` 회피, 시차(staggered) reveal.
- **APHRS 시그니처**: ECG 펄스 모티프(히어로) — `prefers-reduced-motion` 존중.

## 8. 콘텐츠 정합성 (gk_2026_events_research.md 기준)

- **APHRS = 2026.10.21(수)~24(토)** 고정. `rideus_events_demo`의 날짜/월 오기는 v2에서 교정.
- 부산 BEXCO(해운대 인근), 외국인 약 3,000명, KHRS 공동개최, 슬로건 "Feel the Rhythm, Feel the Future".
- 관광 콘텐츠(Explore Busan / K-Food / Visa / Plan Your Visit) **전면 제외**.
- 요금·시간 등 변동 수치는 "예시/변동 가능" 고지 유지.

## 9. 목업 범위 (YAGNI)

**포함**: 정적 HTML/CSS/바닐라 JS, 교통 6종 카드, 예약 폼→바우처 미리보기, reveal 애니메이션, 언어토글/예약조회 **UI(라벨·예시 바우처 수준)**, 데모 고지.

**비포함**: 실제 결제·예약 백엔드, 실제 다국어 텍스트 교체, 로그인/회원가입, 실시간 관제(TMS), 빌드 시스템.

## 10. 보류 (사용자 추후 결정)

- 루트 `index.html` 포털 카드에 v2 추가 여부 / v1과의 관계(병행·대체·아카이브)
- GitHub Pages 배포 경로 및 상호 링크
→ v2 폴더 완성과 **독립**. 폴더는 자기완결로 빌드되어 어떤 배포 결정과도 호환.

## 11. 구현 단위 (파일별 책임)

- `index.html` — 랜딩 8섹션 마크업. 콘텐츠(행사 데이터·교통 카드·테이블)는 정적.
- `assets/transport.css` — hub.css 베이스 디자인 시스템 + 랜딩/카드/테이블/히어로 스타일.
- `assets/app.js` — reveal(IntersectionObserver), 언어토글 UI, 예약조회 모달 UI, **`SITE_VERSION` 빌드 콘솔 로그**.
- `booking.html` — 예약 폼 + 인라인 스크립트(서비스 데이터 `SVC`/`OFFERED`, 폼→바우처).
- `assets/img/` — webp 자산 복사.

## 12. 검증 (정적 데모 기준)

- 로컬 정적 서버(`python -m http.server`)로 열어 6개 서비스 각각 `booking.html?svc=` 진입 → 폼·바우처 동작 육안 확인.
- 상대경로 무결성: `file://`·서브경로 배포 양쪽에서 자산 로드 확인.
- `prefers-reduced-motion`에서 애니메이션 정지 확인.
- 반응형(모바일 폭) 카드/테이블 붕괴 없음 확인.
- **캐시 무효화**: `SITE_VERSION`을 올린 뒤 강력 새로고침 없이도 에셋 URL(`?v=`)이 바뀌어 새 CSS/JS가 로드되는지, 푸터 버전 표기가 갱신되는지 확인.

---

## 13. 버전 관리 & 캐시 무효화 (Cache Busting)

GitHub Pages 정적 배포에서 CSS/JS가 브라우저·CDN 캐시에 잡혀 업데이트가 안 보이는 문제를 막는다. 빌드 시스템이 없으므로 **버전 쿼리스트링** 방식을 표준으로 한다.

### 13-1. 단일 버전 소스
- 사이트 버전 문자열 `SITE_VERSION = "YYYY.MM.DD.N"` (예: `2026.06.26.1` — 날짜 + 당일 패치번호)을 **단일 기준값**으로 둔다.
- 모든 에셋 참조에 동일 버전 쿼리를 붙인다:
  ```html
  <link rel="stylesheet" href="assets/transport.css?v=2026.06.26.1">
  <script src="assets/app.js?v=2026.06.26.1"></script>
  ```
- 콘텐츠/스타일을 고쳤으면 `SITE_VERSION`을 올린다 → 에셋 URL이 바뀌어 캐시가 강제 무효화되고 새 파일이 내려간다.

### 13-2. 버전 가시화 (업데이트 도달 확인)
- **푸터**에 `v2026.06.26.1` 표기.
- `app.js`가 콘솔에 `RIDEUS Events · APHRS 2026 · build 2026.06.26.1` 로그.
- → 화면/콘솔에서 버전을 눈으로 확인해 "내 업데이트가 실제로 떴는지" 즉시 판단.

### 13-3. HTML 캐시 보조
- 각 HTML `<head>`에 보조로 `<meta http-equiv="Cache-Control" content="no-cache">` 삽입(브라우저별 존중 차이 있음 — 정석은 쿼리스트링이며 meta는 보강).
- HTML 자체는 GitHub Pages 기본 단기 캐시(약 10분). HTML이 갱신되면 그 안의 `?v=` 토큰이 바뀌어 에셋을 재요청하므로, 실질 무효화는 HTML 1회 갱신만으로 전파된다.

### 13-4. 버전 올리는 절차 (운영 SOP)
1. 에셋(`transport.css`/`app.js`)·콘텐츠 수정.
2. 모든 HTML의 `?v=` 토큰과 `SITE_VERSION`·푸터 표기를 새 값으로 **일괄 치환**(전 파일에서 같은 문자열을 쓰므로 grep/replace 한 번).
3. 커밋/배포.

### 13-5. 비채택 대안 (근거)
- **파일명 해싱**(`transport.{hash}.css`): 확실하나 빌드 없이 수동 리네임이라 부담 → 비채택.
- **meta 태그 단독**: 호스트가 헤더를 못 바꾸는 GitHub Pages에선 신뢰 불가 → 보조로만.
