import React, { useMemo, useState, useCallback } from 'react'
import DeckGL from '@deck.gl/react'
import { WebMercatorViewport } from '@deck.gl/core'
import Map from 'react-map-gl/maplibre'
import * as maplibregl from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import { Flight, FlightArc, Airport, MapTheme } from '../../types/flight'
import { ALL_AIRPORTS } from '../../data/airports'
import { CARTO_DARK_RASTER_STYLE, CARTO_LIGHT_RASTER_STYLE, CARTO_API_KEY } from './mapConstants'
import {
  createCountryBordersLayer,
  createRouteArcsLayer,
  createAirportDotsLayer,
  createAirportLabelsLayer,
  createHighlightRingsLayer,
  createAirplaneIconsLayer,
  createFlightLabelsLayer,
  createFlightOdLabelsLayer,
  getFlightPosition,
  createFlightSearchMatcher,
  shouldRenderFlight,
  getFlightOdText,
} from './layers'

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
    minZoom?: number
    maxZoom?: number
  }
  onViewStateChange: (viewState: any) => void
  showAirportCodes?: boolean
  searchQuery?: string
  mapTheme?: MapTheme
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
  searchQuery,
  mapTheme = 'dark',
}) => {
  const pinnedSet = useMemo(() => new Set(pinnedFlightIds), [pinnedFlightIds])
  const [hoveredFlightId, setHoveredFlightId] = useState<string | null>(null)
  const [hoveredAirportIata, setHoveredAirportIata] = useState<string | null>(null)

  // Calculate count of aircraft currently visible in active viewport
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
      const isSearchMatch = createFlightSearchMatcher(searchQuery)

      let count = 0
      for (const f of flights) {
        if (!shouldRenderFlight(f, selectedFlightId, pinnedSet, isSearchMatch)) continue

        const [lon, lat] = getFlightPosition(f)

        let isVisible = false
        for (const offset of [0, -360, 360]) {
          try {
            const [px, py] = vp.project([lon + offset, lat])
            if (px >= 0 && px <= width && py >= 0 && py <= height) {
              isVisible = true
              break
            }
          } catch {}
        }

        if (isVisible) {
          count++
        }
      }
      return count
    } catch {
      return flights.length
    }
  }, [flights, selectedFlightId, pinnedSet, searchQuery, viewState.longitude, viewState.latitude, viewState.zoom, viewState.bearing])

  // Dynamically scale max aircraft allowed for displaying flight IDs with zoom level
  const maxPlanesForLabels = useMemo(() => {
    // Clamped between min zoom 1.5 (global) and high zoom 9.0
    const clampedZoom = Math.max(1.5, Math.min(9.0, viewState.zoom))
    const t = (clampedZoom - 1.5) / 7.5
    // Global starts at 35 planes, scaling up to 800 planes at high zoom
    return Math.round(35 + Math.pow(t, 1.4) * 765)
  }, [viewState.zoom])

  const isLowAirplaneDensity = visibleFlightCount > 0 && visibleFlightCount <= maxPlanesForLabels
  const shouldShowFlightLabels = isLowAirplaneDensity

  // Resolve currently selected flight & origin/dest/hub airports
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

  // Sort arcs so selected flight's arc is rendered on top
  const sortedArcs = useMemo(() => {
    if (!selectedFlightId) return arcs
    return [...arcs].sort((a, b) => {
      if (a.flightId === selectedFlightId) return 1
      if (b.flightId === selectedFlightId) return -1
      return 0
    })
  }, [arcs, selectedFlightId])

  // Sort flights so selected / pinned flights render on top of other icons
  const sortedFlights = useMemo(() => {
    if (!selectedFlightId && pinnedFlightIds.length === 0) return flights
    return [...flights].sort((a, b) => {
      const aPriority = a.id === selectedFlightId ? 2 : pinnedSet.has(a.id) ? 1 : 0
      const bPriority = b.id === selectedFlightId ? 2 : pinnedSet.has(b.id) ? 1 : 0
      return aPriority - bPriority
    })
  }, [flights, selectedFlightId, pinnedFlightIds, pinnedSet])

  // Extend flights and airports so transpacific flights render continuously
  // across the antimeridian without abrupt vanishing
  const renderedFlights = useMemo(() => {
    const list: Flight[] = []
    for (const f of sortedFlights) {
      list.push(f)
      if (f.longitude > 90) {
        list.push({ ...f, longitude: f.longitude - 360 })
      } else if (f.longitude < -90) {
        list.push({ ...f, longitude: f.longitude + 360 })
      }
    }
    return list
  }, [sortedFlights])

  const renderedAirports = useMemo(() => {
    const list: Airport[] = []
    for (const a of ALL_AIRPORTS) {
      list.push(a)
      if (a.longitude > 90) {
        list.push({ ...a, longitude: a.longitude - 360 })
      } else if (a.longitude < -90) {
        list.push({ ...a, longitude: a.longitude + 360 })
      }
    }
    return list
  }, [])

  // Shared interaction handlers
  const handleFlightClick = useCallback(
    (info: { object?: unknown }) => {
      if (info.object && onSelectFlight) {
        onSelectFlight(info.object as Flight)
      }
    },
    [onSelectFlight]
  )

  const handleFlightHover = useCallback((info: { object?: unknown }) => {
    const flight = info.object as Flight | undefined
    setHoveredFlightId(flight?.id || null)
  }, [])

  const handleAirportClick = useCallback(
    (info: { object?: unknown }) => {
      if (info.object && onSelectAirport) {
        onSelectAirport(info.object as Airport)
      }
    },
    [onSelectAirport]
  )

  const handleAirportHover = useCallback((info: { object?: unknown }) => {
    const airport = info.object as Airport | undefined
    setHoveredAirportIata(airport?.iata || null)
  }, [])

  // Stack all map layers
  const layers = useMemo(() => {
    const bordersLayer = createCountryBordersLayer()

    const arcLayers = createRouteArcsLayer({
      arcs: sortedArcs,
      selectedFlightId,
    })

    const airportDotsLayer = createAirportDotsLayer({
      airports: renderedAirports,
      selectedAirportCode,
      selectedAirportIatas,
      hoveredAirportIata,
      selectedFlight,
      zoom: viewState.zoom,
      onClickAirport: handleAirportClick,
      onHoverAirport: handleAirportHover,
    })

    const airportLabelsLayer = createAirportLabelsLayer({
      airports: renderedAirports,
      showAirportCodes,
      zoom: viewState.zoom,
      selectedAirportCode,
      selectedAirportIatas,
      hoveredAirportIata,
      selectedFlight,
      onClickAirport: handleAirportClick,
      onHoverAirport: handleAirportHover,
    })

    const highlightRingLayer = createHighlightRingsLayer({
      flights: renderedFlights,
      selectedFlightId,
      pinnedSet,
      searchQuery,
    })

    const airplaneIconLayer = createAirplaneIconsLayer({
      flights: renderedFlights,
      selectedFlightId,
      hoveredFlightId,
      pinnedSet,
      bearing: viewState.bearing,
      searchQuery,
      onClickFlight: handleFlightClick,
      onHoverFlight: handleFlightHover,
    })

    const textLayer = createFlightLabelsLayer({
      flights: renderedFlights,
      shouldShowFlightLabels,
      selectedFlightId,
      hoveredFlightId,
      pinnedSet,
      searchQuery,
      onClickFlight: handleFlightClick,
      onHoverFlight: handleFlightHover,
    })

    const flightOdLayer = createFlightOdLabelsLayer({
      flights: renderedFlights,
      selectedFlightId,
      hoveredFlightId,
      onClickFlight: handleFlightClick,
      onHoverFlight: handleFlightHover,
    })

    return [
      bordersLayer,
      ...arcLayers,
      airportDotsLayer,
      ...(highlightRingLayer ? [highlightRingLayer] : []),
      airplaneIconLayer,
      ...(textLayer ? [textLayer] : []),
      ...(airportLabelsLayer ? [airportLabelsLayer] : []),
      ...(flightOdLayer ? [flightOdLayer] : []),
    ]
  }, [
    sortedArcs,
    selectedFlightId,
    renderedAirports,
    selectedAirportCode,
    selectedAirportIatas,
    hoveredAirportIata,
    selectedFlight,
    showAirportCodes,
    viewState.zoom,
    viewState.bearing,
    pinnedSet,
    renderedFlights,
    hoveredFlightId,
    shouldShowFlightLabels,
    searchQuery,
    handleAirportClick,
    handleAirportHover,
    handleFlightClick,
    handleFlightHover,
  ])

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
    <div className={`relative w-full h-full ${mapTheme === 'light' ? 'bg-[#f1f5f9]' : 'bg-slate-950'}`}>
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
                <div style="font-family: ui-monospace, monospace; font-size: 11px; padding: 5px 8px; background: rgba(15, 23, 42, 0.95); border: 1px solid rgba(56, 189, 248, 0.5); border-radius: 6px; box-shadow: 0 4px 14px rgba(0, 0, 0, 0.6);">
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
            const odText = getFlightOdText(f) || '--- → ---'
            return {
              html: `
                <div style="font-family: ui-monospace, monospace; font-size: 11px; line-height: 1.4; padding: 5px 8px; background: rgba(15, 23, 42, 0.95); border: 1px solid rgba(250, 204, 21, 0.6); border-radius: 6px; box-shadow: 0 4px 14px rgba(0, 0, 0, 0.6);">
                  <div style="font-weight: 700; color: #facc15; font-size: 12px; letter-spacing: 0.02em;">${f.flightNumber}</div>
                  <div style="color: #e2e8f0; font-weight: 500;">${odText}</div>
                </div>
              `,
            }
          }
          return null
        }}
      >
        <Map
          mapLib={maplibregl}
          mapStyle={mapTheme === 'light' ? CARTO_LIGHT_RASTER_STYLE : CARTO_DARK_RASTER_STYLE}
          transformRequest={transformRequest}
          attributionControl={false}
          maxPitch={0}
          minZoom={1.5}
          maxZoom={12}
        />
      </DeckGL>
    </div>
  )
}
export default FlightMap

