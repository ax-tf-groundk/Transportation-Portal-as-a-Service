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
| APHRS 2026 Busan | `aphrs-2026-busan/` | https://ax-tf-groundk.github.io/Transportation-Portal-as-a-Service/aphrs-2026-busan/ |

## Repository structure

```
index.html                       → TPaaS portal landing (lists projects)
aphrs-2026-busan/                 → one project
  index.html                      → redirect into the demo
  simulation/                     → all pages (sim, hub, sub-pages, booking mockups)
  assets/                         → that project's css + images
<next-project>/                   → future events get their own folder
```

Each project folder is **self-contained** (its own `assets/` and pages), so projects
can evolve independently.

© 2026 GroundK. Concept design — details subject to change.
