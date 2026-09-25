import { TextLayer } from '@deck.gl/layers'
import { Airport, Flight } from '../../../types/flight'
import { ALL_AIRPORTS } from '../../../data/airports'
import { PALETTE } from '../../../constants/palette'
import { MAJOR_HUB_IATAS } from '../mapConstants'
import { getAirportColor } from './airportColor'

export interface AirportLabelsLayerProps {
  airports?: Airport[]
  showAirportCodes: boolean
  zoom: number
  selectedAirportCode?: string
  selectedAirportIatas: Set<string>
  hoveredAirportIata: string | null
  selectedFlight: Flight | null
  onClickAirport?: (info: { object?: unknown }) => void
  onHoverAirport?: (info: { object?: unknown }) => void
}

export function createAirportLabelsLayer({
  airports = ALL_AIRPORTS,
  showAirportCodes,
  zoom,
  selectedAirportCode,
  selectedAirportIatas,
  hoveredAirportIata,
  selectedFlight,
  onClickAirport,
  onHoverAirport,
}: AirportLabelsLayerProps): TextLayer<Airport> | null {
  const visibleAirports = airports.filter(a => {
    // Endpoints of selected flight or active hub filter are always shown
    if (selectedAirportIatas.has(a.iata)) return true
    if (!showAirportCodes) return false
    if (MAJOR_HUB_IATAS.has(a.iata)) return true
    if (zoom >= 6.0) return true
    if (zoom >= 4.8 && (a.country === 'US' || a.country === 'CA')) return true
    return false
  })

  if (visibleAirports.length === 0) return null

  const colorContext = {
    hoveredAirportIata,
    selectedFlight,
    selectedAirportCode,
  }

  return new TextLayer<Airport>({
    id: 'airports-labels',
    data: visibleAirports,
    getPosition: d => [d.longitude, d.latitude, 0],
    getText: d => d.iata,
    getSize: d => (selectedAirportIatas.has(d.iata) ? 12 : 10),
    getColor: d => getAirportColor(d.iata, false, colorContext),
    getTextAnchor: 'middle',
    getAlignmentBaseline: 'top',
    getPixelOffset: [0, 8],
    fontFamily: 'monospace',
    fontWeight: 'bold',
    background: true,
    getBackgroundColor: PALETTE.DARK_BG,
    backgroundPadding: [3, 1],
    pickable: true,
    onClick: onClickAirport,
    onHover: onHoverAirport,
    parameters: { depthCompare: 'always' as const, depthWriteEnabled: false },
    updateTriggers: {
      getSize: [selectedAirportIatas],
      getColor: [selectedFlight?.originIata, selectedFlight?.destIata, selectedAirportCode, hoveredAirportIata],
    },
  })
}
