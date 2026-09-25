import { ScatterplotLayer } from '@deck.gl/layers'
import { Airport, Flight } from '../../../types/flight'
import { ALL_AIRPORTS } from '../../../data/airports'
import { PALETTE } from '../../../constants/palette'
import { getAirportColor } from './airportColor'

export interface AirportDotsLayerProps {
  airports?: Airport[]
  selectedAirportCode?: string
  selectedAirportIatas: Set<string>
  hoveredAirportIata: string | null
  selectedFlight: Flight | null
  onClickAirport?: (info: { object?: unknown }) => void
  onHoverAirport?: (info: { object?: unknown }) => void
}

export function createAirportDotsLayer({
  airports = ALL_AIRPORTS,
  selectedAirportCode,
  selectedAirportIatas,
  hoveredAirportIata,
  selectedFlight,
  onClickAirport,
  onHoverAirport,
}: AirportDotsLayerProps): ScatterplotLayer<Airport> {
  const colorContext = {
    hoveredAirportIata,
    selectedFlight,
    selectedAirportCode,
  }

  return new ScatterplotLayer<Airport>({
    id: 'airports-dots',
    data: airports,
    getPosition: d => [d.longitude, d.latitude, 0],
    getRadius: d => {
      if (selectedAirportCode && d.iata === selectedAirportCode.toUpperCase()) return 16000
      if (selectedAirportIatas.has(d.iata)) return 14000
      if (d.iata === hoveredAirportIata) return 9000
      return 4500
    },
    getFillColor: d => getAirportColor(d.iata, true, colorContext),
    getLineColor: d => {
      if (
        d.iata === hoveredAirportIata ||
        (selectedAirportCode && d.iata === selectedAirportCode.toUpperCase()) ||
        selectedAirportIatas.has(d.iata)
      ) {
        return PALETTE.WHITE_RIM
      }
      return PALETTE.DARK_RIM
    },
    lineWidthMinPixels: 1.2,
    stroked: true,
    radiusMinPixels: 3.5,
    radiusMaxPixels: 11,
    pickable: true,
    parameters: { depthCompare: 'always' as const, depthWriteEnabled: false },
    onClick: onClickAirport,
    onHover: onHoverAirport,
    updateTriggers: {
      getRadius: [selectedAirportIatas, selectedAirportCode, hoveredAirportIata],
      getFillColor: [selectedFlight?.originIata, selectedFlight?.destIata, selectedAirportCode, hoveredAirportIata],
      getLineColor: [selectedAirportIatas, selectedAirportCode, hoveredAirportIata],
    },
  })
}
