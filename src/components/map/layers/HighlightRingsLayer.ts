import { ScatterplotLayer } from '@deck.gl/layers'
import { Flight } from '../../../types/flight'
import { PALETTE } from '../../../constants/palette'
import { getFlightPosition, createFlightSearchMatcher, isFlightHighlighted } from './layerUtils'

export interface HighlightRingsLayerProps {
  flights: Flight[]
  selectedFlightId?: string
  pinnedSet: Set<string>
  searchQuery?: string
}

export function createHighlightRingsLayer({
  flights,
  selectedFlightId,
  pinnedSet,
  searchQuery,
}: HighlightRingsLayerProps): ScatterplotLayer<Flight> | null {
  const isSearchMatch = createFlightSearchMatcher(searchQuery)

  const highlightedFlights = flights.filter(f =>
    isFlightHighlighted(f, selectedFlightId, pinnedSet, isSearchMatch)
  )
  if (highlightedFlights.length === 0) return null

  return new ScatterplotLayer<Flight>({
    id: 'flights-selection-rings',
    data: highlightedFlights,
    getPosition: getFlightPosition,
    getRadius: d => (d.id === selectedFlightId || isSearchMatch(d) ? 16000 : 12000),
    getFillColor: d => (d.id === selectedFlightId || isSearchMatch(d) ? PALETTE.YELLOW_GLOW_FILL : PALETTE.AMBER_GLOW_FILL),
    getLineColor: d => (d.id === selectedFlightId || isSearchMatch(d) ? PALETTE.YELLOW_GLOW_LINE : PALETTE.AMBER_GLOW_LINE),
    lineWidthMinPixels: 2,
    stroked: true,
    filled: true,
    radiusMinPixels: 18,
    radiusMaxPixels: 38,
    pickable: false,
    parameters: { depthCompare: 'always' as const, depthWriteEnabled: false },
    updateTriggers: {
      getPosition: [selectedFlightId, searchQuery],
      getRadius: [selectedFlightId, searchQuery],
      getFillColor: [selectedFlightId, searchQuery],
      getLineColor: [selectedFlightId, searchQuery],
    },
  })
}
