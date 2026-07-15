# Transportation Portal as a Service (TPaaS)

Event-specific travel & ground-transportation portals by **GroundK**.
Each event is managed as an independent project folder under this repository.

> ⚠️ Concept demos. Booking flows are illustrative only and not connected to any live
> reservation system. Not affiliated with the official event websites.

## Live

👉 **https://ax-tf-groundk.github.io/Transportation-Portal-as-a-Service/**

The root page lists all projects. Each project is also directly reachable:

| Project | Folder | Live |
|---|---|---|
| APHRS 2026 Busan — Hub v1 | `aphrs-2026-busan/` | https://ax-tf-groundk.github.io/Transportation-Portal-as-a-Service/aphrs-2026-busan/ |
| APHRS 2026 Busan — Transport v2 | `aphrs-2026-transport-v2/` | https://ax-tf-groundk.github.io/Transportation-Portal-as-a-Service/aphrs-2026-transport-v2/ |
| APHRS 2026 Busan — Transport v3 (frozen 2026-07-15) | `aphrs-2026-transport/` | https://ax-tf-groundk.github.io/Transportation-Portal-as-a-Service/aphrs-2026-transport/ |
| **APHRS 2026 Busan — Transport v4** (active) | `aphrs-2026-transport-v4/` | https://ax-tf-groundk.github.io/Transportation-Portal-as-a-Service/aphrs-2026-transport-v4/ |
| **ITS 2026 Gangneung — Transport** | `its-2026-gangneung/` | https://ax-tf-groundk.github.io/Transportation-Portal-as-a-Service/its-2026-gangneung/ |

### APHRS 2026 Busan (제19차 아시아태평양심장부정맥학회)

참가자 수송 포털. 세대별로 폴더가 분리돼 있고 **v4가 앞으로의 활성 개발 대상**, v3는 2026-07-15부로
동결됐다. v2는 v3 리뉴얼 때 같은 폴더를 덮어써서 한동안 사라져 있었고, 2026-07-15에 `98cd6bd`
(2026-07-10)에서 `aphrs-2026-transport-v2/`로 복원했다.

- **v4** — 행사장 셔틀을 노선도 다이어그램 + 노선×날짜 독립 탭 시간표 구조로 재설계. Figma 실측 기반
  UI 정밀화, Faculty Dinner·대체 정류장 안내 개선, 지도 로드 실패 시 안전장치
- **v3** (동결) — 공항↔호텔 통합 셔틀, 통합 여행정보(입국·KTX·짐배송) 리뉴얼, 히어로·내비게이션 개편.
  페이지 구성은 홈 · 여행정보 · 공항 셔틀 · 행사장 셔틀 · 전용차량 · 예약
- **v2** — 정보 페이지가 입국·KTX·짐배송·유심으로 각각 분리돼 있고, 공항 셔틀도 왕/복로가
  별도 페이지(`shuttle-airport-hotel` · `shuttle-hotel-airport`)인 구조. book-panel 기반

### ITS 2026 Gangneung (2026 강릉 ITS 세계총회)

참가자 교통 포털. 공식 그린 팔레트(`#006241` / `#009E95`), Montserrat + Pretendard.

- **홈** — 히어로(강릉올림픽파크 항공뷰), 셔틀 서비스 카드, 전용차량 안내, 현장 지원(안내데스크 7개소·24h 상황실)
- **공항 → 베뉴 / 베뉴 → 공항** — 입국(인천 IG·김포 GG)·출국(→서울역) 셔틀, 웰컴데스크, 탑승 위치
- **행사장 셔틀** — 숙소 순환(G2~G5)·역터미널 순환(G1)·내부 순환(OP) 3개 서브탭
- **전용 차량 / 오시는 길 / 예약조회**
- 지하철식 **노선도(SVG 연결선 + 정류장 원 + 대각선 라벨, 뱀형 굽이)** + 접이식 **전체 시간표**(첫차~막차·거점/반환점 강조)
- 노선·시간표는 「2026 강릉 ITS 세계총회 수송계획(안)」 기준

## Repository structure

```
index.html                       → TPaaS portal landing (lists projects)
aphrs-2026-busan/                 → project: APHRS 2026 Hub v1
  index.html · simulation/ · assets/
aphrs-2026-transport-v2/          → project: APHRS 2026 Transport v2 (restored from 98cd6bd)
  index.html · booking.html · shuttle-venue.html · shuttle-chauffeur.html
  shuttle-airport-hotel/-hotel-airport.html → 공항↔호텔 셔틀 (왕/복 분리)
  info-arrival/-ktx/-baggage/-esim.html     → 입국 · KTX · 짐배송 · 유심
  assets/ (transport.css · app.js · img/)
aphrs-2026-transport/             → project: APHRS 2026 Transport v3 (frozen 2026-07-15)
aphrs-2026-transport-v4/          → project: APHRS 2026 Transport v4 (active)
  index.html                      → landing
  travel.html                     → 여행정보 (입국 · KTX · 짐배송)
  airport-transfer.html           → 공항 ↔ 호텔 셔틀
  shuttle-venue.html              → 행사장 셔틀 (노선도 + 노선×날짜 탭 시간표)
  shuttle-chauffeur.html          → 전용 차량
  booking.html                    → 예약
  assets/ (transport.css · app.js · img/)
its-2026-gangneung/               → project: ITS 2026 Gangneung
  index.html                      → landing (hero, shuttle cards, chauffeur, support)
  shuttle-airport-in/out.html     → 공항 ↔ 베뉴 셔틀
  shuttle-venue.html              → 행사장 순환 셔틀 (3 sub-tabs)
  shuttle-chauffeur.html          → 전용 차량
  info-access.html · booking.html → 오시는 길 · 예약
  assets/ (transport.css · app.js · img/)
<next-project>/                   → future events get their own folder
```

Each project folder is **self-contained** (its own `assets/` and pages), so projects
can evolve independently.

© 2026 GroundK. Concept design — details subject to change.
