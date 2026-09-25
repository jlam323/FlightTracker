import { IconLayer } from '@deck.gl/layers'
import { Flight } from '../../../types/flight'
import { PALETTE } from '../../../constants/palette'
import { AIRPLANE_ICON_ATLAS, AIRPLANE_ICON_MAPPING } from '../mapConstants'

export interface AirplaneIconsLayerProps {
  flights: Flight[]
  selectedFlightId?: string
  hoveredFlightId: string | null
  pinnedSet: Set<string>
  bearing: number
  searchQuery?: string
  selectedAirportCode?: string
  onClickFlight?: (info: { object?: unknown }) => void
  onHoverFlight?: (info: { object?: unknown }) => void
}

export function createAirplaneIconsLayer({
  flights,
  selectedFlightId,
  hoveredFlightId,
  pinnedSet,
  bearing,
  searchQuery,
  selectedAirportCode,
  onClickFlight,
  onHoverFlight,
}: AirplaneIconsLayerProps): IconLayer<Flight> {
  const hasSearch = Boolean(searchQuery?.trim())
  const cleanQuery = hasSearch ? searchQuery!.trim().toUpperCase() : ''
  const cleanAirport = selectedAirportCode?.trim().toUpperCase()

  const visibleFlights = flights.filter(f => {
    if (!f.onGround || f.id === selectedFlightId || pinnedSet.has(f.id)) return true
    if (cleanAirport) {
      if (
        f.originIata?.toUpperCase() === cleanAirport ||
        f.destIata?.toUpperCase() === cleanAirport ||
        f.originAirport?.iata.toUpperCase() === cleanAirport ||
        f.destAirport?.iata.toUpperCase() === cleanAirport
      ) {
        return true
      }
    }
    if (hasSearch) {
      return (
        f.flightNumber.toUpperCase().includes(cleanQuery) ||
        f.callsign.toUpperCase().includes(cleanQuery) ||
        Boolean(f.registration?.toUpperCase().includes(cleanQuery)) ||
        f.id.toUpperCase().includes(cleanQuery)
      )
    }
    return false
  })

  return new IconLayer<Flight>({
    id: 'flights-aircraft-icons',
    data: visibleFlights,
    iconAtlas: AIRPLANE_ICON_ATLAS,
    iconMapping: AIRPLANE_ICON_MAPPING,
    getIcon: () => 'airplane',
    getPosition: d => {
      if (d.onGround) {
        const airport = d.originAirport || d.destAirport
        if (airport) {
          return [airport.longitude, airport.latitude, 0]
        }
      }
      return [d.longitude, d.latitude, 0]
    },
    getSize: d => {
      if (d.id === selectedFlightId) return 34
      if (d.id === hoveredFlightId) return 28
      if (pinnedSet.has(d.id)) return 28
      return 24
    },
    sizeUnits: 'pixels',
    sizeMinPixels: 18,
    sizeMaxPixels: 46,
    getAngle: d => (360 - d.heading + bearing) % 360,
    getColor: d => {
      if (d.id === selectedFlightId || d.id === hoveredFlightId) return PALETTE.YELLOW
      if (pinnedSet.has(d.id)) return d.lastKnown ? [245, 158, 11, 200] : PALETTE.AMBER
      if (d.onGround) return PALETTE.SLATE_GROUND
      if (d.altitude > 30000) return PALETTE.CYAN
      if (d.altitude > 10000) return PALETTE.INDIGO
      return PALETTE.EMERALD
    },
    pickable: true,
    parameters: { depthCompare: 'always' as const, depthWriteEnabled: false },
    onClick: onClickFlight,
    onHover: onHoverFlight,
    updateTriggers: {
      getPosition: [selectedFlightId, searchQuery, selectedAirportCode],
      getSize: [selectedFlightId, hoveredFlightId],
      getColor: [selectedFlightId, hoveredFlightId, searchQuery, selectedAirportCode],
      getAngle: [bearing],
    },
  })
}
