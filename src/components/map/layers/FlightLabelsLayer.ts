import { TextLayer } from '@deck.gl/layers'
import { Flight } from '../../../types/flight'
import { PALETTE } from '../../../constants/palette'
import { getFlightPosition, createFlightSearchMatcher, isFlightHighlighted } from './layerUtils'

export interface FlightLabelsLayerProps {
  flights: Flight[]
  shouldShowFlightLabels: boolean
  selectedFlightId?: string
  hoveredFlightId: string | null
  pinnedSet: Set<string>
  searchQuery?: string
  onClickFlight?: (info: { object?: unknown }) => void
  onHoverFlight?: (info: { object?: unknown }) => void
}

export function createFlightLabelsLayer({
  flights,
  shouldShowFlightLabels,
  selectedFlightId,
  hoveredFlightId,
  pinnedSet,
  searchQuery,
  onClickFlight,
  onHoverFlight,
}: FlightLabelsLayerProps): TextLayer<Flight> | null {
  const isSearchMatch = createFlightSearchMatcher(searchQuery)

  const labelFlights = flights.filter(f => {
    if (f.id === hoveredFlightId || isFlightHighlighted(f, selectedFlightId, pinnedSet, isSearchMatch)) {
      return true
    }
    if (f.onGround) return false
    return shouldShowFlightLabels
  })

  if (labelFlights.length === 0) return null

  return new TextLayer<Flight>({
    id: 'flights-labels',
    data: labelFlights,
    getPosition: getFlightPosition,
    getText: d => d.flightNumber,
    getSize: 12,
    getColor: d => {
      if (d.id === selectedFlightId || d.id === hoveredFlightId || isSearchMatch(d)) return PALETTE.YELLOW
      return PALETTE.TEXT_DEFAULT
    },
    getTextAnchor: 'middle',
    getAlignmentBaseline: 'top',
    getPixelOffset: d => {
      if (d.id === selectedFlightId || isSearchMatch(d)) return [0, 20]
      if (d.id === hoveredFlightId) return [0, 18]
      return [0, 16]
    },
    fontFamily: 'monospace',
    fontWeight: 'bold',
    background: true,
    getBackgroundColor: PALETTE.DARK_BG,
    backgroundPadding: [4, 2],
    pickable: true,
    onClick: onClickFlight,
    onHover: onHoverFlight,
    parameters: { depthCompare: 'always' as const, depthWriteEnabled: false },
    updateTriggers: {
      getPosition: [selectedFlightId, searchQuery],
      getColor: [selectedFlightId, hoveredFlightId, searchQuery],
      getPixelOffset: [selectedFlightId, hoveredFlightId, searchQuery],
    },
  })
}
