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
├── constants/
│   └── palette.ts             # Centralized visual color palette for layers and text overlays
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
    │   ├── FlightMap.tsx      # Base map controller that calculates viewport densities and stacks layers
    │   ├── MapControls.tsx    # Hub camera presets (JFK, LAX, ORD, ATL, DFW, YYZ) & controls
    │   ├── mapConstants.ts    # CARTO map style and aircraft icon atlas mapping
    │   └── layers/            # Modularized Deck.gl layer definitions
    │       ├── RouteArcsLayer.ts       # Great-Circle 3D route arcs
    │       ├── AirportDotsLayer.ts     # Cool Platinum Ice airport markers
    │       ├── AirportLabelsLayer.ts   # Tiered airport IATA text labels
    │       ├── HighlightRingsLayer.ts  # Selected & pinned target highlight rings
    │       ├── AirplaneIconsLayer.ts   # Hardware-accelerated heading-oriented plane icons
    │       ├── FlightLabelsLayer.ts    # Density-aware flight ID badges under aircraft
    │       ├── FlightOdLabelsLayer.ts  # Origin -> Destination 2nd line on hover
    │       ├── airportColor.ts         # Unified airport color resolver
    │       └── index.ts                # Layer barrel exports
    └── sidebar/
        ├── FlightDetailDrawer.tsx # Slide-out flight inspector (ETA, time remaining, progress, telemetry)
        └── PinnedFlightsDrawer.tsx # Watched / pinned flights drawer
public/
├── airplane.svg               # Aircraft silhouette SVG icon atlas
├── favicon.svg                # Application favicon
└── icons.svg                  # SVG sprite icons
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
7. **OpenSky Network Client & Multi-Source Resilient Pipeline**:
   * Created `src/api/openSkyApi.ts` for secondary live ADS-B state vector ingestion.
   * Completed fallback cascade in `src/api/flightApi.ts`:
     1. Primary: Flightradar24 zone feed
     2. Secondary: OpenSky Network live ADS-B feed
     3. Fallback: Simulated Mock Feed
   * Added dynamic live source indicators to `Header.tsx` (Live: FR24, Live: OpenSky, Simulated Feed) and `FlightDetailDrawer.tsx` (Telemetry Data Source).

8. **Heading-Oriented Aircraft Icons (Deck.gl `IconLayer`)**:
   * Hardware-accelerated top-down airplane silhouettes rendered at each flight's exact real-time coordinate along its Great-Circle Arc.
   * Real-time compass heading rotation synced with map camera bearing (`(360 - d.heading + viewState.bearing) % 360`).
   * Dynamic GPU color masking by altitude (Cyan for cruise, Indigo for mid-flight, Emerald for climb/approach, Slate for ground, Yellow for selected, Amber for pinned).
   * Selection and pinned target glow rings beneath highlighted aircraft.

9. **Origin $\rightarrow$ Destination Great-Circle Route Arcs & Airport Markers**:
   * **True Great-Circle Arcs**: Every displayed arc spans continuously from Origin Airport $\rightarrow$ Destination Airport (never stopping prematurely at the aircraft's current coordinate, including in single plane detailed view).
   * **Strict Flight-Arc Invariant**: Arcs are strictly generated 1:1 for active airborne flights with resolved origin & destination airports; no phantom/empty route pairs exist without an active flight on them.
   * **Zero Parallax Offset**: Route arcs use `greatCircle: true` with `getHeight: 0` and aircraft icons sit at `z: 0`, ensuring plane icons sit dead-center on their arcs across all 3D tilt angles.
   * **Airport Dots & IATA Labels**: 280+ commercial airports rendered via `ScatterplotLayer` with interactive hover tooltips and click-to-focus; endpoints for selected flight highlight in Cyan (Origin) and Rose (Destination) with persistent IATA labels.
   * **Z-Index Sorting**: Arcs and plane icons are dynamically sorted so selected and pinned flights render with top visual priority.

10. **Interactive Map UX, Airport Code Toggles & Depth Clipping Fix**:
   * **Default Airport Codes with Toggle**: Major tier-1 hubs (ATL, LAX, ORD, DFW, JFK, SFO, etc.) display IATA codes on initial map load. Added an interactive "Airport Codes" toggle button to both the top `FilterBar` and bottom-left `MapControls`.
   * **Hover Pointer Cursor & Forgiving Hit-Testing**: Enabled `getCursor` to transition to `'pointer'` on hover over aircraft and airport dots. Configured Deck.gl `pickingRadius={10}` to expand hit-testing by 10 screen pixels around the cursor for seamless clicks.
   * **Yellow Plane Clipping Elimination**: Configured `parameters: { depthCompare: 'always', depthWriteEnabled: false }` across all 2D overlay layers. This eliminates GPU depth-buffer occlusion between the 3D-tilted highlight ring ground plane and the billboarded aircraft icon at 45° pitch.

11. **Pure Top-Down Perspective & Clutter-Free Flight ID Badges**:
   * **Locked Top-Down View**: Default camera perspective is 2D top-down (`pitch: 0°`). Removed the 3D pitch toggle and camera tilt behaviors (`handleFlyTo` maintains `pitch: 0`, `<Map />` clamped with `maxPitch={0}`, and `dragRotate: false` in Deck.gl controller).
   * **Positioned Under Aircraft**: Flight number badges are centered directly below each aircraft silhouette (`getAlignmentBaseline: 'top', getTextAnchor: 'middle', getPixelOffset: [0, 16]`, or `[0, 20]` for selected flight).
   * **Filter-Aware Header Live Counter**: The header's active flight counter reflects real-time remaining flights after filters are applied (e.g., `14 / 240 Active` or `14 Active`), accurately synchronized with the 3D route arcs counter.

12. **Dynamic Zoom-Dependent Label Density & Interactive OD Map Hover**:
   * **Dynamic Zoom-Dependent Plane Threshold**: Instead of a static ceiling, the maximum number of visible planes allowed for rendering flight IDs scales smoothly as the user zooms in or out:
     - Zoomed out ($\le 3.5$ continental): threshold reduces to ~35-50 planes to avoid dense overlapping walls of text.
     - Mid-range zoom (4.5 - 6.0): threshold expands from ~110 to ~240 planes.
     - High zoom ($\ge 7.0$ regional/metro): threshold increases up to ~350-500 planes, ensuring flight IDs remain clearly visible as aircraft physically spread apart on screen.
     - Active filters, selected flights, or hovered flights always display their IDs regardless of zoom level.
   * **2-Line Map Label on Hover (Flight ID + OD Pair)**:
     - Hovering over any aircraft dynamically reveals the **Origin $\rightarrow$ Destination (OD) pair** on a dedicated second line directly below the Flight ID on the map canvas (Line 1: Flight ID in yellow at `offset [0, 18]`, Line 2: `ORIG → DEST` in crisp white-slate at `offset [0, 36]`).
     - Both label lines and plane icons support click selection and hover hit-testing.
   * **Live API "Last Updated" Clock**: Prominently displayed in the top header toolbar with real-time poll and manual refresh timestamps.
   * **Airport Hub Filter (Origin OR Destination)**: Clicking any airport dot or label immediately filters all flights where that airport is either the origin or destination, accompanied by an interactive `Hub: <IATA>` filter badge.
   * **Cool Platinum Ice Airport Markers**: Replaced low-contrast grey with high-contrast, non-distracting Cool Platinum Ice dots (`[186, 200, 222, 225]`) with dark boundary rims and hover illumination.
   * **FlightMap Layer Architecture & Dedicated Assets**:
     - Decomposed `FlightMap.tsx` from 657 lines down to 322 lines by modularizing Deck.gl layers into independent pure generator functions in [`src/components/map/layers/`](file:///Users/jonathanlam/Workspace/FlightTracker/src/components/map/layers/): `RouteArcsLayer`, `AirportDotsLayer`, `AirportLabelsLayer`, `HighlightRingsLayer`, `AirplaneIconsLayer`, `FlightLabelsLayer`, and `FlightOdLabelsLayer`.
     - Centralized color constants across all layers into [`src/constants/palette.ts`](file:///Users/jonathanlam/Workspace/FlightTracker/src/constants/palette.ts).
     - Moved aircraft icon atlas asset to [`public/airplane.svg`](file:///Users/jonathanlam/Workspace/FlightTracker/public/airplane.svg).
   * **Unicode Rightwards Arrow in Map Canvas OD Badge**:
     - Fixed missing `→` arrow in Deck.gl's `TextLayer`. Deck.gl defaults `characterSet` to ASCII 32–128, which silently drops Unicode `→` (`\u2192` / code 8594).
     - Pre-baked `characterSet: [...Array.from({ length: 95 }, (_, i) => String.fromCharCode(32 + i)), '→']` directly into [`FlightOdLabelsLayer.ts`](file:///Users/jonathanlam/Workspace/FlightTracker/src/components/map/layers/FlightOdLabelsLayer.ts).
     - Specified fallback font families (`ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Segoe UI Symbol", "Apple Symbols", monospace`) and texture buffer settings to guarantee crisp rendering across all operating systems.

13. **Flight State & Altitude Color Filter**:
    * **Interactive Filter Component**: Added [`FlightStateFilter.tsx`](file:///Users/jonathanlam/Workspace/FlightTracker/src/components/header/FlightStateFilter.tsx) to [`FilterBar.tsx`](file:///Users/jonathanlam/Workspace/FlightTracker/src/components/header/FilterBar.tsx) with glowing color indicators matching the exact plane icon palette.
    * **Predefined Flight States & Colors**:
      - 🔵 **High Cruise** (`> 30,000 ft`) — Cyan (`#38bdf8`)
      - 🟣 **Mid Altitude** (`10,000 – 30,000 ft`) — Indigo (`#818cf8`)
      - 🟢 **Climb / Approach** (`≤ 10,000 ft`) — Emerald Green (`#34d399`)
      - ⚪ **On Ground** (`Taxi / Parked`) — Slate Gray (`#94a3b8`)
      - 🟡 **Pinned Flights** (`Watchlist`) — Amber (`#f59e0b`)
    * **Multi-Select & Single-Click Isolation**:
      - Click any state row to toggle inclusion.
      - Hover over any row to click "Only" for instant single-state isolation.
      - Dynamic active badge on the trigger button shows active color dots, state name, and matching aircraft count.
      - Quick clear `X` button and integration with the "Clear All" filter toolbar button.
14. **MapControls Streamlining & Hub Dividers**:
    * **Hub Bookmarks Divider**: Added vertical dividers (`h-3.5 w-px bg-slate-800`) between the quick Hub bookmarks (`All (NA) | JFK (NYC) | YYZ (Toronto)`).
    * **Compass Button Elimination**: Removed obsolete compass reset button and `onResetBearing` handlers from [`MapControls.tsx`](file:///Users/jonathanlam/Workspace/FlightTracker/src/components/map/MapControls.tsx) and [`App.tsx`](file:///Users/jonathanlam/Workspace/FlightTracker/src/App.tsx) since the map is locked to a 2D top-down view with rotation disabled.
    * **Airport Codes Toggle Tooltip**: Added an instant glass tooltip to the `MapPin` airport toggle button displaying live status dot (glowing Cyan when ON, Slate when OFF) and action label (`Hide Airport Codes (ON)` / `Show Airport Codes (OFF)`).
    * **FilterBar Simplification**: Removed redundant "Airport Codes" and "Airborne Only" buttons, as well as the redundant `Showing X / Y` count text (already prominently shown in the header), replacing it with a clean, standalone "Clear All" button when filters are active in [`FilterBar.tsx`](file:///Users/jonathanlam/Workspace/FlightTracker/src/components/header/FilterBar.tsx).
    * **Favicon Brand Icon Reuse**: Replaced generic Lucide `Plane` icon with [`public/favicon.svg`](file:///Users/jonathanlam/Workspace/FlightTracker/public/favicon.svg) in the top-left header brand badge in [`Header.tsx`](file:///Users/jonathanlam/Workspace/FlightTracker/src/components/header/Header.tsx), preserving the pulsing live status beacon.

15. **Airport Detail Drawer & Ground Flight Ingestion**:
    * **Airport Detail Sidebar ([`AirportDetailDrawer.tsx`](file:///Users/jonathanlam/Workspace/FlightTracker/src/components/sidebar/AirportDetailDrawer.tsx))**: Clicking any airport dot or label on the map opens a dedicated slide-out inspector showing:
      - Airport Name, IATA/ICAO codes, City, Country, Coordinates, and external Flightradar24 live board link.
      - **Operations Summary Grid**: Clickable tabs with live counters for **Inbound**, **Outbound**, and **On Ground / Taxiing** flights.
      - **Rich Flight Cards**: Explicitly displays all 4 required operational metrics for every flight entry:
        1. **Flight ID**: Prominently styled flight number (e.g. `DL1234`) with altitude/state radar color dot and optional callsign tag (`DAL1234`).
        2. **Origin $\rightarrow$ Destination**: High-contrast route pair with sky-to-emerald styling (e.g. `JFK → LAX`).
        3. **Airline**: Explicit commercial airline name (e.g. `Delta Air Lines`, `American Airlines`).
        4. **Timing Details**:
           - **Inbound flights**: Shows precise remaining time before touchdown (e.g. `Landing in 42m`) and estimated arrival time (`ETA 14:25`).
           - **Outbound flights**: Shows estimated time before departure for surface aircraft (e.g. `Departs in ~10m` with `Taxiing to runway` or `At gate / Boarding`), or elapsed time since takeoff for airborne flights (e.g. `Departed 35m ago` with `En route • FL360`).
      - Clicking any flight card inside the airport drawer transitions smoothly to the flight inspector for deep inspection.
      - **Hub Filter Toggle**: One-click button in the drawer header to toggle map filtering by that airport.
    * **Ground / Taxiing Flight Ingestion & Map Visibility Rules**:
      - Updated Flightradar24 API feed in [`flightApi.ts`](file:///Users/jonathanlam/Workspace/FlightTracker/src/api/flightApi.ts) to `gnd=1` (previously `gnd=0`), actively pulling real-time taxiing and grounded aircraft from live ADS-B receivers.
      - Added realistic taxiing mock flights at JFK, ORD, LAX, and YYZ in [`mockData.ts`](file:///Users/jonathanlam/Workspace/FlightTracker/src/api/mockData.ts) for offline/simulation testing.
      - **Default Map Cleanliness**: Ground/taxiing flights are filtered out from default map display ([`AirplaneIconsLayer.ts`](file:///Users/jonathanlam/Workspace/FlightTracker/src/components/map/layers/AirplaneIconsLayer.ts) and [`FlightLabelsLayer.ts`](file:///Users/jonathanlam/Workspace/FlightTracker/src/components/map/layers/FlightLabelsLayer.ts)) so runways/airports remain clutter-free.
16. **Destination Airport Local Time for ETA**:
    * **Timezone Architecture ([`src/utils/timezone.ts`](file:///Users/jonathanlam/Workspace/FlightTracker/src/utils/timezone.ts))**:
      - Created comprehensive mapping of 260+ North American and global commercial airports to their canonical IANA timezones (e.g. `America/New_York`, `America/Chicago`, `America/Denver`, `America/Phoenix`, `America/Los_Angeles`, `America/Anchorage`, `Pacific/Honolulu`, `Europe/London`, `Asia/Tokyo`, etc.).
      - Includes geographic bounding-box fallback logic based on country and coordinates for any dynamically encountered aerodromes.
    * **Destination-Aware ETA Display**:
      - In [`AirportDetailDrawer.tsx`](file:///Users/jonathanlam/Workspace/FlightTracker/src/components/sidebar/AirportDetailDrawer.tsx): Inbound flight cards now display ETA in the destination airport's local timezone with timezone abbreviation (e.g., `ETA 14:25 EDT` for JFK, `ETA 11:25 PDT` for LAX).
      - In [`FlightDetailDrawer.tsx`](file:///Users/jonathanlam/Workspace/FlightTracker/src/components/sidebar/FlightDetailDrawer.tsx): The "Estimated Arrival" card explicitly displays destination local time with airport tag and timezone code (e.g., `Est. Arrival (LAX Local): 14:25 PDT`).

17. **Ground & Outbound Flight List Alignment**:
    * **Proximity Guard on Ground Flights ([`AirportDetailDrawer.tsx`](file:///Users/jonathanlam/Workspace/FlightTracker/src/components/sidebar/AirportDetailDrawer.tsx))**:
      - Fixed disparity between "On Ground" and "Outbound" tabs where grounded flights at destination airports across the continent were being incorrectly matched to the origin airport based purely on flight plan IATA codes.
      - Enforced physical GPS proximity (`calculateDistanceNm < 25 nm`) across both `groundFlights` and `outboundFlights`, ensuring only aircraft physically present at the airport are listed, keeping both lists strictly consistent.

18. **Flight State Filter Refinement & Airport View Filter Synchronization**:
    * **Removed "On Ground" from Flight State Filter**:
      - Since surface / grounded flights are not rendered as default airborne radar plane icons on the map, `'on_ground'` was removed from the `FlightState` type union ([`src/types/flight.ts`](file:///Users/jonathanlam/Workspace/FlightTracker/src/types/flight.ts)) and [`FLIGHT_STATE_CONFIGS`](file:///Users/jonathanlam/Workspace/FlightTracker/src/constants/flightStates.ts).
      - [`FlightStateFilter.tsx`](file:///Users/jonathanlam/Workspace/FlightTracker/src/components/header/FlightStateFilter.tsx) now focuses cleanly on airborne altitude states (High Cruise, Mid Altitude, Climb/Approach) and Pinned Watchlist.
    * **Contextual Filter Disabling in Airport View**:
      - When an airport is selected and the Airport Drawer is open (`isAirportViewOpen`), the **Flight State**, **Origin**, and **Destination** filters in [`FilterBar.tsx`](file:///Users/jonathanlam/Workspace/FlightTracker/src/components/header/FilterBar.tsx) are disabled with `opacity-40 cursor-not-allowed` styles and explanatory tooltips to prevent conflicting or illogical route queries.
      - Opening an airport view automatically clears any stale origin, destination, or flight state filters while preserving the search query and airline selections.
    * **Airport Flight List Filter Integration ([`AirportDetailDrawer.tsx`](file:///Users/jonathanlam/Workspace/FlightTracker/src/components/sidebar/AirportDetailDrawer.tsx))**:
      - The active **Flight ID / Callsign** search query and **Airline** dropdown in `FilterBar` now actively filter the airport's **Inbound**, **Outbound**, and **On Ground** flight lists and their summary card counters in real time.
      - Added an active filter banner in the drawer header displaying the active search/airline criteria with a one-click "Clear" button.
      - Enhanced the empty state when flights are filtered out to guide the user with a direct "Clear filters" action.
    * **Hub Filter Auto-Clear on Sidebar Close**:
      - Closing the airport sidebar (via the `X` button, pressing the `Escape` key, or clicking a flight card to inspect) now automatically resets the active hub filter (`airportCode: undefined`), returning the radar map to global/regional traffic without requiring manual filter reset.

19. **Airport Bookmarking with Cookie Persistence**:
    * Added airport bookmarking button to [`AirportDetailDrawer.tsx`](file:///Users/jonathanlam/Workspace/FlightTracker/src/components/sidebar/AirportDetailDrawer.tsx).
    * Bookmarked airports dynamically sync to [`MapControls.tsx`](file:///Users/jonathanlam/Workspace/FlightTracker/src/components/map/MapControls.tsx), allowing one-click camera jumps to saved hubs alongside the default `All (NA)` option.
    * Saved bookmarks are persisted across browser sessions in cookies.

20. **Searchable Grounded/Taxiing Aircraft**:
    * When searching by Flight ID or Callsign, grounded/taxiing aircraft matching the query are rendered on the map with airplane icons and flight labels, rather than being hidden by default.

21. **Pinned-Only Filter**:
    * Added a dedicated "Pinned Only" filter button in [`FilterBar.tsx`](file:///Users/jonathanlam/Workspace/FlightTracker/src/components/header/FilterBar.tsx) to isolate flights saved to the user's watchlist on the radar map.

22. **Dual-Domain Deployment & Serverless Edge Ingestion**:
    * Configured relative base path (`base: './'`) in [`vite.config.ts`](file:///Users/jonathanlam/Workspace/FlightTracker/vite.config.ts) and trailing-slash enforcement in [`index.html`](file:///Users/jonathanlam/Workspace/FlightTracker/index.html) to support deployment both to standalone domains (Vercel) and routed subdirectories (`/flighttracker/`).
    * Implemented Vercel Edge functions in [`api/fr24.ts`](file:///Users/jonathanlam/Workspace/FlightTracker/api/fr24.ts) and [`api/opensky.ts`](file:///Users/jonathanlam/Workspace/FlightTracker/api/opensky.ts) with open CORS headers and browser header spoofing, enabling live radar telemetry in production environments.

---

## 4. Current Status
* Application is live and running on `http://localhost:5173/`.
* 0 type errors, 0 build errors, 0 lint errors.


