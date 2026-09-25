import React, { useMemo, useState, useCallback } from 'react'
import DeckGL from '@deck.gl/react'
import { WebMercatorViewport } from '@deck.gl/core'
import Map from 'react-map-gl/maplibre'
import * as maplibregl from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import { Flight, FlightArc, Airport } from '../../types/flight'
import { CARTO_DARK_RASTER_STYLE, CARTO_API_KEY } from './mapConstants'
import {
  createRouteArcsLayer,
  createAirportDotsLayer,
  createAirportLabelsLayer,
  createHighlightRingsLayer,
  createAirplaneIconsLayer,
  createFlightLabelsLayer,
  createFlightOdLabelsLayer,
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
      const [minLon, minLat, maxLon, maxLat] = vp.getBounds()

      let count = 0
      for (const f of flights) {
        const inLon =
          minLon <= maxLon
            ? f.longitude >= minLon && f.longitude <= maxLon
            : f.longitude >= minLon || f.longitude <= maxLon
        if (inLon && f.latitude >= minLat && f.latitude <= maxLat) {
          count++
        }
      }
      return count
    } catch {
      return flights.length
    }
  }, [flights, viewState.longitude, viewState.latitude, viewState.zoom, viewState.bearing])

  // Dynamically scale max aircraft allowed for displaying flight IDs with zoom level
  const maxPlanesForLabels = useMemo(() => {
    const clampedZoom = Math.max(3.0, Math.min(8.5, viewState.zoom))
    return Math.round(35 + Math.pow((clampedZoom - 3.0) / 5.5, 1.4) * 465)
  }, [viewState.zoom])

  const isLowAirplaneDensity = visibleFlightCount <= maxPlanesForLabels
  const shouldShowFlightLabels = hasActiveFilter || isLowAirplaneDensity

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
    const arcLayer = createRouteArcsLayer({
      arcs: sortedArcs,
      selectedFlightId,
    })

    const airportDotsLayer = createAirportDotsLayer({
      selectedAirportCode,
      selectedAirportIatas,
      hoveredAirportIata,
      selectedFlight,
      onClickAirport: handleAirportClick,
      onHoverAirport: handleAirportHover,
    })

    const airportLabelsLayer = createAirportLabelsLayer({
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
      flights,
      selectedFlightId,
      pinnedSet,
    })

    const airplaneIconLayer = createAirplaneIconsLayer({
      flights: sortedFlights,
      selectedFlightId,
      hoveredFlightId,
      pinnedSet,
      bearing: viewState.bearing,
      onClickFlight: handleFlightClick,
      onHoverFlight: handleFlightHover,
    })

    const textLayer = createFlightLabelsLayer({
      flights: sortedFlights,
      shouldShowFlightLabels,
      selectedFlightId,
      hoveredFlightId,
      pinnedSet,
      onClickFlight: handleFlightClick,
      onHoverFlight: handleFlightHover,
    })

    const flightOdLayer = createFlightOdLabelsLayer({
      flights: sortedFlights,
      selectedFlightId,
      hoveredFlightId,
      onClickFlight: handleFlightClick,
      onHoverFlight: handleFlightHover,
    })

    return [
      arcLayer,
      airportDotsLayer,
      ...(airportLabelsLayer ? [airportLabelsLayer] : []),
      ...(highlightRingLayer ? [highlightRingLayer] : []),
      airplaneIconLayer,
      ...(textLayer ? [textLayer] : []),
      ...(flightOdLayer ? [flightOdLayer] : []),
    ]
  }, [
    sortedArcs,
    selectedFlightId,
    selectedAirportCode,
    selectedAirportIatas,
    hoveredAirportIata,
    selectedFlight,
    showAirportCodes,
    viewState.zoom,
    viewState.bearing,
    flights,
    pinnedSet,
    sortedFlights,
    hoveredFlightId,
    shouldShowFlightLabels,
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
            const originStr = f.originIata || f.originAirport?.iata || '---'
            const destStr = f.destIata || f.destAirport?.iata || '---'
            return {
              html: `
                <div style="font-family: ui-monospace, monospace; font-size: 11px; line-height: 1.4; padding: 5px 8px; background: rgba(15, 23, 42, 0.95); border: 1px solid rgba(250, 204, 21, 0.6); border-radius: 6px; box-shadow: 0 4px 14px rgba(0, 0, 0, 0.6);">
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
export default FlightMap
