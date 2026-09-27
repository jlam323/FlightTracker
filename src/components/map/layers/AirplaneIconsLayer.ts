import { IconLayer } from '@deck.gl/layers'
import { Flight } from '../../../types/flight'
import { PALETTE } from '../../../constants/palette'
import { AIRPLANE_ICON_ATLAS, AIRPLANE_ICON_MAPPING } from '../mapConstants'
import { getFlightPosition, createFlightSearchMatcher, shouldRenderFlight } from './layerUtils'

export interface AirplaneIconsLayerProps {
  flights: Flight[]
  selectedFlightId?: string
  hoveredFlightId: string | null
  pinnedSet: Set<string>
  bearing: number
  searchQuery?: string
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
  onClickFlight,
  onHoverFlight,
}: AirplaneIconsLayerProps): IconLayer<Flight> {
  const isSearchMatch = createFlightSearchMatcher(searchQuery)
  const visibleFlights = flights.filter(f =>
    shouldRenderFlight(f, selectedFlightId, pinnedSet, isSearchMatch)
  )

  return new IconLayer<Flight>({
    id: 'flights-aircraft-icons',
    data: visibleFlights,
    iconAtlas: AIRPLANE_ICON_ATLAS,
    iconMapping: AIRPLANE_ICON_MAPPING,
    getIcon: () => 'airplane',
    getPosition: getFlightPosition,
    getSize: d => {
      if (d.id === selectedFlightId || isSearchMatch(d)) return 34
      if (d.id === hoveredFlightId || pinnedSet.has(d.id)) return 28
      if (d.onGround) return 20
      return 24
    },
    sizeUnits: 'pixels',
    sizeMinPixels: 16,
    sizeMaxPixels: 46,
    getAngle: d => (360 - d.heading + bearing) % 360,
    getColor: d => {
      if (d.id === selectedFlightId || d.id === hoveredFlightId || isSearchMatch(d)) return PALETTE.YELLOW
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
      getPosition: [selectedFlightId, searchQuery],
      getSize: [selectedFlightId, hoveredFlightId, searchQuery, pinnedSet],
      getColor: [selectedFlightId, hoveredFlightId, searchQuery, pinnedSet],
      getAngle: [bearing],
    },
  })
}
