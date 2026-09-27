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
  zoom?: number
  onClickAirport?: (info: { object?: unknown }) => void
  onHoverAirport?: (info: { object?: unknown }) => void
}

export function createAirportDotsLayer({
  airports = ALL_AIRPORTS,
  selectedAirportCode,
  selectedAirportIatas,
  hoveredAirportIata,
  selectedFlight,
  zoom = 4,
  onClickAirport,
  onHoverAirport,
}: AirportDotsLayerProps): ScatterplotLayer<Airport> {
  const colorContext = {
    hoveredAirportIata,
    selectedFlight,
    selectedAirportCode,
  }

  const cleanSelectedAirport = selectedAirportCode?.toUpperCase()
  const isHighlightedAirport = (iata: string) => iata === hoveredAirportIata || selectedAirportIatas.has(iata)

  const clampedZoom = Math.max(1.5, Math.min(12, zoom))
  // Dynamically scale airport dot minimum & maximum pixel radius as the user zooms in
  const radiusMinPixels = Math.max(3.5, Math.min(8.5, 3.5 + Math.max(0, clampedZoom - 4) * 0.75))
  const radiusMaxPixels = Math.max(7, Math.min(18, 7 + Math.max(0, clampedZoom - 4) * 1.5))

  return new ScatterplotLayer<Airport>({
    id: 'airports-dots',
    data: airports,
    getPosition: d => [d.longitude, d.latitude, 0],
    getRadius: d => {
      if (cleanSelectedAirport && d.iata === cleanSelectedAirport) return 16000
      if (selectedAirportIatas.has(d.iata)) return 14000
      if (d.iata === hoveredAirportIata) return 9000
      return 4500
    },
    getFillColor: d => getAirportColor(d.iata, true, colorContext),
    getLineColor: d => (isHighlightedAirport(d.iata) ? PALETTE.WHITE_RIM : PALETTE.DARK_RIM),
    getLineWidth: d => (isHighlightedAirport(d.iata) ? 2.5 : 1.2),
    lineWidthMinPixels: 1.2,
    stroked: true,
    radiusMinPixels,
    radiusMaxPixels,
    pickable: true,
    parameters: { depthCompare: 'always' as const, depthWriteEnabled: false },
    onClick: onClickAirport,
    onHover: onHoverAirport,
    updateTriggers: {
      getRadius: [selectedAirportIatas, selectedAirportCode, hoveredAirportIata, clampedZoom],
      getFillColor: [selectedFlight?.originIata, selectedFlight?.destIata, selectedAirportCode, hoveredAirportIata],
      getLineColor: [selectedAirportIatas, selectedAirportCode, hoveredAirportIata],
      getLineWidth: [selectedAirportIatas, selectedAirportCode, hoveredAirportIata],
    },
  })
}
