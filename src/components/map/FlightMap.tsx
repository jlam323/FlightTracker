import React, { useMemo } from 'react'
import DeckGL from '@deck.gl/react'
import { ArcLayer, ScatterplotLayer, TextLayer } from '@deck.gl/layers'
import Map from 'react-map-gl/maplibre'
import 'maplibre-gl/dist/maplibre-gl.css'
import { Flight, FlightArc } from '../../types/flight'

const CARTO_DARK_BASEMAP = 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json'

interface FlightMapProps {
  flights: Flight[]
  arcs: FlightArc[]
  selectedFlightId?: string
  pinnedFlightIds: string[]
  onSelectFlight: (flight: Flight) => void
  viewState: {
    longitude: number
    latitude: number
    zoom: number
    pitch: number
    bearing: number
  }
  onViewStateChange: (viewState: any) => void
}

export const FlightMap: React.FC<FlightMapProps> = ({
  flights,
  arcs,
  selectedFlightId,
  pinnedFlightIds,
  onSelectFlight,
  viewState,
  onViewStateChange,
}) => {
  const pinnedSet = useMemo(() => new Set(pinnedFlightIds), [pinnedFlightIds])

  // 1. Great-Circle 3D Arcs Layer (Flown and Remaining segments)
  const arcLayers = useMemo(() => {
    // Flown segment (Origin -> Current position)
    const flownLayer = new ArcLayer<FlightArc>({
      id: 'arcs-flown',
      data: arcs,
      getSourcePosition: d => d.flownSource,
      getTargetPosition: d => d.flownTarget,
      getSourceColor: d => (d.flightId === selectedFlightId ? [56, 189, 248, 255] : [56, 189, 248, 45]),
      getTargetColor: d => (d.flightId === selectedFlightId ? [16, 185, 129, 255] : [16, 185, 129, 65]),
      getWidth: d => (d.flightId === selectedFlightId ? 3.5 : 1.2),
      getHeight: 0.25,
      pickable: false,
      updateTriggers: {
        getSourceColor: [selectedFlightId],
        getTargetColor: [selectedFlightId],
        getWidth: [selectedFlightId],
      },
    })

    // Remaining segment (Current position -> Destination)
    const remLayer = new ArcLayer<FlightArc>({
      id: 'arcs-remaining',
      data: arcs,
      getSourcePosition: d => d.remSource,
      getTargetPosition: d => d.remTarget,
      getSourceColor: d => (d.flightId === selectedFlightId ? [16, 185, 129, 255] : [148, 163, 184, 30]),
      getTargetColor: d => (d.flightId === selectedFlightId ? [244, 63, 94, 255] : [148, 163, 184, 20]),
      getWidth: d => (d.flightId === selectedFlightId ? 3.5 : 0.8),
      getHeight: 0.25,
      pickable: false,
      updateTriggers: {
        getSourceColor: [selectedFlightId],
        getTargetColor: [selectedFlightId],
        getWidth: [selectedFlightId],
      },
    })

    return [flownLayer, remLayer]
  }, [arcs, selectedFlightId])

  // 2. Flight Position Markers
  const flightLayer = useMemo(() => {
    return new ScatterplotLayer<Flight>({
      id: 'flights-points',
      data: flights,
      getPosition: d => [d.longitude, d.latitude, d.altitude * 0.3048],
      getRadius: d => {
        if (d.id === selectedFlightId) return 18000
        if (pinnedSet.has(d.id)) return 14000
        return 7000
      },
      getFillColor: d => {
        if (d.id === selectedFlightId) return [250, 204, 21, 255] // Yellow highlighted
        if (pinnedSet.has(d.id)) return [245, 158, 11, 240] // Amber pinned
        if (d.onGround) return [100, 116, 139, 180] // Gray ground
        if (d.altitude > 30000) return [56, 189, 248, 220] // Cyan cruise
        if (d.altitude > 10000) return [129, 140, 248, 220] // Indigo climb
        return [52, 211, 153, 220] // Emerald low
      },
      getLineColor: [255, 255, 255, 200],
      lineWidthMinPixels: 1,
      stroked: true,
      radiusMinPixels: 4,
      radiusMaxPixels: 18,
      pickable: true,
      onClick: info => {
        if (info.object) {
          onSelectFlight(info.object as Flight)
        }
      },
      updateTriggers: {
        getRadius: [selectedFlightId, pinnedFlightIds],
        getFillColor: [selectedFlightId, pinnedFlightIds],
      },
    })
  }, [flights, selectedFlightId, pinnedFlightIds, onSelectFlight, pinnedSet])

  // 3. Flight Label Layer (Flight numbers shown at zoom >= 5)
  const textLayer = useMemo(() => {
    if (viewState.zoom < 5) return null

    return new TextLayer<Flight>({
      id: 'flights-labels',
      data: flights,
      getPosition: d => [d.longitude, d.latitude],
      getText: d => d.flightNumber,
      getSize: 11,
      getColor: [243, 244, 246, 230],
      getTextAnchor: 'start',
      getAlignmentBaseline: 'center',
      getPixelOffset: [12, 0],
      fontFamily: 'monospace',
      fontWeight: 'bold',
      background: true,
      getBackgroundColor: [15, 23, 42, 190],
      backgroundPadding: [3, 1],
    })
  }, [flights, viewState.zoom])

  const layers = useMemo(() => {
    return [...arcLayers, flightLayer, ...(textLayer ? [textLayer] : [])]
  }, [arcLayers, flightLayer, textLayer])

  return (
    <div className="relative w-full h-full">
      <DeckGL
        viewState={viewState}
        onViewStateChange={e => onViewStateChange(e.viewState)}
        controller={{ doubleClickZoom: false, dragRotate: true }}
        layers={layers}
        getTooltip={({ object }: any) => {
          if (!object || !object.flightNumber) return null
          const f = object as Flight
          return {
            html: `
              <div style="font-family: ui-monospace, monospace; font-size: 11px; padding: 4px 6px; background: rgba(15, 23, 42, 0.95); border: 1px solid rgba(56, 189, 248, 0.4); border-radius: 6px; color: #f8fafc;">
                <div style="font-weight: bold; color: #38bdf8;">${f.flightNumber} (${f.callsign})</div>
                <div>${f.originIata || '---'} → ${f.destIata || '---'}</div>
                <div style="color: #94a3b8;">Alt: ${f.altitude.toLocaleString()} ft | Spd: ${f.speed} kts</div>
              </div>
            `,
          }
        }}
      >
        <Map
          mapLib={import('maplibre-gl')}
          mapStyle={CARTO_DARK_BASEMAP}
          reuseMaps
          attributionControl={false}
        />
      </DeckGL>
    </div>
  )
}
