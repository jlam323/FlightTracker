import { PALETTE, ColorRGBA } from '../../../constants/palette'
import { Flight } from '../../../types/flight'

export interface AirportColorContext {
  hoveredAirportIata: string | null
  selectedFlight: Flight | null
  selectedAirportCode?: string
}

/**
 * Resolves the display color for an airport marker or text label with strict precedence:
 * 1. Hovered -> Yellow
 * 2. Selected Flight Origin -> Cyan
 * 3. Selected Flight Destination -> Rose
 * 4. Active Filtered Hub -> Cyan
 * 5. Default -> Platinum Ice (dot) or Muted Slate (label)
 */
export function getAirportColor(
  iata: string,
  isDot: boolean,
  context: AirportColorContext
): ColorRGBA {
  if (iata === context.hoveredAirportIata) return PALETTE.YELLOW
  if (iata === context.selectedFlight?.originIata) return PALETTE.CYAN
  if (iata === context.selectedFlight?.destIata) return PALETTE.ROSE
  if (context.selectedAirportCode && iata === context.selectedAirportCode.toUpperCase()) {
    return PALETTE.CYAN
  }
  return isDot ? PALETTE.AIRPORT_DOT : PALETTE.TEXT_MUTED
}
