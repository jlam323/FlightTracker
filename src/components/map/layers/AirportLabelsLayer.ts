import { TextLayer } from '@deck.gl/layers'
import { Airport, Flight } from '../../../types/flight'
import { ALL_AIRPORTS } from '../../../data/airports'
import { PALETTE, ColorRGBA } from '../../../constants/palette'
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

  const cleanSelectedAirport = selectedAirportCode?.toUpperCase()

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
    getSize: d => (selectedAirportIatas.has(d.iata) || d.iata === hoveredAirportIata ? 12 : 11),
    getColor: d => getAirportColor(d.iata, false, colorContext),
    getTextAnchor: 'middle',
    getAlignmentBaseline: 'bottom',
    // Position cleanly above the airport dot so it never collides with airplanes or flight labels below
    getPixelOffset: [0, -9],
    fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
    fontWeight: 'bold',
    background: true,
    getBackgroundColor: d => {
      if (d.iata === hoveredAirportIata) return [15, 23, 42, 245] as ColorRGBA
      if (cleanSelectedAirport && d.iata === cleanSelectedAirport) return [15, 23, 42, 240] as ColorRGBA
      return [15, 23, 42, 215] as ColorRGBA
    },
    getBorderColor: d => {
      if (d.iata === hoveredAirportIata) return PALETTE.WHITE_RIM
      if (cleanSelectedAirport && d.iata === cleanSelectedAirport) return PALETTE.YELLOW
      if (selectedAirportIatas.has(d.iata)) return PALETTE.CYAN
      return [56, 189, 248, 140] as ColorRGBA // Crisp cyan pill badge border
    },
    getBorderWidth: 1,
    backgroundBorderRadius: 4,
    backgroundPadding: [5, 2],
    pickable: true,
    onClick: onClickAirport,
    onHover: onHoverAirport,
    parameters: { depthCompare: 'always' as const, depthWriteEnabled: false },
    updateTriggers: {
      getSize: [selectedAirportIatas, hoveredAirportIata],
      getColor: [selectedFlight?.originIata, selectedFlight?.destIata, selectedAirportCode, hoveredAirportIata],
      getBorderColor: [selectedAirportIatas, selectedAirportCode, hoveredAirportIata],
      getBackgroundColor: [hoveredAirportIata, selectedAirportCode],
    },
  })
}
