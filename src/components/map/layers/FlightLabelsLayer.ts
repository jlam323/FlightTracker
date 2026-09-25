import { TextLayer } from '@deck.gl/layers'
import { Flight } from '../../../types/flight'
import { PALETTE } from '../../../constants/palette'

export interface FlightLabelsLayerProps {
  flights: Flight[]
  shouldShowFlightLabels: boolean
  selectedFlightId?: string
  hoveredFlightId: string | null
  pinnedSet: Set<string>
  searchQuery?: string
  selectedAirportCode?: string
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
  selectedAirportCode,
  onClickFlight,
  onHoverFlight,
}: FlightLabelsLayerProps): TextLayer<Flight> | null {
  const hasSearch = Boolean(searchQuery?.trim())
  const cleanQuery = hasSearch ? searchQuery!.trim().toUpperCase() : ''
  const cleanAirport = selectedAirportCode?.trim().toUpperCase()

  const labelFlights = flights.filter(f => {
    const matchesSearch = hasSearch && (
      f.flightNumber.toUpperCase().includes(cleanQuery) ||
      f.callsign.toUpperCase().includes(cleanQuery) ||
      Boolean(f.registration?.toUpperCase().includes(cleanQuery)) ||
      f.id.toUpperCase().includes(cleanQuery)
    )

    const matchesAirport = cleanAirport && (
      f.originIata?.toUpperCase() === cleanAirport ||
      f.destIata?.toUpperCase() === cleanAirport ||
      f.originAirport?.iata.toUpperCase() === cleanAirport ||
      f.destAirport?.iata.toUpperCase() === cleanAirport
    )

    if (f.onGround && f.id !== selectedFlightId && !matchesSearch && !pinnedSet.has(f.id) && !matchesAirport) return false
    if (matchesSearch) return true
    if (f.id === selectedFlightId || f.id === hoveredFlightId || pinnedSet.has(f.id)) return true
    if (matchesAirport) return shouldShowFlightLabels
    if (shouldShowFlightLabels) return true
    return false
  })

  if (labelFlights.length === 0) return null

  return new TextLayer<Flight>({
    id: 'flights-labels',
    data: labelFlights,
    getPosition: d => {
      if (d.onGround) {
        const airport = d.originAirport || d.destAirport
        if (airport) {
          return [airport.longitude, airport.latitude, 0]
        }
      }
      return [d.longitude, d.latitude, 0]
    },
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
      getPosition: [selectedFlightId, searchQuery],
      getColor: [selectedFlightId, hoveredFlightId],
      getPixelOffset: [selectedFlightId, hoveredFlightId],
    },
  })
}
