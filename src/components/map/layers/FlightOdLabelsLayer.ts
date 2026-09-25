import { TextLayer } from '@deck.gl/layers'
import { Flight } from '../../../types/flight'
import { PALETTE } from '../../../constants/palette'

export interface FlightOdLabelsLayerProps {
  flights: Flight[]
  selectedFlightId?: string
  hoveredFlightId: string | null
  onClickFlight?: (info: { object?: unknown }) => void
  onHoverFlight?: (info: { object?: unknown }) => void
}

// Pre-bake all printable ASCII characters (32..126) plus Unicode rightwards arrow into Deck.gl font atlas
const OD_CHARACTER_SET = [
  ...Array.from({ length: 95 }, (_, i) => String.fromCharCode(32 + i)),
  '→',
]

export function createFlightOdLabelsLayer({
  flights,
  selectedFlightId,
  hoveredFlightId,
  onClickFlight,
  onHoverFlight,
}: FlightOdLabelsLayerProps): TextLayer<Flight & { odText: string }> | null {
  const targetFlights = flights.filter(
    f => f.id === hoveredFlightId || f.id === selectedFlightId
  )
  if (targetFlights.length === 0) return null

  const data = targetFlights
    .map(f => {
      const orig = f.originIata || f.originAirport?.iata || null
      const dest = f.destIata || f.destAirport?.iata || null
      if (!orig && !dest) return null
      return {
        ...f,
        odText: `${orig || '---'} → ${dest || '---'}`,
      }
    })
    .filter((item): item is Flight & { odText: string } => item !== null)

  if (data.length === 0) return null

  return new TextLayer<Flight & { odText: string }>({
    id: 'flights-od-labels',
    data,
    getPosition: d => [d.longitude, d.latitude, 0],
    getText: d => d.odText,
    getSize: 12,
    getColor: PALETTE.TEXT_OD,
    getTextAnchor: 'middle',
    getAlignmentBaseline: 'top',
    getPixelOffset: d => (d.id === selectedFlightId ? [0, 38] : [0, 36]),
    characterSet: OD_CHARACTER_SET,
    fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Segoe UI Symbol", "Apple Symbols", monospace',
    fontWeight: 'bold',
    fontSettings: { buffer: 6 },
    background: true,
    getBackgroundColor: PALETTE.DARK_BG_DEEP,
    backgroundPadding: [4, 2],
    pickable: true,
    onClick: onClickFlight,
    onHover: onHoverFlight,
    parameters: { depthCompare: 'always' as const, depthWriteEnabled: false },
    updateTriggers: {
      getPixelOffset: [selectedFlightId, hoveredFlightId],
    },
  })
}
