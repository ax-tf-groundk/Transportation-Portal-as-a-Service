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
| APHRS 2026 Busan — Transport v2 | `aphrs-2026-transport/` | https://ax-tf-groundk.github.io/Transportation-Portal-as-a-Service/aphrs-2026-transport/ |
| **ITS 2026 Gangneung — Transport** | `its-2026-gangneung/` | https://ax-tf-groundk.github.io/Transportation-Portal-as-a-Service/its-2026-gangneung/ |

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
aphrs-2026-transport/             → project: APHRS 2026 Transport v2
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
