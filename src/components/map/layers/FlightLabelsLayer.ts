import { TextLayer } from '@deck.gl/layers'
import { Flight } from '../../../types/flight'
import { PALETTE } from '../../../constants/palette'

export interface FlightLabelsLayerProps {
  flights: Flight[]
  shouldShowFlightLabels: boolean
  selectedFlightId?: string
  hoveredFlightId: string | null
  pinnedSet: Set<string>
  onClickFlight?: (info: { object?: unknown }) => void
  onHoverFlight?: (info: { object?: unknown }) => void
}

export function createFlightLabelsLayer({
  flights,
  shouldShowFlightLabels,
  selectedFlightId,
  hoveredFlightId,
  pinnedSet,
  onClickFlight,
  onHoverFlight,
}: FlightLabelsLayerProps): TextLayer<Flight> | null {
  const labelFlights = flights.filter(f => {
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
    getSize: 12,
    getColor: d => {
      if (d.id === selectedFlightId || d.id === hoveredFlightId) return PALETTE.YELLOW
      return PALETTE.TEXT_DEFAULT
    },
    getTextAnchor: 'middle',
    getAlignmentBaseline: 'top',
    getPixelOffset: d => {
      if (d.id === selectedFlightId) return [0, 20]
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
      getColor: [selectedFlightId, hoveredFlightId],
      getPixelOffset: [selectedFlightId, hoveredFlightId],
    },
  })
}
