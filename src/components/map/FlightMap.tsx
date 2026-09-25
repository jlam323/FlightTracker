import React, { useMemo, useState } from 'react'
import DeckGL from '@deck.gl/react'
import { WebMercatorViewport } from '@deck.gl/core'
import { ArcLayer, IconLayer, ScatterplotLayer, TextLayer } from '@deck.gl/layers'
import Map from 'react-map-gl/maplibre'
import * as maplibregl from 'maplibre-gl'
import type { StyleSpecification } from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import { Flight, FlightArc, Airport } from '../../types/flight'
import { ALL_AIRPORTS } from '../../data/airports'

// Crisp radar airplane silhouette pointing directly North (heading 0)
const AIRPLANE_ICON_SVG = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64" fill="white">
  <path d="M32 4 L38 22 L56 32 L56 36 L38 30 L38 48 L46 54 L46 58 L32 54 L18 58 L18 54 L26 48 L26 30 L8 36 L8 32 L26 22 Z"/>
</svg>
`)}`

const AIRPLANE_ICON_MAPPING = {
  airplane: {
    x: 0,
    y: 0,
    width: 64,
    height: 64,
    anchorX: 32,
    anchorY: 32,
    mask: true,
  },
}

// Major international hubs displayed by default on map load
const MAJOR_HUB_IATAS = new Set([
  'ATL', 'LAX', 'ORD', 'DFW', 'DEN', 'JFK', 'SFO', 'SEA', 'LAS', 'MCO',
  'EWR', 'CLT', 'PHX', 'IAH', 'MIA', 'BOS', 'MSP', 'DTW', 'FLL', 'PHL',
  'LGA', 'BWI', 'SLC', 'SAN', 'IAD', 'DCA', 'MDW', 'TPA', 'PDX', 'HNL',
  'ANC', 'AUS', 'BNA', 'STL', 'YYZ', 'YVR', 'YUL', 'YYC', 'LHR', 'CDG',
  'FRA', 'AMS', 'HND', 'NRT', 'MEX', 'CUN',
])

const CARTO_API_KEY = import.meta.env.VITE_CARTO_API_KEY || ''
const apiKeyParam = CARTO_API_KEY ? `?key=${CARTO_API_KEY}` : ''

// High-performance dark command-center raster basemap
// Uses authenticated CARTO tiles when VITE_CARTO_API_KEY is configured
const CARTO_DARK_RASTER_STYLE: StyleSpecification = {
  version: 8,
  sources: {
    'carto-dark': {
      type: 'raster',
      tiles: [
        `https://a.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}@2x.png${apiKeyParam}`,
        `https://b.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}@2x.png${apiKeyParam}`,
        `https://c.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}@2x.png${apiKeyParam}`,
        `https://d.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}@2x.png${apiKeyParam}`,
      ],
      tileSize: 256,
      attribution:
        '&copy; <a href="https://carto.com/">CARTO</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    },
  },
  layers: [
    {
      id: 'carto-dark-layer',
      type: 'raster',
      source: 'carto-dark',
      minzoom: 0,
      maxzoom: 20,
    },
  ],
}

interface FlightMapProps {
  flights: Flight[]
  arcs: FlightArc[]
  selectedFlightId?: string
  selectedAirportCode?: string
  pinnedFlightIds: string[]
  onSelectFlight: (flight: Flight) => void
  onSelectAirport?: (airport: Airport) => void
  viewState: {
    longitude: number
    latitude: number
    zoom: number
    pitch: number
    bearing: number
  }
  onViewStateChange: (viewState: any) => void
  showAirportCodes?: boolean
  hasActiveFilter?: boolean
}

export const FlightMap: React.FC<FlightMapProps> = ({
  flights,
  arcs,
  selectedFlightId,
  selectedAirportCode,
  pinnedFlightIds,
  onSelectFlight,
  onSelectAirport,
  viewState,
  onViewStateChange,
  showAirportCodes = true,
  hasActiveFilter = false,
}) => {
  const pinnedSet = useMemo(() => new Set(pinnedFlightIds), [pinnedFlightIds])
  const [hoveredFlightId, setHoveredFlightId] = useState<string | null>(null)
  const [hoveredAirportIata, setHoveredAirportIata] = useState<string | null>(null)

  // Calculate count of aircraft currently visible in the active viewport
  const visibleFlightCount = useMemo(() => {
    try {
      const width = typeof window !== 'undefined' ? window.innerWidth : 1200
      const height = typeof window !== 'undefined' ? window.innerHeight : 800
      const vp = new WebMercatorViewport({
        width,
        height,
        longitude: viewState.longitude,
        latitude: viewState.latitude,
        zoom: viewState.zoom,
        pitch: 0,
        bearing: viewState.bearing || 0,
      })
      const [minLon, minLat, maxLon, maxLat] = vp.getBounds()

      let count = 0
      for (const f of flights) {
        const inLon = minLon <= maxLon
          ? (f.longitude >= minLon && f.longitude <= maxLon)
          : (f.longitude >= minLon || f.longitude <= maxLon)
        if (inLon && f.latitude >= minLat && f.latitude <= maxLat) {
          count++
        }
      }
      return count
    } catch {
      return flights.length
    }
  }, [flights, viewState.longitude, viewState.latitude, viewState.zoom, viewState.bearing])

  // Threshold: If 200 or fewer airplanes are visible on screen, or if a filter is active, show flight IDs
  const isLowAirplaneDensity = visibleFlightCount <= 200
  const shouldShowFlightLabels = hasActiveFilter || isLowAirplaneDensity

  // Resolve currently selected flight & its origin/dest airports
  const selectedFlight = useMemo(() => {
    if (!selectedFlightId) return null
    return flights.find(f => f.id === selectedFlightId) || null
  }, [flights, selectedFlightId])

  const selectedAirportIatas = useMemo(() => {
    const set = new Set<string>()
    if (selectedAirportCode) set.add(selectedAirportCode.toUpperCase())
    if (selectedFlight?.originIata) set.add(selectedFlight.originIata.toUpperCase())
    if (selectedFlight?.destIata) set.add(selectedFlight.destIata.toUpperCase())
    return set
  }, [selectedFlight, selectedAirportCode])

  // Sort arcs so selected flight's arc is rendered last (on top of all other arcs)
  const sortedArcs = useMemo(() => {
    if (!selectedFlightId) return arcs
    return [...arcs].sort((a, b) => {
      if (a.flightId === selectedFlightId) return 1
      if (b.flightId === selectedFlightId) return -1
      return 0
    })
  }, [arcs, selectedFlightId])

  // 1. Great-Circle Route Arcs (Origin Airport -> Destination Airport)
  const arcLayers = useMemo(() => {
    const routeLayer = new ArcLayer<FlightArc>({
      id: 'arcs-routes',
      data: sortedArcs,
      getSourcePosition: d => d.source,
      getTargetPosition: d => d.target,
      greatCircle: true,
      getHeight: 0,
      getSourceColor: d => (d.flightId === selectedFlightId ? [56, 189, 248, 255] : [56, 189, 248, 35]),
      getTargetColor: d => (d.flightId === selectedFlightId ? [244, 63, 94, 255] : [244, 63, 94, 45]),
      getWidth: d => (d.flightId === selectedFlightId ? 3.5 : 1.2),
      pickable: false,
      parameters: { depthCompare: 'always' as const, depthWriteEnabled: false },
      updateTriggers: {
        getSourceColor: [selectedFlightId],
        getTargetColor: [selectedFlightId],
        getWidth: [selectedFlightId],
      },
    })

    return [routeLayer]
  }, [sortedArcs, selectedFlightId])

  // 2. Airport Dots Layer (Small dots representing airports)
  const airportLayer = useMemo(() => {
    return new ScatterplotLayer<Airport>({
      id: 'airports-dots',
      data: ALL_AIRPORTS,
      getPosition: d => [d.longitude, d.latitude, 0],
      getRadius: d => {
        if (selectedAirportCode && d.iata === selectedAirportCode.toUpperCase()) return 16000
        if (selectedAirportIatas.has(d.iata)) return 14000
        if (d.iata === hoveredAirportIata) return 9000
        return 4500
      },
      getFillColor: d => {
        if (d.iata === hoveredAirportIata) return [250, 204, 21, 255]       // Hovered: Yellow
        if (selectedAirportCode && d.iata === selectedAirportCode.toUpperCase()) return [56, 189, 248, 255] // Active Hub: Bright Cyan
        if (d.iata === selectedFlight?.originIata) return [56, 189, 248, 255] // Origin: Bright Cyan
        if (d.iata === selectedFlight?.destIata) return [244, 63, 94, 255]   // Dest: Bright Rose
        return [186, 200, 222, 225] // Cool Platinum Ice: crisp & clearly visible on dark basemap without being obtrusive
      },
      getLineColor: d => {
        if (
          d.iata === hoveredAirportIata ||
          (selectedAirportCode && d.iata === selectedAirportCode.toUpperCase()) ||
          selectedAirportIatas.has(d.iata)
        ) {
          return [255, 255, 255, 255]
        }
        return [15, 23, 42, 240] // Crisp dark slate-950 edge
      },
      lineWidthMinPixels: 1.2,
      stroked: true,
      radiusMinPixels: 3.5,
      radiusMaxPixels: 11,
      pickable: true,
      parameters: { depthCompare: 'always' as const, depthWriteEnabled: false },
      onClick: info => {
        if (info.object && onSelectAirport) {
          onSelectAirport(info.object as Airport)
        }
      },
      onHover: info => {
        if (info.object && (info.object as Airport).iata) {
          setHoveredAirportIata((info.object as Airport).iata)
        } else {
          setHoveredAirportIata(null)
        }
      },
      updateTriggers: {
        getRadius: [selectedAirportIatas, selectedAirportCode, hoveredAirportIata],
        getFillColor: [selectedFlight?.originIata, selectedFlight?.destIata, selectedAirportCode, hoveredAirportIata],
        getLineColor: [selectedAirportIatas, selectedAirportCode, hoveredAirportIata],
      },
    })
  }, [selectedAirportIatas, selectedAirportCode, selectedFlight, hoveredAirportIata, onSelectAirport])

  // 3. Airport IATA Text Labels (Configurable via showAirportCodes; major hubs visible by default)
  const airportLabelLayer = useMemo(() => {
    if (!showAirportCodes) {
      // If toggled off, only display labels for selected flight's endpoints or active hub filter
      if (selectedAirportIatas.size === 0) return null
      const selectedAirports = ALL_AIRPORTS.filter(a => selectedAirportIatas.has(a.iata))

      return new TextLayer<Airport>({
        id: 'airports-labels',
        data: selectedAirports,
        getPosition: d => [d.longitude, d.latitude, 0],
        getText: d => d.iata,
        getSize: 12,
        getColor: d => {
          if (d.iata === hoveredAirportIata) return [250, 204, 21, 255]
          if (selectedAirportCode && d.iata === selectedAirportCode.toUpperCase()) return [56, 189, 248, 255]
          if (d.iata === selectedFlight?.originIata) return [56, 189, 248, 255]
          if (d.iata === selectedFlight?.destIata) return [244, 63, 94, 255]
          return [226, 232, 240, 240]
        },
        getTextAnchor: 'middle',
        getAlignmentBaseline: 'top',
        getPixelOffset: [0, 8],
        fontFamily: 'monospace',
        fontWeight: 'bold',
        background: true,
        getBackgroundColor: [15, 23, 42, 200],
        backgroundPadding: [3, 1],
        pickable: true,
        onClick: info => {
          if (info.object && onSelectAirport) {
            onSelectAirport(info.object as Airport)
          }
        },
        onHover: info => {
          if (info.object && (info.object as Airport).iata) {
            setHoveredAirportIata((info.object as Airport).iata)
          } else {
            setHoveredAirportIata(null)
          }
        },
        parameters: { depthCompare: 'always' as const, depthWriteEnabled: false },
        updateTriggers: {
          getColor: [selectedFlight?.originIata, selectedFlight?.destIata, selectedAirportCode, hoveredAirportIata],
        },
      })
    }

    // When showAirportCodes is true:
    // - Always show major hubs & selected flight endpoints & active airport filter
    // - At zoom >= 4.8: show top regional hubs (US, CA)
    // - At zoom >= 6.0: show all airports
    const visibleAirports = ALL_AIRPORTS.filter(a => {
      if (selectedAirportIatas.has(a.iata)) return true
      if (MAJOR_HUB_IATAS.has(a.iata)) return true
      if (viewState.zoom >= 6.0) return true
      if (viewState.zoom >= 4.8 && (a.country === 'US' || a.country === 'CA')) return true
      return false
    })

    if (visibleAirports.length === 0) return null

    return new TextLayer<Airport>({
      id: 'airports-labels',
      data: visibleAirports,
      getPosition: d => [d.longitude, d.latitude, 0],
      getText: d => d.iata,
      getSize: d => (selectedAirportIatas.has(d.iata) ? 12 : 10),
      getColor: d => {
        if (d.iata === hoveredAirportIata) return [250, 204, 21, 255]
        if (selectedAirportCode && d.iata === selectedAirportCode.toUpperCase()) return [56, 189, 248, 255]
        if (d.iata === selectedFlight?.originIata) return [56, 189, 248, 255]
        if (d.iata === selectedFlight?.destIata) return [244, 63, 94, 255]
        return [226, 232, 240, 220]
      },
      getTextAnchor: 'middle',
      getAlignmentBaseline: 'top',
      getPixelOffset: [0, 8],
      fontFamily: 'monospace',
      fontWeight: 'bold',
      background: true,
      getBackgroundColor: [15, 23, 42, 190],
      backgroundPadding: [3, 1],
      pickable: true,
      onClick: info => {
        if (info.object && onSelectAirport) {
          onSelectAirport(info.object as Airport)
        }
      },
      onHover: info => {
        if (info.object && (info.object as Airport).iata) {
          setHoveredAirportIata((info.object as Airport).iata)
        } else {
          setHoveredAirportIata(null)
        }
      },
      parameters: { depthCompare: 'always' as const, depthWriteEnabled: false },
      updateTriggers: {
        getSize: [selectedAirportIatas, selectedAirportCode],
        getColor: [selectedFlight?.originIata, selectedFlight?.destIata, selectedAirportCode, hoveredAirportIata],
      },
    })
  }, [showAirportCodes, viewState.zoom, selectedAirportIatas, selectedFlight, selectedAirportCode, hoveredAirportIata, onSelectAirport])

  // 4. Selection & Pinning Highlight Rings
  const highlightRingLayer = useMemo(() => {
    const highlightedFlights = flights.filter(f => f.id === selectedFlightId || pinnedSet.has(f.id))
    if (highlightedFlights.length === 0) return null

    return new ScatterplotLayer<Flight>({
      id: 'flights-selection-rings',
      data: highlightedFlights,
      getPosition: d => [d.longitude, d.latitude, 0],
      getRadius: d => (d.id === selectedFlightId ? 16000 : 12000),
      getFillColor: d => (d.id === selectedFlightId ? [250, 204, 21, 50] : [245, 158, 11, 35]),
      getLineColor: d => (d.id === selectedFlightId ? [250, 204, 21, 240] : [245, 158, 11, 200]),
      lineWidthMinPixels: 2,
      stroked: true,
      filled: true,
      radiusMinPixels: 18,
      radiusMaxPixels: 38,
      pickable: false,
      parameters: { depthCompare: 'always' as const, depthWriteEnabled: false },
    })
  }, [flights, selectedFlightId, pinnedSet])

  // Sort flights so selected / pinned flights are rendered last (on top of other aircraft icons)
  const sortedFlights = useMemo(() => {
    if (!selectedFlightId && pinnedFlightIds.length === 0) return flights
    return [...flights].sort((a, b) => {
      const aPriority = a.id === selectedFlightId ? 2 : pinnedSet.has(a.id) ? 1 : 0
      const bPriority = b.id === selectedFlightId ? 2 : pinnedSet.has(b.id) ? 1 : 0
      return aPriority - bPriority
    })
  }, [flights, selectedFlightId, pinnedFlightIds, pinnedSet])

  // 5. Airplane Icon Layer (Hardware-accelerated icons oriented with real-time heading)
  const airplaneIconLayer = useMemo(() => {
    return new IconLayer<Flight>({
      id: 'flights-aircraft-icons',
      data: sortedFlights,
      iconAtlas: AIRPLANE_ICON_SVG,
      iconMapping: AIRPLANE_ICON_MAPPING,
      getIcon: () => 'airplane',
      getPosition: d => [d.longitude, d.latitude, 0],
      getSize: d => {
        if (d.id === selectedFlightId) return 34
        if (d.id === hoveredFlightId) return 28
        if (pinnedSet.has(d.id)) return 28
        return 24
      },
      sizeUnits: 'pixels',
      sizeMinPixels: 18,
      sizeMaxPixels: 46,
      getAngle: d => (360 - d.heading + viewState.bearing) % 360,
      getColor: d => {
        if (d.id === selectedFlightId || d.id === hoveredFlightId) return [250, 204, 21, 255] // Yellow highlighted & hovered
        if (pinnedSet.has(d.id)) return [245, 158, 11, 255]       // Amber pinned
        if (d.onGround) return [148, 163, 184, 220]               // Slate ground
        if (d.altitude > 30000) return [56, 189, 248, 255]       // Cyan cruise
        if (d.altitude > 10000) return [129, 140, 248, 255]      // Indigo mid
        return [52, 211, 153, 255]                               // Emerald climb/approach
      },
      pickable: true,
      parameters: { depthCompare: 'always' as const, depthWriteEnabled: false },
      onClick: info => {
        if (info.object) {
          onSelectFlight(info.object as Flight)
        }
      },
      onHover: info => {
        if (info.object && (info.object as Flight).id) {
          setHoveredFlightId((info.object as Flight).id)
        } else {
          setHoveredFlightId(null)
        }
      },
      updateTriggers: {
        getSize: [selectedFlightId, pinnedFlightIds, hoveredFlightId],
        getColor: [selectedFlightId, pinnedFlightIds, hoveredFlightId],
        getAngle: [viewState.bearing],
      },
    })
  }, [sortedFlights, selectedFlightId, hoveredFlightId, pinnedFlightIds, onSelectFlight, pinnedSet, viewState.bearing])

  // 6. Flight Label Layer (Flight IDs shown UNDER plane icons; shown if filtered, density <= 25 planes, or flight is selected/hovered/pinned)
  const textLayer = useMemo(() => {
    const labelFlights = sortedFlights.filter(f => {
      if (shouldShowFlightLabels) return true
      if (f.id === selectedFlightId || f.id === hoveredFlightId || pinnedSet.has(f.id)) return true
      return false
    })

    if (labelFlights.length === 0) return null

    return new TextLayer<Flight>({
      id: 'flights-labels',
      data: labelFlights,
      getPosition: d => [d.longitude, d.latitude, 0],
      getText: d => d.flightNumber,
      getSize: 11,
      getColor: d => {
        if (d.id === selectedFlightId || d.id === hoveredFlightId) return [250, 204, 21, 255]
        return [243, 244, 246, 230]
      },
      getTextAnchor: 'middle',
      getAlignmentBaseline: 'top',
      getPixelOffset: d => (d.id === selectedFlightId ? [0, 20] : [0, 16]),
      fontFamily: 'monospace',
      fontWeight: 'bold',
      background: true,
      getBackgroundColor: [15, 23, 42, 210],
      backgroundPadding: [4, 2],
      parameters: { depthCompare: 'always' as const, depthWriteEnabled: false },
      updateTriggers: {
        getColor: [selectedFlightId, hoveredFlightId],
        getPixelOffset: [selectedFlightId],
      },
    })
  }, [sortedFlights, shouldShowFlightLabels, selectedFlightId, hoveredFlightId, pinnedSet])

  const layers = useMemo(() => {
    return [
      ...arcLayers,
      airportLayer,
      ...(airportLabelLayer ? [airportLabelLayer] : []),
      ...(highlightRingLayer ? [highlightRingLayer] : []),
      airplaneIconLayer,
      ...(textLayer ? [textLayer] : []),
    ]
  }, [arcLayers, airportLayer, airportLabelLayer, highlightRingLayer, airplaneIconLayer, textLayer])

  // Attach CARTO API key to any Carto map request that needs authentication
  const transformRequest = useMemo(() => {
    return (url: string) => {
      if (CARTO_API_KEY && url.includes('cartocdn.com') && !url.includes('key=')) {
        const delimiter = url.includes('?') ? '&' : '?'
        return {
          url: `${url}${delimiter}key=${CARTO_API_KEY}`,
        }
      }
      return { url }
    }
  }, [])

  return (
    <div className="relative w-full h-full">
      <DeckGL
        viewState={viewState}
        onViewStateChange={e => onViewStateChange(e.viewState)}
        controller={{ doubleClickZoom: false, dragRotate: false }}
        layers={layers}
        pickingRadius={10}
        getCursor={({ isHovering, isDragging }) => {
          if (isDragging) return 'grabbing'
          if (isHovering) return 'pointer'
          return 'default'
        }}
        getTooltip={({ object }: any) => {
          if (!object) return null

          // Hovering an Airport
          if ('iata' in object && 'city' in object) {
            const a = object as Airport
            return {
              html: `
                <div style="font-family: ui-monospace, monospace; font-size: 11px; padding: 5px 8px; background: rgba(15, 23, 42, 0.95); border: 1px solid rgba(56, 189, 248, 0.5); border-radius: 6px; color: #f8fafc; box-shadow: 0 4px 14px rgba(0, 0, 0, 0.6);">
                  <div style="font-weight: bold; color: #38bdf8; font-size: 12px;">✈ ${a.iata} - ${a.name}</div>
                  <div style="color: #94a3b8; font-size: 10px;">${a.city}, ${a.country} (${a.icao})</div>
                  <div style="color: #38bdf8; font-size: 10px; margin-top: 3px; font-weight: 600;">Click to filter flights</div>
                </div>
              `,
            }
          }

          // Hovering a Flight: 2-line clean card showing Flight ID and Origin -> Destination
          if (object.flightNumber) {
            const f = object as Flight
            const originStr = f.originIata || '---'
            const destStr = f.destIata || '---'
            return {
              html: `
                <div style="font-family: ui-monospace, monospace; font-size: 11px; line-height: 1.4; padding: 5px 8px; background: rgba(15, 23, 42, 0.95); border: 1px solid rgba(250, 204, 21, 0.6); border-radius: 6px; color: #f8fafc; box-shadow: 0 4px 14px rgba(0, 0, 0, 0.6);">
                  <div style="font-weight: 700; color: #facc15; font-size: 12px; letter-spacing: 0.02em;">${f.flightNumber}</div>
                  <div style="color: #e2e8f0; font-weight: 500;">${originStr} → ${destStr}</div>
                </div>
              `,
            }
          }
          return null
        }}
      >
        <Map
          mapLib={maplibregl}
          mapStyle={CARTO_DARK_RASTER_STYLE}
          transformRequest={transformRequest}
          attributionControl={false}
          maxPitch={0}
        />
      </DeckGL>
    </div>
  )
}
