import { ScatterplotLayer } from '@deck.gl/layers'
import { Flight } from '../../../types/flight'
import { PALETTE } from '../../../constants/palette'

export interface HighlightRingsLayerProps {
  flights: Flight[]
  selectedFlightId?: string
  pinnedSet: Set<string>
}

export function createHighlightRingsLayer({
  flights,
  selectedFlightId,
  pinnedSet,
}: HighlightRingsLayerProps): ScatterplotLayer<Flight> | null {
  const highlightedFlights = flights.filter(
    f => f.id === selectedFlightId || pinnedSet.has(f.id)
  )
  if (highlightedFlights.length === 0) return null

  return new ScatterplotLayer<Flight>({
    id: 'flights-selection-rings',
    data: highlightedFlights,
    getPosition: d => {
      if (d.onGround) {
        const airport = d.originAirport || d.destAirport
        if (airport) {
          return [airport.longitude, airport.latitude, 0]
        }
      }
      return [d.longitude, d.latitude, 0]
    },
    getRadius: d => (d.id === selectedFlightId ? 16000 : 12000),
    getFillColor: d => (d.id === selectedFlightId ? PALETTE.YELLOW_GLOW_FILL : PALETTE.AMBER_GLOW_FILL),
    getLineColor: d => (d.id === selectedFlightId ? PALETTE.YELLOW_GLOW_LINE : PALETTE.AMBER_GLOW_LINE),
    lineWidthMinPixels: 2,
    stroked: true,
    filled: true,
    radiusMinPixels: 18,
    radiusMaxPixels: 38,
    pickable: false,
    parameters: { depthCompare: 'always' as const, depthWriteEnabled: false },
    updateTriggers: {
      getPosition: [selectedFlightId],
    },
  })
}
