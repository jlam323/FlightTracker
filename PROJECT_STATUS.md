# SkyTrack Live - Project State & Architecture

**Last Updated:** September 24, 2026  
**Status:** Base architecture complete, Option 1 (API & Data Feed Layer) in progress, 0 build errors.

---

## 1. Project Overview & Technologies
* **Framework:** React 19 + TypeScript + Vite + Tailwind CSS v4
* **Map Rendering:** Hardware-accelerated Deck.gl WebGL (`ArcLayer`, `ScatterplotLayer`, `TextLayer`) + MapLibre GL JS
* **Base Map:** Carto Dark Matter vector tiles (dark command-center radar theme)
* **Architecture:** Strict layer separation across `types/`, `data/`, `api/`, `services/`, `utils/`, `hooks/`, and `components/`.

---

## 2. Directory Structure & Layers
```
src/
├── types/
│   └── flight.ts              # Domain interfaces: Flight, Airport, FlightArc, FlightFilters
├── data/
│   ├── airports.ts            # 280+ curated commercial airports (North America & Global) with fast IATA/ICAO indexing
│   └── airlines.ts            # Major airline registry & callsign prefix detector (DAL, UAL, AAL, SWA, ACA, etc.)
├── api/
│   ├── flightApi.ts           # Primary Flightradar24 zone feed client + mock fallback
│   ├── openSkyApi.ts          # OpenSky Network live ADS-B state vectors client (bounding box support)
│   └── mockData.ts            # Realistic North American & transcontinental flight simulation snapshot
├── services/
│   ├── flightProcessor.ts     # Normalizes raw feeds & generates 3D Great-Circle Arcs
│   └── filterService.ts       # Filtering engine (Callsign/ID, airline, route pair, airborne only, region)
├── utils/
│   └── geo.ts                 # Great-Circle Haversine calculations, ETA, progress %, unit formatters
├── hooks/
│   ├── useFlightFeed.ts       # Polling manager (60s cycle, manual refresh, error recovery)
│   └── usePinnedFlights.ts    # Watched flights persistence via localStorage
└── components/
    ├── header/
    │   ├── Header.tsx         # North America / Global scope toggle, live stats, refresh button
    │   └── FilterBar.tsx      # Flight ID search, airline dropdown, route pair, airborne toggle
    ├── map/
    │   ├── FlightMap.tsx      # Deck.gl 3D Arcs + aircraft markers + hover tooltips + click selection
    │   └── MapControls.tsx    # Hub camera presets (JFK, LAX, ORD, ATL, DFW, YYZ) & 3D tilt controls
    └── sidebar/
        ├── FlightDetailDrawer.tsx # Slide-out flight inspector (ETA, time remaining, progress, telemetry)
        └── PinnedFlightsDrawer.tsx # Watched / pinned flights drawer
```

---

## 3. Completed Features
1. **Scope Toggle**: North America default (bounding box clamped) + Global view when filtered.
2. **Multi-Filter Bar**:
   * Single flight ID / Callsign search (e.g. `DL1234`, `UA240`).
   * Airline dropdown filter (Delta, United, American, Southwest, Air Canada, etc.).
   * Origin & Destination airport pair filtering (`JFK` $\rightarrow$ `LAX`).
   * "Airborne Only" toggle to hide taxiing/parked aircraft.
3. **3D Flight Arcs for ALL Displayed Flights**:
   * Hardware-accelerated Deck.gl `ArcLayer` with subtle 20% opacity for airspace network aesthetic.
   * Highlighted high-opacity golden/cyan arc for selected or hovered flight.
4. **Flight Detail Inspector Drawer**:
   * Click any aircraft on the map to open the drawer.
   * Computes **Time Remaining Until Arrival** and **Estimated Time of Arrival (ETA)** using Great-Circle distance and speed.
   * Visual animated progress bar: `Origin ━━━✈━━━━━━ Destination (62%)`.
   * Complete physical telemetry: Altitude (FL), Ground Speed, Heading, Vertical climb/descent rate, Squawk, and Transponder hex.
   * Direct external link to Flightradar24.
5. **Persistence & Offline Simulation**:
   * Pinning flights saves to `localStorage` and persists across page reloads.
   * "Live ADS-B" vs. "Simulated Feed" toggle for offline development.
6. **Airport Database Expansion**:
   * 280+ airports across North America and major global hubs with $O(1)$ fast lookup.
7. **OpenSky Network Client**:
   * Created `src/api/openSkyApi.ts` for secondary live ADS-B state vector ingestion.

---

## 4. Next Steps to Resume
1. Wire `openSkyApi.ts` into `flightApi.ts` multi-source fallback cascade.
2. Optional: SVG airplane heading icons or custom map layer styling.
3. Run `npm run dev` to preview live in browser.
