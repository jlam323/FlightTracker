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
  onClickFlight?: (info: { object?: unknown }) => void
  onHoverFlight?: (info: { object?: unknown }) => void
}

export function createAirplaneIconsLayer({
  flights,
  selectedFlightId,
  hoveredFlightId,
  pinnedSet,
  bearing,
  onClickFlight,
  onHoverFlight,
}: AirplaneIconsLayerProps): IconLayer<Flight> {
  return new IconLayer<Flight>({
    id: 'flights-aircraft-icons',
    data: flights,
    iconAtlas: AIRPLANE_ICON_ATLAS,
    iconMapping: AIRPLANE_ICON_MAPPING,
    getIcon: () => 'airplane',
    getPosition: d => [d.longitude, d.latitude, 0],
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
      if (pinnedSet.has(d.id)) return PALETTE.AMBER
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
      getSize: [selectedFlightId, hoveredFlightId],
      getColor: [selectedFlightId, hoveredFlightId],
      getAngle: [bearing],
    },
  })
}
